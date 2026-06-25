/**
 * stripe-checkout-credits — Edge Function
 *
 * Crée une session Stripe Checkout pour l'achat d'un pack de crédits.
 * Retourne l'URL hosted ; le SPA redirige le réparateur dessus.
 *
 * Le webhook `stripe-webhooks` (event `checkout.session.completed`) se
 * charge ensuite de créditer le wallet via la RPC `credit_credits`
 * (idempotente sur `stripe_session_id`).
 *
 * Packs (HT) :
 *   - decouverte :  49 € → 10 crédits
 *   - standard   : 129 € → 30 crédits
 *   - pro        : 379 € → 100 crédits
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { z } from "https://esm.sh/zod@3.23.8";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { withSentry, captureEdgeError } from "../_shared/sentry.ts";

const InputSchema = z.object({
  pack: z.enum(["decouverte", "standard", "pro"]),
});

const PACKS = {
  decouverte: { credits: 10, amount_cents: 4900, label: "Pack Découverte (10 crédits)" },
  standard: { credits: 30, amount_cents: 12900, label: "Pack Standard (30 crédits)" },
  pro: { credits: 100, amount_cents: 37900, label: "Pack Pro (100 crédits)" },
} as const;

serve(withSentry("stripe-checkout-credits", async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "method_not_allowed" }),
      { status: 405, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ success: false, error: "missing_auth" }),
      { status: 401, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response(
      JSON.stringify({ success: false, error: "stripe_not_configured" }),
      { status: 500, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  let input: z.infer<typeof InputSchema>;
  try {
    input = InputSchema.parse(await req.json());
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "invalid_input", details: String(err) }),
      { status: 400, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  // Auth + résolution du repairer.id depuis le user.id
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(
    authHeader.slice(7),
  );
  if (userError || !userData?.user) {
    return new Response(
      JSON.stringify({ success: false, error: "invalid_token" }),
      { status: 401, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  const userId = userData.user.id;
  const { data: repairer, error: repairerError } = await supabaseAdmin
    .from("repairers")
    .select("id, email")
    .eq("user_id", userId)
    .maybeSingle();

  if (repairerError || !repairer) {
    return new Response(
      JSON.stringify({ success: false, error: "repairer_not_found" }),
      { status: 403, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  const pack = PACKS[input.pack];
  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

  const origin = req.headers.get("origin") ?? "https://topreparateurs.fr";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: pack.label },
            unit_amount: pack.amount_cents,
          },
          quantity: 1,
        },
      ],
      customer_email: repairer.email ?? userData.user.email ?? undefined,
      success_url: `${origin}/pro/wallet?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pro/wallet?canceled=1`,
      metadata: {
        repairer_id: repairer.id,
        pack: input.pack,
        credits: String(pack.credits),
        kind: "credits_purchase",
      },
    });

    return new Response(
      JSON.stringify({ success: true, url: session.url, session_id: session.id }),
      { status: 200, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  } catch (err) {
    captureEdgeError(err, { functionName: "stripe-checkout-credits", errorCode: "stripe_failed" });
    return new Response(
      JSON.stringify({ success: false, error: "stripe_error" }),
      { status: 502, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }
}));

/**
 * lead-status-update — Edge Function
 *
 * Permet au réparateur de déclarer qu'il a contacté un client, conclu
 * la vente, ou abandonné. La RLS sur lead_deliveries garantit qu'il ne
 * peut MAJ que SES propres leads (via repairers.user_id = auth.uid()).
 *
 * Auth : verify_jwt = true (Bearer JWT du réparateur).
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { withSentry, captureEdgeError } from "../_shared/sentry.ts";

const InputSchema = z.object({
  lead_id: z.string().uuid(),
  status: z.enum(["delivered", "contacted", "converted", "lost"]),
  conversion_value_cents: z.number().int().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});

serve(withSentry("lead-status-update", async (req: Request) => {
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

  let input: z.infer<typeof InputSchema>;
  try {
    input = InputSchema.parse(await req.json());
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "invalid_input", details: String(err) }),
      { status: 400, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  // On utilise un client user-scopé : la RLS bloquera tout lead qui n'appartient
  // pas au réparateur courant. Pas besoin de re-vérifier l'ownership ici.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const update: Record<string, unknown> = {
    status: input.status,
    updated_at: new Date().toISOString(),
  };
  if (input.conversion_value_cents !== undefined) {
    update.conversion_value_cents = input.conversion_value_cents;
  }
  if (input.notes !== undefined) update.notes = input.notes;

  const { data, error } = await supabase
    .from("lead_deliveries")
    .update(update)
    .eq("id", input.lead_id)
    .select("id, status")
    .single();

  if (error) {
    captureEdgeError(error, { functionName: "lead-status-update", errorCode: "update_failed" });
    return new Response(
      JSON.stringify({ success: false, error: error.code === "PGRST116" ? "not_found_or_forbidden" : "update_failed" }),
      { status: 404, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ success: true, lead: data }),
    { status: 200, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
  );
}));

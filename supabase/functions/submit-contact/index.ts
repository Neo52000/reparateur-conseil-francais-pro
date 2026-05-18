/**
 * submit-contact — Edge Function publique
 *
 * Pont entre le SPA et match-and-distribute :
 *   1. Update de l'issue_request avec les coordonnées du consommateur
 *   2. Invocation server-to-server de match-and-distribute (service-role)
 *
 * Pourquoi ne pas appeler match-and-distribute depuis le SPA directement ?
 * match-and-distribute est protégée par CRON_SECRET / service-role pour
 * éviter qu'un attaquant connaissant un issue_request_id (UUID) déclenche
 * une distribution → débit de crédits sur des réparateurs ciblés.
 *
 * submit-contact a la même surface publique mais ajoute :
 *   - rate-limit IP (5/min, plus strict que diagnose-issue)
 *   - validation stricte des coordonnées (email, téléphone, CP)
 *   - garde anti-double-soumission (status doit être 'new'|'awaiting_contact')
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { withSentry, captureEdgeError } from "../_shared/sentry.ts";

const InputSchema = z.object({
  issue_request_id: z.string().uuid(),
  contact_name: z.string().max(120).optional(),
  contact_email: z.string().email().max(200),
  contact_phone: z.string().min(6).max(30),
  postal_code: z.string().regex(/^\d{5}$/),
});

serve(withSentry("submit-contact", async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "method_not_allowed" }),
      { status: 405, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  const limited = enforceRateLimit(req, {
    namespace: "submit-contact",
    limit: 5,
    windowMs: 60_000,
  });
  if (limited) return limited;

  let input: z.infer<typeof InputSchema>;
  try {
    input = InputSchema.parse(await req.json());
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "invalid_input", details: String(err) }),
      { status: 400, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Vérifie l'existence + statut de la demande avant tout effet de bord.
  const { data: existing, error: fetchErr } = await supabase
    .from("issue_requests")
    .select("id, status")
    .eq("id", input.issue_request_id)
    .maybeSingle<{ id: string; status: string }>();

  if (fetchErr || !existing) {
    return new Response(
      JSON.stringify({ success: false, error: "issue_not_found" }),
      { status: 404, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }
  if (existing.status === "distributed") {
    return new Response(
      JSON.stringify({ success: true, already_distributed: true }),
      { status: 200, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }
  if (!["new", "awaiting_contact"].includes(existing.status)) {
    return new Response(
      JSON.stringify({ success: false, error: "invalid_state", state: existing.status }),
      { status: 409, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  const { error: updateErr } = await supabase
    .from("issue_requests")
    .update({
      contact_name: input.contact_name?.trim() || null,
      contact_email: input.contact_email.trim(),
      contact_phone: input.contact_phone.trim(),
      postal_code: input.postal_code,
      status: "awaiting_contact",
    })
    .eq("id", input.issue_request_id);

  if (updateErr) {
    captureEdgeError(updateErr, { functionName: "submit-contact", errorCode: "update_failed" });
    return new Response(
      JSON.stringify({ success: false, error: "update_failed" }),
      { status: 500, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  // Invocation server-to-server avec la clé service-role.
  const { data: matchData, error: matchErr } = await supabase.functions.invoke(
    "match-and-distribute",
    {
      body: { issue_request_id: input.issue_request_id },
      headers: {
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""}`,
      },
    },
  );

  if (matchErr) {
    captureEdgeError(matchErr, { functionName: "submit-contact", errorCode: "match_failed" });
    // L'update a réussi mais le matching a échoué — la demande reste
    // visible en admin pour traitement manuel.
    return new Response(
      JSON.stringify({ success: false, error: "match_failed", saved: true }),
      { status: 502, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ success: true, match: matchData }),
    { status: 200, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
  );
}));

/**
 * match-and-distribute — Edge Function
 *
 * Sélectionne jusqu'à 3 réparateurs actifs pour une issue_request,
 * débite 1 crédit à chacun (RPC atomique), crée les lead_deliveries,
 * et déclenche les notifications via send-notification.
 *
 * Auth :
 *   - protégée par CRON_SECRET (header x-cron-secret) OU par service_role
 *     (header authorization). Appelée par diagnose-issue ou par un trigger
 *     DB ; jamais directement par le SPA.
 *
 * Matching MVP (postal-code only, pas de PostGIS) :
 *   status='active' AND credit_balance >= 1
 *   AND (issue.postal_code = ANY(service_zones) OR repairers.postal_code = issue.postal_code)
 *   AND (services ∩ device_type OR specialties ∩ device_type)
 *   ORDER BY rating DESC NULLS LAST, random()
 *   LIMIT 3
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { withSentry, captureEdgeError } from "../_shared/sentry.ts";

const InputSchema = z.object({
  issue_request_id: z.string().uuid(),
  max_repairers: z.number().int().min(1).max(5).optional().default(3),
});

interface IssueRequestRow {
  id: string;
  postal_code: string;
  device_type: string | null;
  brand: string | null;
  model: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  symptom: string;
  diagnosis_ai: Record<string, unknown> | null;
}

interface RepairerCandidate {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  rating: number | null;
}

function authorized(req: Request): boolean {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret && req.headers.get("x-cron-secret") === cronSecret) return true;

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("authorization");
  if (serviceKey && authHeader === `Bearer ${serviceKey}`) return true;

  // Supabase Edge passes the project anon key by default for SPA callers — we
  // do NOT trust it here; we want either a cron secret or service-role.
  return false;
}

serve(withSentry("match-and-distribute", async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "method_not_allowed" }),
      { status: 405, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  // `verify_jwt = false` dans config.toml → on doit AUTH NOUS-MÊMES.
  // Seuls les appels avec CRON_SECRET ou service-role sont acceptés —
  // jamais le SPA directement.
  if (!authorized(req)) {
    return new Response(
      JSON.stringify({ success: false, error: "unauthorized" }),
      { status: 401, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  // Caller is either a verified user (via verify_jwt = true in config) OR an
  // internal trigger using service-role/cron secret. We let verify_jwt do the
  // first gate; for extra safety against future config drift we also accept
  // the cron secret path.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  let input: z.infer<typeof InputSchema>;
  try {
    const body = await req.json();
    input = InputSchema.parse(body);
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "invalid_input", details: String(err) }),
      { status: 400, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  // 1. Charger la demande
  const { data: issue, error: issueErr } = await supabase
    .from("issue_requests")
    .select(
      "id, postal_code, device_type, brand, model, contact_name, contact_email, contact_phone, symptom, diagnosis_ai, status",
    )
    .eq("id", input.issue_request_id)
    .single<IssueRequestRow & { status: string }>();

  if (issueErr || !issue) {
    return new Response(
      JSON.stringify({ success: false, error: "issue_not_found" }),
      { status: 404, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  if (issue.status === "distributed") {
    return new Response(
      JSON.stringify({ success: true, already_distributed: true }),
      { status: 200, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  // 2. Trouver les candidats
  // On matche : postal_code dans service_zones OU postal_code identique,
  // ET le device_type apparait dans services OU specialties (best-effort).
  const deviceType = (issue.device_type ?? "").toLowerCase().trim();
  const tokens = [deviceType, issue.brand?.toLowerCase()].filter(Boolean) as string[];

  // Postgrest : utilise overlaps avec un array. On filtre côté DB par
  // service_zones contient le code postal, puis on affine côté SQL avec OR
  // sur services et specialties.
  let query = supabase
    .from("repairers")
    .select("id, user_id, name, email, rating, services, specialties, postal_code, service_zones")
    .eq("status", "active")
    .gte("credit_balance", 1);

  // postal_code dans service_zones OU postal_code exact
  query = query.or(
    `service_zones.cs.{${issue.postal_code}},postal_code.eq.${issue.postal_code}`,
  );

  const { data: candidates, error: candErr } = await query.limit(50);

  if (candErr) {
    captureEdgeError(candErr, { functionName: "match-and-distribute", errorCode: "query_candidates" });
    return new Response(
      JSON.stringify({ success: false, error: "query_failed" }),
      { status: 500, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  // Filtre côté Edge : intersection services/specialties avec le device_type
  // (skippé si pas de device_type renseigné).
  const filtered = (candidates ?? []).filter((c) => {
    if (!deviceType) return true;
    const haystack = [
      ...(c.services ?? []),
      ...(c.specialties ?? []),
    ].map((s: string) => s.toLowerCase());
    return tokens.some((t) => haystack.some((h) => h.includes(t)));
  });

  // Tri : rating desc, puis aléatoire pour équilibrer
  filtered.sort((a, b) => {
    const ra = a.rating ?? 0;
    const rb = b.rating ?? 0;
    if (rb !== ra) return rb - ra;
    return Math.random() - 0.5;
  });

  const targets: RepairerCandidate[] = filtered.slice(0, input.max_repairers).map((c) => ({
    id: c.id,
    user_id: c.user_id,
    name: c.name,
    email: c.email,
    rating: c.rating,
  }));

  // 3. Pour chaque candidat : débiter 1 crédit, créer le lead, notifier
  const deliveries: { repairer_id: string; lead_id: string; notified: boolean }[] = [];

  for (const target of targets) {
    // Pré-génère l'UUID pour relier la transaction de crédit au lead.
    const leadId = crypto.randomUUID();

    const { data: newBalance, error: debitErr } = await supabase.rpc("debit_credits", {
      p_repairer: target.id,
      p_amount: 1,
      p_lead: leadId,
    const { data: newBalance, error: debitErr } = await supabase.rpc("debit_credits", {
      p_repairer: target.id,
      p_amount: 1,
      p_lead: null,
    });

    if (debitErr) {
      captureEdgeError(debitErr, {
        functionName: "match-and-distribute",
        errorCode: "debit_failed",
        extra: { repairer_id: target.id },
      });
      continue;
    }
    if (newBalance === null) {
      // Solde devenu insuffisant entre le SELECT et le débit — on skip
      continue;
    }

    const { data: lead, error: insertErr } = await supabase
      .from("lead_deliveries")
      .insert({
        id: leadId,
        issue_request_id: issue.id,
        repairer_id: target.id,
        credits_spent: 1,
        status: "delivered",
      })
      .select("id")
      .single();

    if (insertErr || !lead) {
      // Tentative de remboursement
      await supabase.rpc("credit_credits", {
        p_repairer: target.id,
        p_amount: 1,
        p_session: null,
        p_kind: "refund",
      });
      captureEdgeError(insertErr, {
        functionName: "match-and-distribute",
        errorCode: "insert_lead_failed",
      });
      continue;
    }

    // Notification email + SMS via la fonction existante.
    let notified = false;
    if (target.user_id) {
      const { error: notifErr } = await supabase.functions.invoke("send-notification", {
        body: {
          userId: target.user_id,
          type: "new_lead",
          title: "Nouveau lead reçu",
          message: `Demande de réparation à proximité (${issue.postal_code}) — contact : ${issue.contact_name ?? "client"}.`,
          channels: { email: true, sms: true, browser: true },
          data: {
            lead_id: lead.id,
            issue_request_id: issue.id,
            postal_code: issue.postal_code,
            symptom: issue.symptom,
          },
        },
      });
      notified = !notifErr;
      if (notifErr) {
        captureEdgeError(notifErr, {
          functionName: "match-and-distribute",
          errorCode: "notify_failed",
          extra: { lead_id: lead.id },
        });
      }
    }

    deliveries.push({ repairer_id: target.id, lead_id: lead.id, notified });
  }

  // 4. Marquer la demande comme distribuée (même si 0 lead — on ne re-trie pas)
  await supabase
    .from("issue_requests")
    .update({ status: "distributed", distributed_at: new Date().toISOString() })
    .eq("id", issue.id);

  return new Response(
    JSON.stringify({ success: true, deliveries }),
    { status: 200, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
  );
}));

/**
 * diagnose-issue — Edge Function publique
 *
 * Reçoit la description d'une panne, interroge Claude Haiku, persiste
 * la demande dans `issue_requests` et renvoie le diagnostic structuré.
 *
 * Sécurité :
 *   - pas d'auth (tunnel /diagnostic ouvert aux visiteurs)
 *   - rate-limit IP : 10 requêtes / minute
 *   - validation Zod stricte des entrées
 *   - clé Anthropic uniquement côté Edge (jamais dans le SPA)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";
import { withSentry, captureEdgeError } from "../_shared/sentry.ts";
import { callClaudeJSON, MODEL_HAIKU } from "../_shared/anthropic.ts";

const InputSchema = z.object({
  deviceType: z.string().min(2).max(80),
  brand: z.string().max(80).optional().default(""),
  model: z.string().max(120).optional().default(""),
  symptom: z.string().min(10).max(2000),
  postalCode: z.string().regex(/^\d{5}$/).optional(),
});

interface DiagnosisJSON {
  diagnostic_probable: string;
  causes_possibles: string[];
  complexite: "simple" | "moyenne" | "complexe";
  estimation_prix_eur: { min: number; max: number };
  duree_intervention_estimee: string;
  urgence: "low" | "medium" | "high";
  qualirepar_eligible: boolean;
  qualirepar_categorie: string | null;
  questions_complementaires: string[];
}

const SYSTEM_PROMPT = `Tu es un expert en réparation d'appareils domestiques (électroménager, smartphone, ordinateur, TV, vélo).
À partir d'une description utilisateur, tu retournes UNIQUEMENT un objet JSON valide, sans préambule, sans markdown, sans bloc de code.

Schéma attendu :
{
  "diagnostic_probable": string (2 phrases max, vulgarisé, sans jargon),
  "causes_possibles": string[] (top 3, ordonnées de la plus probable à la moins probable),
  "complexite": "simple" | "moyenne" | "complexe",
  "estimation_prix_eur": { "min": int, "max": int },
  "duree_intervention_estimee": string ("30 min", "1-2 h", "demi-journée"),
  "urgence": "low" | "medium" | "high",
  "qualirepar_eligible": boolean,
  "qualirepar_categorie": string | null,
  "questions_complementaires": string[] (max 2, pour affiner le diagnostic)
}

Contraintes :
- Aucun engagement contractuel.
- Pas de mention de marque déposée tierce dans le diagnostic.
- Si la description est vague, choisis urgence "low", complexite "moyenne", fourchettes larges.
- Toujours répondre, même si les données sont limitées.
- Réponds en français.`;

serve(withSentry("diagnose-issue", async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "method_not_allowed" }),
      { status: 405, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  const limited = enforceRateLimit(req, {
    namespace: "diagnose-issue",
    limit: 10,
    windowMs: 60_000,
  });
  if (limited) return limited;

  let payload: z.infer<typeof InputSchema>;
  try {
    const body = await req.json();
    payload = InputSchema.parse(body);
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "invalid_input",
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 400, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  const userMessage = JSON.stringify({
    appareil: payload.deviceType,
    marque: payload.brand,
    modele: payload.model,
    description_panne: payload.symptom,
  });

  let diagnosis: DiagnosisJSON;
  try {
    diagnosis = await callClaudeJSON<DiagnosisJSON>({
      model: MODEL_HAIKU,
      system: SYSTEM_PROMPT,
      user: userMessage,
      maxTokens: 800,
    });
  } catch (err) {
    captureEdgeError(err, { functionName: "diagnose-issue", errorCode: "claude_failed" });
    return new Response(
      JSON.stringify({ success: false, error: "ai_unavailable" }),
      { status: 502, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: inserted, error: insertError } = await supabase
    .from("issue_requests")
    .insert({
      postal_code: payload.postalCode ?? "00000",
      device_type: payload.deviceType,
      brand: payload.brand || null,
      model: payload.model || null,
      symptom: payload.symptom,
      diagnosis_ai: diagnosis,
      status: "new",
    })
    .select("id")
    .single();

  if (insertError) {
    captureEdgeError(insertError, { functionName: "diagnose-issue", errorCode: "db_insert" });
    return new Response(
      JSON.stringify({ success: false, error: "persistence_failed" }),
      { status: 500, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ success: true, request_id: inserted.id, diagnosis }),
    { status: 200, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
  );
}));

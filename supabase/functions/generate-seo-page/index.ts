/**
 * generate-seo-page — Edge Function (cron-only)
 *
 * Génère N pages SEO long-form via Claude Sonnet et les insère dans la
 * table seo_pages (idempotent : on évite les doublons sur le slug).
 *
 * Entrées de travail : table seo_page_queue (ligne non encore processed).
 * Si la file est vide, on génère un set d'exemples par défaut (10 villes
 * principales × catégorie principale) pour ne pas tourner à vide au début.
 *
 * Auth : header x-cron-secret (CRON_SECRET).
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { withSentry, captureEdgeError } from "../_shared/sentry.ts";
import { requireCronSecret } from "../_shared/auth.ts";
import { callClaudeJSON, MODEL_SONNET } from "../_shared/anthropic.ts";

const BATCH_SIZE = 5;

interface QueueRow {
  id: string;
  kind: "guide" | "city" | "model" | "symptom";
  city: string | null;
  model: string | null;
  symptom: string | null;
  topic: string | null;
}

interface GeneratedPage {
  slug: string;
  title: string;
  meta_description: string;
  h1: string;
  body_md: string;
}

const SYSTEM_PROMPT = `Tu es un rédacteur SEO senior pour topreparateurs.fr (mise en relation entre consommateurs et réparateurs d'appareils en France).
Tu rédiges UNIQUEMENT un objet JSON valide (pas de markdown, pas de bloc de code).

Schéma attendu :
{
  "slug": string (kebab-case, ASCII, longueur 20-80, pas d'accent),
  "title": string (50-60 caractères, balise <title> SEO),
  "meta_description": string (140-160 caractères),
  "h1": string (60-80 caractères),
  "body_md": string (1200-2000 mots, Markdown, structure H2/H3, FAQ finale)
}

Contraintes :
- Français, ton clair, sans jargon.
- Inclure une FAQ finale "## Questions fréquentes" avec 3-5 questions.
- Évite toute promesse contractuelle ou prix exact ; donne des fourchettes.
- Pas de mention de marque déposée tierce hors usage strictement informatif.`;

serve(withSentry("generate-seo-page", async (req: Request) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "method_not_allowed" }),
      { status: 405, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  const auth = requireCronSecret(req);
  if (!auth.ok) return auth.response;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Charge BATCH_SIZE jobs en attente
  const { data: pending, error: queueError } = await supabase
    .from("seo_page_queue")
    .select("id, kind, city, model, symptom, topic")
    .is("processed_at", null)
    .is("failed_at", null)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (queueError) {
    return new Response(
      JSON.stringify({ success: false, error: "queue_query_failed" }),
      { status: 500, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  const jobs: QueueRow[] = (pending ?? []) as QueueRow[];
  if (jobs.length === 0) {
    return new Response(
      JSON.stringify({ success: true, generated: 0, message: "queue_empty" }),
      { status: 200, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
    );
  }

  let generated = 0;
  const errors: { job_id: string; error: string }[] = [];

  for (const job of jobs) {
    const briefParts = [
      `kind=${job.kind}`,
      job.city && `ville=${job.city}`,
      job.model && `appareil/modèle=${job.model}`,
      job.symptom && `symptôme=${job.symptom}`,
      job.topic && `sujet=${job.topic}`,
    ].filter(Boolean);

    const userPrompt = `Génère une page SEO pour topreparateurs.fr.
Paramètres : ${briefParts.join(", ")}.
Audience : particulier qui cherche à faire réparer son appareil.
CTA souhaité : inciter à utiliser /diagnostic pour obtenir 3 devis gratuits.`;

    try {
      const page = await callClaudeJSON<GeneratedPage>({
        model: MODEL_SONNET,
        system: SYSTEM_PROMPT,
        user: userPrompt,
        maxTokens: 4000,
      });

      const { error: insertError } = await supabase
        .from("seo_pages")
        .upsert(
          {
            slug: page.slug,
            kind: job.kind,
            city: job.city,
            model: job.model,
            symptom: job.symptom,
            title: page.title,
            meta_description: page.meta_description,
            h1: page.h1,
            body_md: page.body_md,
            generated_by: MODEL_SONNET,
            generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            published: true,
          },
          { onConflict: "slug" },
        );
      if (insertError) throw insertError;

      await supabase
        .from("seo_page_queue")
        .update({ processed_at: new Date().toISOString() })
        .eq("id", job.id);
      generated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ job_id: job.id, error: msg });
      await supabase
        .from("seo_page_queue")
        .update({ failed_at: new Date().toISOString(), error: msg })
        .eq("id", job.id);
      captureEdgeError(err, {
        functionName: "generate-seo-page",
        errorCode: "claude_or_insert_failed",
        extra: { job_id: job.id },
      });
    }
  }

  return new Response(
    JSON.stringify({ success: true, generated, errors }),
    { status: 200, headers: { ...buildCorsHeaders(req), "Content-Type": "application/json" } },
  );
}));

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { callAIWithFallback } from "../_shared/ai-text.ts";

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  const corsHeaders = buildCorsHeaders(req);

  try {
    const { prompt, fieldType, fieldLabel, systemContext } = await req.json();

    let systemPrompt = systemContext || "Vous êtes un assistant de rédaction professionnel.";
    if (fieldType === 'short') {
      systemPrompt += " Générez un texte court, concis et impactant (maximum 160 caractères pour les meta descriptions, ou une ligne pour les titres).";
    } else {
      systemPrompt += " Générez un texte détaillé, engageant et professionnel (2-4 paragraphes).";
    }

    const userPrompt = `Contexte: ${fieldLabel}\n\nInstructions: ${prompt}\n\nGénère le contenu demandé en français, directement utilisable sans formatage markdown.`;
    const maxTokens = fieldType === 'short' ? 100 : 500;

    const result = await callAIWithFallback({
      systemPrompt,
      userPrompt,
      maxTokens,
      temperature: 0.7,
    });

    if (!result.success || !result.content) {
      throw new Error(result.error || 'Aucune API IA disponible. Vérifiez vos clés API.');
    }

    return new Response(JSON.stringify({
      success: true,
      content: result.content,
      provider: result.provider,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

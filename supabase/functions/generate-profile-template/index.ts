import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { callAIWithFallback, parseJsonFromContent } from "../_shared/ai-text.ts";

interface GeneratedSuggestion {
  name: string;
  description: string;
  widgetOrder: string[];
  theme: {
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
    spacing: 'compact' | 'normal' | 'spacious';
  };
}

const DEFAULT_SUGGESTIONS: GeneratedSuggestion[] = [
  {
    name: "Template Moderne",
    description: "Template équilibré pour réparateurs professionnels",
    widgetOrder: ["header", "about", "contact", "photos", "services", "pricing", "hours", "reviews", "certifications", "map"],
    theme: {
      primaryColor: "217 91% 60%",
      accentColor: "142 76% 36%",
      fontFamily: "Inter",
      spacing: "normal",
    },
  },
  {
    name: "Template Compact",
    description: "Essentiel avec focus sur le contact",
    widgetOrder: ["header", "contact", "services", "pricing", "reviews"],
    theme: {
      primaryColor: "262 83% 58%",
      accentColor: "24 95% 53%",
      fontFamily: "Poppins",
      spacing: "compact",
    },
  },
];

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  const corsHeaders = buildCorsHeaders(req);

  try {
    const { prompt } = await req.json();

    const systemPrompt = `Tu es un expert UX/UI spécialisé dans la conception de fiches d'établissements.
Tu dois générer des templates JSON pour des fiches de réparateurs de smartphones.

Les widgets disponibles sont (dans cet ordre de priorité par défaut):
- header: En-tête avec nom, logo et badges
- about: Description et présentation
- contact: Téléphone, email, adresse
- photos: Galerie de photos
- hours: Horaires d'ouverture
- services: Liste des services
- pricing: Grille tarifaire
- certifications: Labels et certifications
- map: Carte interactive
- reviews: Avis clients

Les couleurs doivent être en format HSL: "H S% L%"
Ex: "217 91% 60%" pour un bleu

Génère EXACTEMENT 2 suggestions de templates différents.
Réponds UNIQUEMENT avec un JSON valide de cette structure:
{
  "suggestions": [
    {
      "name": "Nom du template",
      "description": "Description courte",
      "widgetOrder": ["header", "contact", "..."],
      "theme": {
        "primaryColor": "H S% L%",
        "accentColor": "H S% L%",
        "fontFamily": "Inter|Roboto|Poppins|Open Sans",
        "spacing": "compact|normal|spacious"
      }
    }
  ]
}`;

    const userPrompt = prompt || "Crée un template moderne et professionnel pour un réparateur de smartphones.";

    const aiResult = await callAIWithFallback({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    let suggestions: GeneratedSuggestion[] = DEFAULT_SUGGESTIONS;

    if (aiResult.success && aiResult.content) {
      try {
        const parsed = parseJsonFromContent(aiResult.content) as { suggestions?: GeneratedSuggestion[] };
        if (Array.isArray(parsed?.suggestions) && parsed.suggestions.length > 0) {
          suggestions = parsed.suggestions;
        }
      } catch {
        // fallback to default suggestions
      }
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

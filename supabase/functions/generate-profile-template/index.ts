import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt || "Crée un template moderne et professionnel pour un réparateur de smartphones." },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse le JSON de la réponse
    let suggestions: GeneratedSuggestion[];
    try {
      // Nettoyer le contenu si nécessaire (enlever les backticks markdown)
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      
      const parsed = JSON.parse(cleanContent.trim());
      suggestions = parsed.suggestions || [];
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Retourner des suggestions par défaut en cas d'erreur de parsing
      suggestions = [
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
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-profile-template error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

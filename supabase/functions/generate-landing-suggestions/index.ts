import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentConfig, businessType, seoScore } = await req.json();

    const prompt = `Analyse cette landing page de ${businessType} et génère des suggestions d'amélioration.
    
    Configuration actuelle: ${JSON.stringify(currentConfig)}
    Score SEO actuel: ${seoScore}/100
    
    Génère 3-5 suggestions concrètes et actionables pour améliorer:
    - La conversion (UX, CTA, contenu)
    - Le référencement SEO
    - L'engagement utilisateur
    - La crédibilité et confiance
    
    Retourne un JSON avec un array "suggestions" contenant des phrases courtes et pratiques.
    Chaque suggestion doit être spécifique et applicable immédiatement.
    
    Exemple de format:
    {
      "suggestions": [
        "Ajouter des témoignages clients pour renforcer la crédibilité",
        "Optimiser le titre principal avec des mots-clés locaux",
        "Inclure un numéro de téléphone visible dans le header"
      ]
    }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un consultant expert en optimisation de landing pages et SEO. Tu donnes des conseils pratiques et mesurables pour améliorer les performances. Réponds uniquement en JSON valide.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erreur API OpenAI');
    }

    let suggestions;
    try {
      suggestions = JSON.parse(data.choices[0].message.content);
    } catch {
      // Si le parsing JSON échoue, retourner des suggestions par défaut
      suggestions = {
        suggestions: [
          "Améliorer le titre principal pour plus d'impact",
          "Ajouter des éléments de réassurance (certifications, garanties)",
          "Optimiser les call-to-action pour plus de visibilité",
          "Inclure des témoignages clients authentiques",
          "Améliorer la structure SEO avec des mots-clés pertinents"
        ]
      };
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-landing-suggestions function:', error);
    return new Response(JSON.stringify({ 
      suggestions: [
        "Revoir la structure générale de la page",
        "Optimiser les images et médias",
        "Améliorer les textes pour plus d'engagement"
      ]
    }), {
      status: 200, // Retourner du contenu par défaut même en cas d'erreur
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
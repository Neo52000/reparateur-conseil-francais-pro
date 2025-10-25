import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Vérifier si la clé API Mistral est disponible
    if (!mistralApiKey) {
      console.error('❌ MISTRAL_API_KEY is not configured');
      return new Response(JSON.stringify({ 
        suggestions: [
          "Configurer la clé API Mistral dans les secrets du projet",
          "Vérifier les paramètres de l'API Mistral AI",
          "Contacter l'administrateur pour la configuration"
        ]
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
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

    console.log('🔄 Appel API Mistral pour suggestions');
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mistralApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un consultant expert en optimisation de landing pages et SEO spécialisé dans la réparation. Tu donnes des conseils pratiques et mesurables pour améliorer les performances. Réponds uniquement en JSON valide.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 800
      }),
    });

    console.log('📡 Statut réponse Mistral suggestions:', response.status);
    
    const data = await response.json();
    console.log('📤 Réponse Mistral suggestions:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.message || `Erreur HTTP ${response.status}`;
      console.error('❌ Erreur API Mistral suggestions:', errorMessage);
      throw new Error(errorMessage);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Structure de réponse Mistral invalide pour suggestions');
    }

    let suggestions;
    try {
      const rawContent = data.choices[0].message.content;
      console.log('📝 Contenu brut suggestions:', rawContent);
      suggestions = JSON.parse(rawContent);
      console.log('✅ Suggestions parsées:', suggestions);
    } catch (parseError) {
      console.error('❌ Erreur parsing suggestions:', parseError);
      // Fallback avec suggestions statiques
      suggestions = {
        suggestions: [
          "Améliorer le titre principal pour plus d'impact",
          "Ajouter des éléments de réassurance (certifications, garanties)",
          "Optimiser les call-to-action pour plus de visibilité",
          "Inclure des témoignages clients authentiques",
          "Améliorer la structure SEO avec des mots-clés pertinents",
          "⚠️ Erreur parsing IA - Suggestions par défaut"
        ]
      };
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('❌ Erreur dans generate-landing-suggestions:', error);
    
    // Suggestions par défaut avec diagnostic d'erreur
    let defaultSuggestions = [
      "Optimiser le titre principal (30-60 caractères)",
      "Améliorer la description meta (120-160 caractères)",
      "Ajouter des mots-clés pertinents",
      "Inclure des témoignages clients",
      "Optimiser les boutons d'appel à l'action",
      "Améliorer la structure du contenu"
    ];
    
    if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
      defaultSuggestions.unshift("❌ Clé API Mistral invalide - Vérifiez la configuration dans les secrets");
    } else if (error.message?.includes('429')) {
      defaultSuggestions.unshift("⏱️ Limite Mistral atteinte - Réessayez dans quelques minutes");
    } else if (error.message?.includes('fetch')) {
      defaultSuggestions.unshift("🔗 Erreur de connexion à Mistral - Vérifiez votre réseau");
    } else {
      defaultSuggestions.unshift("⚠️ Erreur génération IA - Suggestions par défaut affichées");
    }
    
    return new Response(JSON.stringify({
      suggestions: defaultSuggestions,
      error: error.message,
      fallback: true
    }), {
      status: 200, // Retourner du contenu par défaut même en cas d'erreur
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
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
    const { contentType, context, currentConfig, businessType } = await req.json();

    let prompt = '';
    
    switch (contentType) {
      case 'hero':
        prompt = `Génère le contenu pour la section hero d'une landing page de ${businessType}. 
        Contexte: ${context}
        Configuration actuelle: ${JSON.stringify(currentConfig.hero || {})}
        
        Retourne un JSON avec:
        - title: Un titre accrocheur et impactant (max 60 caractères)
        - subtitle: Un sous-titre qui explique la valeur ajoutée (max 120 caractères)
        - cta_text: Un texte de bouton d'action incitant (max 20 caractères)
        
        Le contenu doit être professionnel, orienté conversion et adapté au secteur de la réparation.`;
        break;
        
      case 'about':
        prompt = `Génère le contenu pour la section "À propos" d'une landing page de ${businessType}.
        Contexte: ${context}
        Configuration actuelle: ${JSON.stringify(currentConfig.about || {})}
        
        Retourne un JSON avec:
        - title: Un titre pour la section (max 40 caractères)
        - description: Une description engageante qui inspire confiance (200-300 mots)
        
        Mets l'accent sur l'expertise, la confiance, la proximité et la qualité du service.`;
        break;
        
      case 'services':
        prompt = `Génère le contenu pour la section services d'une landing page de ${businessType}.
        Contexte: ${context}
        Configuration actuelle: ${JSON.stringify(currentConfig.services || {})}
        
        Retourne un JSON avec:
        - title: Un titre pour la section services
        - items: Un array de 3-4 services avec pour chaque:
          - name: Nom du service (max 30 caractères)
          - description: Description courte et claire (max 80 caractères)
          - price: Fourchette de prix réaliste
        
        Les services doivent être spécifiques au secteur de la réparation et attractifs.`;
        break;
        
      case 'seo':
        prompt = `Génère les métadonnées SEO optimisées pour une landing page de ${businessType}.
        Contexte: ${context}
        Configuration actuelle: ${JSON.stringify(currentConfig.seo || {})}
        Contenu de la page: ${JSON.stringify(currentConfig)}
        
        Retourne un JSON avec:
        - meta_title: Titre SEO optimisé (50-60 caractères)
        - meta_description: Description SEO engageante (120-160 caractères)
        - keywords: 5-8 mots-clés pertinents séparés par des virgules
        
        Utilise des mots-clés locaux et sectoriels pour optimiser le référencement.`;
        break;
        
      default:
        throw new Error('Type de contenu non supporté');
    }

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
            content: 'Tu es un expert en marketing digital et rédaction web spécialisé dans le secteur de la réparation. Tu génères du contenu professionnel, optimisé pour la conversion et le SEO. Réponds uniquement en JSON valide.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erreur API OpenAI');
    }

    let content;
    try {
      content = JSON.parse(data.choices[0].message.content);
    } catch {
      // Si le parsing JSON échoue, retourner une structure par défaut
      content = { error: 'Format de réponse invalide' };
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-landing-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
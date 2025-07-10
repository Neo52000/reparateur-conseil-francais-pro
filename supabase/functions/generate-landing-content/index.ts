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
    console.log('🔑 MISTRAL_API_KEY exists:', !!mistralApiKey);
    console.log('🔑 MISTRAL_API_KEY length:', mistralApiKey ? mistralApiKey.length : 'undefined');
    
    // Vérifier si la clé API Mistral est disponible
    if (!mistralApiKey) {
      console.error('❌ MISTRAL_API_KEY is not configured');
      return new Response(JSON.stringify({ 
        error: 'Clé API Mistral manquante. Veuillez configurer MISTRAL_API_KEY dans les secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
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

    console.log('🔄 Appel API Mistral avec model: mistral-large-latest');
    
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
            content: 'Tu es un expert en marketing digital et rédaction web spécialisé dans le secteur de la réparation. Tu génères du contenu professionnel, optimisé pour la conversion et le SEO. Réponds uniquement en JSON valide.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    console.log('📡 Statut réponse Mistral:', response.status);
    
    const data = await response.json();
    console.log('📤 Réponse Mistral:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.message || `Erreur HTTP ${response.status}`;
      console.error('❌ Erreur API Mistral:', errorMessage);
      throw new Error(errorMessage);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Structure de réponse Mistral invalide');
    }

    let content;
    try {
      const rawContent = data.choices[0].message.content;
      console.log('📝 Contenu brut Mistral:', rawContent);
      content = JSON.parse(rawContent);
      console.log('✅ Contenu parsé avec succès:', content);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      throw new Error('Format de réponse JSON invalide de Mistral');
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('❌ Erreur dans generate-landing-content:', error);
    
    let errorMessage = 'Erreur de génération de contenu';
    let statusCode = 500;
    
    if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
      errorMessage = 'Clé API Mistral invalide ou expirée';
      statusCode = 401;
    } else if (error.message?.includes('429')) {
      errorMessage = 'Limite de requêtes Mistral dépassée - Réessayez plus tard';
      statusCode = 429;
    } else if (error.message?.includes('fetch')) {
      errorMessage = 'Erreur de connexion à l\'API Mistral';
      statusCode = 503;
    } else if (error.message?.includes('JSON')) {
      errorMessage = 'Réponse Mistral au format invalide';
      statusCode = 502;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Templates de prompts pour différents types de pages
const contentTemplates = {
  legal: {
    title: "Page légale sur {topic}",
    prompt: `Génère le contenu d'une page légale sur "{topic}" pour une plateforme de mise en relation avec des réparateurs de smartphones.
    
    Structure attendue:
    - Introduction claire du sujet
    - Sections organisées avec des titres HTML appropriés
    - Contenu juridique français conforme
    - Langage accessible mais professionnel
    - Références aux droits des utilisateurs
    
    Le contenu doit être en HTML avec des balises sémantiques (h2, h3, p, ul, li).`
  },
  service: {
    title: "Page de service {topic}",
    prompt: `Génère le contenu d'une page de service "{topic}" pour une plateforme de réparation de smartphones et appareils électroniques.
    
    Structure attendue:
    - Titre accrocheur avec le service
    - Description du service avec avantages
    - Process étape par étape
    - Types d'appareils pris en charge
    - Garanties et engagements
    - Call-to-action pour trouver un réparateur
    
    Ton: professionnel, rassurant, orienté client. Format HTML avec balises sémantiques.`
  },
  corporate: {
    title: "Page corporate {topic}",
    prompt: `Génère le contenu d'une page corporate "{topic}" pour une plateforme de mise en relation avec des réparateurs.
    
    Structure attendue:
    - Message de présentation engageant
    - Mission et valeurs de l'entreprise
    - Histoire et expertise
    - Engagement envers la qualité
    - Équipe et savoir-faire
    
    Ton: professionnel, humain, inspirant confiance. Format HTML avec balises sémantiques.`
  },
  faq: {
    title: "FAQ {topic}",
    prompt: `Génère une page FAQ complète sur "{topic}" pour une plateforme de réparation.
    
    Structure attendue:
    - 10-15 questions fréquentes avec réponses détaillées
    - Sections thématiques (prix, délais, garantie, etc.)
    - Réponses claires et rassurantes
    - Links vers les services appropriés
    
    Format: HTML avec structure Q&A utilisant des éléments sémantiques.`
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pageType, topic, customPrompt, targetAudience, seoFocus } = await req.json();

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const MISTRAL_API_KEY = Deno.env.get('CLE_API_MISTRAL');

    if (!OPENAI_API_KEY && !MISTRAL_API_KEY) {
      throw new Error('Aucune clé API disponible');
    }

    // Sélectionner le template approprié
    const template = contentTemplates[pageType] || contentTemplates.corporate;
    
    // Construire le prompt final
    let finalPrompt = customPrompt || template.prompt.replace(/{topic}/g, topic);
    
    if (targetAudience) {
      finalPrompt += `\n\nPublic cible: ${targetAudience}`;
    }
    
    if (seoFocus) {
      finalPrompt += `\n\nMots-clés SEO à intégrer naturellement: ${seoFocus}`;
    }

    finalPrompt += `\n\nRETOURNE UNIQUEMENT un objet JSON avec cette structure:
    {
      "title": "Titre SEO optimisé (max 60 caractères)",
      "meta_description": "Description meta SEO (max 160 caractères)",
      "content": "Contenu HTML complet avec balises sémantiques",
      "suggested_slug": "slug-url-optimise"
    }`;

    let response;
    let usedModel = '';

    // Essayer d'abord Mistral
    if (MISTRAL_API_KEY) {
      try {
        usedModel = 'mistral';
        response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'mistral-large-latest',
            messages: [
              {
                role: 'system',
                content: 'Tu es un expert en rédaction web et SEO. Tu génères du contenu de qualité pour des pages web, optimisé pour le référencement naturel et l\'expérience utilisateur.'
              },
              {
                role: 'user',
                content: finalPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          }),
        });

        if (!response.ok) throw new Error('Mistral API failed');
      } catch (error) {
        console.log('Mistral failed, trying OpenAI:', error);
        response = null;
      }
    }

    // Fallback vers OpenAI
    if (!response && OPENAI_API_KEY) {
      usedModel = 'openai';
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en rédaction web et SEO. Tu génères du contenu de qualité pour des pages web, optimisé pour le référencement naturel et l\'expérience utilisateur.'
            },
            {
              role: 'user',
              content: finalPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
      });
    }

    if (!response?.ok) {
      throw new Error('Erreur lors de la génération du contenu');
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Parser le JSON retourné par l'IA
    let generatedContent;
    try {
      // Nettoyer le texte pour extraire le JSON
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Format JSON non trouvé');
      }
    } catch (parseError) {
      // Fallback si le parsing échoue
      generatedContent = {
        title: `${template.title.replace(/{topic}/g, topic)}`,
        meta_description: `Découvrez tout sur ${topic} avec notre plateforme de réparation professionnelle.`,
        content: `<h1>${topic}</h1>\n<p>${generatedText}</p>`,
        suggested_slug: topic.toLowerCase().replace(/[^a-z0-9]/g, '-')
      };
    }

    // Calculer un score de qualité basique
    const qualityScore = Math.min(100, 
      (generatedContent.content.length / 50) + 
      (generatedContent.title.length > 20 ? 20 : 0) +
      (generatedContent.meta_description.length > 50 ? 20 : 0) +
      (generatedContent.content.includes('<h') ? 10 : 0)
    );

    return new Response(JSON.stringify({
      success: true,
      content: generatedContent,
      metadata: {
        model_used: usedModel,
        quality_score: qualityScore,
        generation_time: new Date().toISOString(),
        prompt_used: finalPrompt.substring(0, 200) + '...'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-static-page-content:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const mistralApiKey = Deno.env.get('MISTRAL_API_KEY'); 
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { field, currentValue, content, ai_model = 'perplexity', context } = await req.json();

    if (!field || !currentValue) {
      throw new Error('Field et currentValue sont requis');
    }

    console.log(`🚀 Enhancing field: ${field} with AI: ${ai_model}`);

    const prompts = {
      title: `Améliore ce titre d'article de blog sur la réparation de smartphones : "${currentValue}". Rends-le plus accrocheur, SEO-friendly et engageant. Réponds uniquement avec le nouveau titre.`,
      
      slug: `Génère un slug URL optimisé pour ce titre : "${currentValue}". Le slug doit être en français, avec des tirets, sans caractères spéciaux, et optimisé SEO. Réponds uniquement avec le slug.`,
      
      excerpt: `Crée un extrait accrocheur de 2-3 phrases pour cet article de blog sur la réparation de smartphones. Titre: "${currentValue}". Contenu: "${content?.substring(0, 500) || ''}". L'extrait doit donner envie de lire l'article. Réponds uniquement avec l'extrait.`,
      
      meta_title: `Optimise ce titre pour le SEO (max 60 caractères) : "${currentValue}". Il doit être accrocheur et inclure des mots-clés pertinents pour la réparation de smartphones. Réponds uniquement avec le titre SEO.`,
      
      meta_description: `Crée une meta-description SEO optimisée (max 160 caractères) pour cet article. Titre: "${currentValue}". Contenu: "${content?.substring(0, 300) || ''}". Elle doit inciter au clic. Réponds uniquement avec la meta-description.`,
      
      keywords: `Génère 8-12 mots-clés SEO pertinents pour cet article sur la réparation de smartphones. Titre: "${currentValue}". Contenu: "${content?.substring(0, 300) || ''}". Réponds uniquement avec les mots-clés séparés par des virgules.`,
      
      content: `Améliore ce contenu d'article de blog en le rendant plus engageant et visuellement attrayant. Remplace les balises markdown par un formatage naturel, ajoute des emojis contextuels pertinents, et améliore la lisibilité. Contenu: "${currentValue}". Garde la même structure mais rends-le plus moderne et attractif.`
    };

    const prompt = prompts[field as keyof typeof prompts];
    if (!prompt) {
      throw new Error(`Field "${field}" non supporté`);
    }

    let enhancedValue = '';

    // Essayer avec l'IA sélectionnée, puis fallback
    try {
      if (ai_model === 'perplexity' && perplexityApiKey) {
        enhancedValue = await enhanceWithPerplexity(prompt);
      } else if (ai_model === 'openai' && openAIApiKey) {
        enhancedValue = await enhanceWithOpenAI(prompt);
      } else if (ai_model === 'mistral' && mistralApiKey) {
        enhancedValue = await enhanceWithMistral(prompt);
      } else {
        // Fallback sur la première IA disponible
        if (perplexityApiKey) {
          enhancedValue = await enhanceWithPerplexity(prompt);
        } else if (openAIApiKey) {
          enhancedValue = await enhanceWithOpenAI(prompt);
        } else if (mistralApiKey) {
          enhancedValue = await enhanceWithMistral(prompt);
        } else {
          throw new Error('Aucune clé API disponible');
        }
      }
    } catch (apiError) {
      console.error(`Erreur avec ${ai_model}:`, apiError);
      throw new Error(`Échec de l'amélioration avec ${ai_model}: ${apiError.message}`);
    }

    async function enhanceWithPerplexity(prompt: string): Promise<string> {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    }

    async function enhanceWithOpenAI(prompt: string): Promise<string> {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    }

    async function enhanceWithMistral(prompt: string): Promise<string> {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mistralApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    }

    console.log('✅ Amélioration réussie');

    return new Response(JSON.stringify({ 
      success: true,
      enhanced_value: enhancedValue,
      ai_model: ai_model
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

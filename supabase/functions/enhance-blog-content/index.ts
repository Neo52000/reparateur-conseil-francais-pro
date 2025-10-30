
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
    const { field, currentValue, content, ai_model = 'perplexity' } = await req.json();

    if (!field || !currentValue) {
      throw new Error('Field et currentValue sont requis');
    }

    console.log(`🚀 Enhancing field: ${field} with AI: ${ai_model}`);

    const prompts = {
      title: `Améliore ce titre d'article de blog sur la réparation de smartphones : "${currentValue}". Rends-le plus accrocheur, SEO-friendly et engageant. Réponds uniquement avec le nouveau titre, sans guillemets.`,
      
      slug: `Génère un slug URL optimisé pour ce titre : "${currentValue}". Le slug doit être en français, avec des tirets, sans caractères spéciaux, et optimisé SEO. Réponds uniquement avec le slug, sans guillemets.`,
      
      excerpt: `Crée un extrait accrocheur de 2-3 phrases pour cet article de blog sur la réparation de smartphones. Titre: "${currentValue}". Contenu: "${content?.substring(0, 500) || ''}". L'extrait doit donner envie de lire l'article. Réponds uniquement avec l'extrait, sans guillemets.`,
      
      meta_title: `Optimise ce titre pour le SEO (max 60 caractères) : "${currentValue}". Il doit être accrocheur et inclure des mots-clés pertinents pour la réparation de smartphones. Réponds uniquement avec le titre SEO, sans guillemets.`,
      
      meta_description: `Crée une meta-description SEO optimisée (max 160 caractères) pour cet article. Titre: "${currentValue}". Contenu: "${content?.substring(0, 300) || ''}". Elle doit inciter au clic. Réponds uniquement avec la meta-description, sans guillemets.`,
      
      keywords: `Génère 8-12 mots-clés SEO pertinents pour cet article sur la réparation de smartphones. Titre: "${currentValue}". Contenu: "${content?.substring(0, 300) || ''}". Réponds uniquement avec les mots-clés séparés par des virgules, sans guillemets.`,
      
      content: `Améliore ce contenu d'article de blog en le rendant plus engageant et visuellement attrayant. Remplace les balises markdown par un formatage naturel, ajoute des emojis contextuels pertinents, et améliore la lisibilité. Contenu: "${currentValue}". Garde la même structure mais rends-le plus moderne et attractif.`
    };

    const prompt = prompts[field as keyof typeof prompts];
    if (!prompt) {
      throw new Error(`Field "${field}" non supporté`);
    }

    let enhancedValue = '';
    let usedModel = ai_model;

    // Essayer avec l'IA sélectionnée, puis fallback sur les autres
    const aiProviders = [
      { name: 'perplexity', available: !!perplexityApiKey, fn: enhanceWithPerplexity },
      { name: 'openai', available: !!openAIApiKey, fn: enhanceWithOpenAI },
      { name: 'mistral', available: !!mistralApiKey, fn: enhanceWithMistral }
    ];

    // Commencer par l'IA demandée
    const preferredProvider = aiProviders.find(p => p.name === ai_model);
    const otherProviders = aiProviders.filter(p => p.name !== ai_model);
    const orderedProviders = preferredProvider ? [preferredProvider, ...otherProviders] : aiProviders;

    let lastError = null;
    
    for (const provider of orderedProviders) {
      if (!provider.available) {
        console.log(`⚠️ ${provider.name} non disponible (clé API manquante)`);
        continue;
      }

      try {
        console.log(`Tentative avec ${provider.name}...`);
        enhancedValue = await provider.fn(prompt);
        usedModel = provider.name;
        console.log(`✅ Succès avec ${provider.name}`);
        break;
      } catch (error) {
        console.error(`❌ Erreur avec ${provider.name}:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!enhancedValue) {
      throw new Error(`Aucune IA disponible. Dernière erreur: ${lastError?.message || 'Inconnue'}`);
    }

    // Nettoyer la réponse
    enhancedValue = enhancedValue.trim().replace(/^["']|["']$/g, '');

    async function enhanceWithPerplexity(prompt: string): Promise<string> {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
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
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
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
        const errorText = await response.text();
        throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    }

    console.log('✅ Amélioration réussie');

    return new Response(JSON.stringify({ 
      success: true,
      enhanced_value: enhancedValue,
      ai_model: usedModel
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

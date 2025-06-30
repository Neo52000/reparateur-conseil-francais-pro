
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, ai_model = 'perplexity' } = await req.json();

    if (!prompt) {
      console.error('❌ Prompt requis');
      return new Response(JSON.stringify({ 
        error: 'Prompt requis',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🔍 Fetching mobile news with ${ai_model}...`);

    let rawContent = '';
    
    // Choisir l'IA selon le paramètre
    if (ai_model === 'perplexity' && perplexityApiKey) {
      rawContent = await fetchWithPerplexity(prompt);
    } else if (ai_model === 'openai' && openAIApiKey) {
      rawContent = await fetchWithOpenAI(prompt);
    } else if (ai_model === 'mistral' && mistralApiKey) {
      rawContent = await fetchWithMistral(prompt);
    } else {
      // Fallback sur la première IA disponible
      if (perplexityApiKey) {
        rawContent = await fetchWithPerplexity(prompt);
      } else if (openAIApiKey) {
        rawContent = await fetchWithOpenAI(prompt);
      } else if (mistralApiKey) {
        rawContent = await fetchWithMistral(prompt);
      } else {
        throw new Error('Aucune clé API configurée');
      }
    }

    console.log('📄 Raw AI response:', rawContent);

    // Essayer de parser le JSON depuis la réponse
    let newsData = { news: [] };
    try {
      // Chercher le JSON dans la réponse
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        newsData = JSON.parse(jsonMatch[0]);
      } else {
        // Si pas de JSON trouvé, créer une structure basique
        newsData = {
          news: [{
            title: "Actualités mobiles récupérées",
            summary: rawContent,
            date: new Date().toLocaleDateString('fr-FR'),
            source: ai_model.charAt(0).toUpperCase() + ai_model.slice(1) + ' AI'
          }]
        };
      }
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      // En cas d'erreur de parsing, utiliser le contenu brut
      newsData = {
        news: [{
          title: "Actualités mobiles du jour",
          summary: rawContent,
          date: new Date().toLocaleDateString('fr-FR'),
          source: ai_model.charAt(0).toUpperCase() + ai_model.slice(1) + ' AI'
        }]
      };
    }

    console.log('✅ News fetched successfully:', newsData.news.length, 'items');

    return new Response(JSON.stringify({ 
      success: true,
      news: newsData.news,
      ai_model: ai_model,
      message: `${newsData.news.length} actualités récupérées avec succès via ${ai_model}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in fetch-mobile-news function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erreur interne du serveur',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchWithPerplexity(prompt: string): Promise<string> {
  if (!perplexityApiKey) {
    throw new Error('Clé API Perplexity non configurée');
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en actualités technologiques spécialisé dans la téléphonie mobile et les réparations. 
          Recherche et présente les actualités récentes de manière structurée.
          
          Format de réponse JSON :
          {
            "news": [
              {
                "title": "Titre de l'actualité",
                "summary": "Résumé détaillé de l'actualité en français",
                "date": "Date de l'actualité",
                "source": "Source de l'information"
              }
            ]
          }`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 2000,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: 'week',
      frequency_penalty: 1,
      presence_penalty: 0
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Perplexity API error:', response.status, errorText);
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function fetchWithOpenAI(prompt: string): Promise<string> {
  if (!openAIApiKey) {
    throw new Error('Clé API OpenAI non configurée');
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
          content: `Tu es un expert en actualités technologiques spécialisé dans la téléphonie mobile et les réparations. 
          Recherche et présente les actualités récentes de manière structurée.
          
          Format de réponse JSON :
          {
            "news": [
              {
                "title": "Titre de l'actualité",
                "summary": "Résumé détaillé de l'actualité en français",
                "date": "Date de l'actualité",
                "source": "Source de l'information"
              }
            ]
          }`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function fetchWithMistral(prompt: string): Promise<string> {
  if (!mistralApiKey) {
    throw new Error('Clé API Mistral non configurée');
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${mistralApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en actualités technologiques spécialisé dans la téléphonie mobile et les réparations. 
          Recherche et présente les actualités récentes de manière structurée.
          
          Format de réponse JSON :
          {
            "news": [
              {
                "title": "Titre de l'actualité",
                "summary": "Résumé détaillé de l'actualité en français",
                "date": "Date de l'actualité",
                "source": "Source de l'information"
              }
            ]
          }`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Mistral API error:', response.status, errorText);
    throw new Error(`Mistral API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

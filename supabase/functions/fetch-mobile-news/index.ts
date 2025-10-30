
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to parse news from AI response
function parseNewsResponse(rawContent: string, aiModel: string) {
  console.log('🔍 Parsing news response, length:', rawContent.length);
  
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(rawContent);
    if (parsed.news && Array.isArray(parsed.news)) {
      console.log('✅ Direct JSON parsing successful');
      return { news: parsed.news };
    }
  } catch (e) {
    console.log('⚠️ Direct JSON parsing failed, trying extraction...');
  }

  // Try to extract JSON from response
  const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.news && Array.isArray(parsed.news)) {
        console.log('✅ JSON extraction successful');
        return { news: parsed.news };
      }
    } catch (e) {
      console.log('⚠️ JSON extraction failed');
    }
  }

  // Fallback: create news from raw content
  console.log('⚠️ Using fallback parsing for raw content');
  const lines = rawContent.split('\n').filter(line => line.trim());
  const news = [];
  
  // Try to extract news items from lines
  let currentNews = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('titre') || trimmed.includes('Title') || trimmed.match(/^\d+\./)) {
      if (currentNews) {
        news.push(currentNews);
      }
      currentNews = {
        title: trimmed.replace(/^\d+\.?\s*/, '').replace(/titre:?\s*/i, ''),
        summary: '',
        date: new Date().toLocaleDateString('fr-FR'),
        source: aiModel.charAt(0).toUpperCase() + aiModel.slice(1) + ' AI'
      };
    } else if (currentNews && trimmed) {
      currentNews.summary += (currentNews.summary ? ' ' : '') + trimmed;
    }
  }
  
  if (currentNews) {
    news.push(currentNews);
  }

  // If no structured news found, create one item from content
  if (news.length === 0) {
    news.push({
      title: "Actualités mobiles récupérées",
      summary: rawContent.substring(0, 500) + (rawContent.length > 500 ? '...' : ''),
      date: new Date().toLocaleDateString('fr-FR'),
      source: aiModel.charAt(0).toUpperCase() + aiModel.slice(1) + ' AI'
    });
  }

  return { news };
}

// AI Functions
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
      model: 'sonar',
      messages: [
        {
          role: 'user',
          content: `Tu es un expert en actualités technologiques spécialisé dans la téléphonie mobile et les réparations. 
          
          ${prompt}
          
          Réponds au format JSON suivant :
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
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Perplexity API error:', response.status, errorText);
    throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
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
    
    // Parser l'erreur pour avoir plus de détails
    let errorDetail = `OpenAI API error: ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error?.message) {
        errorDetail = errorData.error.message;
      }
    } catch (e) {
      // Garder le message par défaut
    }
    
    throw new Error(errorDetail);
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
    throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

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

    // Vérifier la disponibilité des clés API
    const availableAPIs = {
      perplexity: !!perplexityApiKey,
      openai: !!openAIApiKey,
      mistral: !!mistralApiKey
    };

    console.log('🔑 Available APIs:', availableAPIs);

    // Si l'IA demandée n'est pas disponible, proposer une alternative
    if (!availableAPIs[ai_model as keyof typeof availableAPIs]) {
      const fallbackAI = Object.entries(availableAPIs).find(([_, available]) => available)?.[0];
      if (!fallbackAI) {
        return new Response(JSON.stringify({ 
          error: 'Aucune clé API configurée. Veuillez configurer au moins une clé API (Perplexity, OpenAI ou Mistral) dans les secrets Supabase.',
          success: false 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log(`⚠️ ${ai_model} not available, falling back to ${fallbackAI}`);
    }

    let rawContent = '';
    let usedModel = ai_model;
    
    // Essayer avec l'IA demandée, puis fallback sur les autres
    try {
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
          usedModel = 'perplexity';
        } else if (openAIApiKey) {
          rawContent = await fetchWithOpenAI(prompt);
          usedModel = 'openai';
        } else if (mistralApiKey) {
          rawContent = await fetchWithMistral(prompt);
          usedModel = 'mistral';
        } else {
          throw new Error('Aucune clé API configurée');
        }
      }
    } catch (apiError) {
      console.error(`❌ Error with ${ai_model}:`, apiError);
      
      // Essayer avec une autre IA en cas d'échec
      const alternatives = Object.entries(availableAPIs)
        .filter(([key, available]) => key !== ai_model && available)
        .map(([key]) => key);

      if (alternatives.length > 0) {
        console.log(`🔄 Trying fallback with ${alternatives[0]}...`);
        try {
          if (alternatives[0] === 'perplexity') {
            rawContent = await fetchWithPerplexity(prompt);
            usedModel = 'perplexity';
          } else if (alternatives[0] === 'openai') {
            rawContent = await fetchWithOpenAI(prompt);
            usedModel = 'openai';
          } else if (alternatives[0] === 'mistral') {
            rawContent = await fetchWithMistral(prompt);
            usedModel = 'mistral';
          }
        } catch (fallbackError) {
          console.error(`❌ Fallback also failed:`, fallbackError);
          throw apiError; // Throw original error
        }
      } else {
        throw apiError;
      }
    }

    console.log('📄 Raw AI response:', rawContent.substring(0, 200) + '...');

    // Parse the news response using the flexible parser
    const newsData = parseNewsResponse(rawContent, usedModel);

    console.log('✅ News parsed successfully:', newsData.news.length, 'items');

    return new Response(JSON.stringify({ 
      success: true,
      news: newsData.news,
      ai_model: usedModel,
      message: `${newsData.news.length} actualités récupérées avec succès via ${usedModel}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in fetch-mobile-news function:', error);
    
    // Messages d'erreur plus spécifiques
    let errorMessage = error.message || 'Erreur interne du serveur';
    if (error.message?.includes('429')) {
      errorMessage = 'Quota API dépassé. Essayez avec une autre IA ou attendez quelques minutes.';
    } else if (error.message?.includes('401')) {
      errorMessage = 'Clé API invalide ou non configurée. Vérifiez la configuration dans les secrets Supabase.';
    } else if (error.message?.includes('insufficient_quota')) {
      errorMessage = 'Quota API dépassé. Vérifiez votre plan ou essayez avec une autre IA.';
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

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
    const { prompt } = await req.json();

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

    if (!perplexityApiKey) {
      console.error('❌ Clé API Perplexity manquante');
      return new Response(JSON.stringify({ 
        error: 'Clé API Perplexity non configurée',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🔍 Fetching mobile news with Perplexity...');

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
    const rawContent = data.choices[0].message.content;
    
    console.log('📄 Raw Perplexity response:', rawContent);

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
            source: "Perplexity AI"
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
          source: "Perplexity AI"
        }]
      };
    }

    console.log('✅ News fetched successfully:', newsData.news.length, 'items');

    return new Response(JSON.stringify({ 
      success: true,
      news: newsData.news,
      message: `${newsData.news.length} actualités récupérées avec succès`
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

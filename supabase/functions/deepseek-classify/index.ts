
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { repairersData, prompt } = await req.json();
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    console.log(`🤖 Classification DeepSeek de ${repairersData.length} réparateurs`);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en classification de données d\'entreprises. Tu réponds UNIQUEMENT avec du JSON valide.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur DeepSeek API:', errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Pas de réponse de DeepSeek');
    }

    let classifiedData;
    try {
      classifiedData = JSON.parse(content);
    } catch (parseError) {
      console.error('Erreur parsing JSON DeepSeek:', parseError);
      console.log('Contenu reçu:', content);
      throw new Error('Réponse DeepSeek invalide');
    }

    console.log(`✅ Classification DeepSeek terminée: ${classifiedData.length} résultats`);

    return new Response(JSON.stringify({ classifiedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur fonction DeepSeek classify:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      classifiedData: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { repairType, deviceBrand, deviceModel, location, currentMarketPrices } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const startTime = Date.now();

    // Fetch market data for context
    const { data: repairers } = await supabase
      .from('repairers')
      .select('name, city, services, ai_quality_score, ai_price_competitiveness')
      .eq('city', location)
      .limit(20);

    const messages = [
      {
        role: 'system',
        content: `Tu es un expert en pricing dynamique pour les réparations de smartphones.
Ton rôle est d'analyser le marché et de suggérer des prix optimaux pour maximiser 
la compétitivité tout en garantissant une marge saine.`
      },
      {
        role: 'user',
        content: `Analyse de pricing pour:
- Type de réparation: ${repairType}
- Appareil: ${deviceBrand} ${deviceModel}
- Localisation: ${location}
- Prix marché actuels: ${JSON.stringify(currentMarketPrices || {})}
- Nombre de concurrents locaux: ${repairers?.length || 0}

Fournis une recommandation de pricing détaillée.`
      }
    ];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        tools: [
          {
            type: 'function',
            function: {
              name: 'suggest_pricing',
              description: 'Suggest optimal pricing strategy',
              parameters: {
                type: 'object',
                properties: {
                  recommended_price: { 
                    type: 'number', 
                    description: 'Recommended price in EUR' 
                  },
                  price_range_min: { 
                    type: 'number', 
                    description: 'Minimum recommended price' 
                  },
                  price_range_max: { 
                    type: 'number', 
                    description: 'Maximum recommended price' 
                  },
                  market_position: { 
                    type: 'string', 
                    enum: ['economy', 'mid-range', 'premium'],
                    description: 'Suggested market positioning' 
                  },
                  competition_level: { 
                    type: 'string', 
                    enum: ['low', 'medium', 'high'],
                    description: 'Local competition intensity' 
                  },
                  pricing_strategy: { 
                    type: 'string',
                    description: 'Recommended pricing strategy explanation' 
                  },
                  seasonal_factors: { 
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Seasonal factors affecting pricing' 
                  },
                  demand_forecast: { 
                    type: 'string',
                    enum: ['low', 'medium', 'high'],
                    description: 'Forecasted demand level' 
                  },
                  confidence_score: { 
                    type: 'number',
                    minimum: 0,
                    maximum: 100,
                    description: 'Confidence in pricing recommendation' 
                  }
                },
                required: ['recommended_price', 'price_range_min', 'price_range_max', 'market_position', 'confidence_score']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_pricing' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`Lovable AI error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call response from AI');
    }

    const pricingData = JSON.parse(toolCall.function.arguments);
    
    // Log analytics
    const latency = Date.now() - startTime;
    await supabase.from('ai_analytics').insert({
      provider: 'lovable',
      model: 'google/gemini-2.5-flash',
      function_name: 'ai-dynamic-pricing',
      latency_ms: latency,
      success: true
    });

    return new Response(
      JSON.stringify({
        success: true,
        pricing: pricingData,
        market_context: {
          local_competitors: repairers?.length || 0,
          analyzed_at: new Date().toISOString()
        },
        latency_ms: latency,
        model: 'gemini-2.5-flash'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-dynamic-pricing:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

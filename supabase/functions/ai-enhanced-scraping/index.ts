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
    const { url, html, imageUrls } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const startTime = Date.now();

    // Use Gemini 2.5 Pro with vision for complex extraction
    const messages = [
      {
        role: 'system',
        content: `Tu es un expert en extraction de données de réparateurs de smartphones. 
Analyse le contenu HTML et les images pour extraire des informations structurées et précises.
Évalue également la qualité du réparateur selon plusieurs critères.`
      },
      {
        role: 'user',
        content: `Analyse ce réparateur et extrait les informations suivantes:

HTML: ${html.substring(0, 5000)}

${imageUrls?.length ? `Images disponibles: ${imageUrls.join(', ')}` : ''}

Fournis une analyse complète.`
      }
    ];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages,
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_repairer_data',
              description: 'Extract structured repairer information',
              parameters: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Business name' },
                  address: { type: 'string', description: 'Full address' },
                  city: { type: 'string', description: 'City' },
                  postal_code: { type: 'string', description: '5-digit postal code' },
                  phone: { type: 'string', description: 'Phone number' },
                  email: { type: 'string', description: 'Email address' },
                  website: { type: 'string', description: 'Website URL' },
                  description: { type: 'string', description: 'Business description' },
                  opening_hours: { 
                    type: 'object', 
                    description: 'Opening hours by day',
                    properties: {
                      monday: { type: 'string' },
                      tuesday: { type: 'string' },
                      wednesday: { type: 'string' },
                      thursday: { type: 'string' },
                      friday: { type: 'string' },
                      saturday: { type: 'string' },
                      sunday: { type: 'string' }
                    }
                  },
                  services: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'List of services offered' 
                  },
                  specialties: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'Specific specialties (brands, repair types)' 
                  },
                  price_range: { 
                    type: 'string', 
                    enum: ['low', 'medium', 'high'],
                    description: 'Price competitiveness' 
                  },
                  quality_score: { 
                    type: 'number', 
                    minimum: 0, 
                    maximum: 100,
                    description: 'Overall quality score based on website, professionalism, information completeness' 
                  },
                  reliability_score: { 
                    type: 'number', 
                    minimum: 0, 
                    maximum: 100,
                    description: 'Reliability score based on certifications, guarantees, reviews' 
                  },
                  price_competitiveness: { 
                    type: 'number', 
                    minimum: 0, 
                    maximum: 100,
                    description: 'Price competitiveness (100 = best value)' 
                  },
                  red_flags: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'Potential concerns or issues detected' 
                  },
                  workshop_quality_indicators: {
                    type: 'object',
                    description: 'Quality indicators from images',
                    properties: {
                      cleanliness: { type: 'number', minimum: 0, maximum: 10 },
                      equipment_visible: { type: 'boolean' },
                      professional_appearance: { type: 'number', minimum: 0, maximum: 10 },
                      certifications_displayed: { type: 'boolean' }
                    }
                  }
                },
                required: ['name', 'quality_score', 'reliability_score', 'price_competitiveness']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_repairer_data' } }
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

    const extractedData = JSON.parse(toolCall.function.arguments);
    
    // Calculate overall AI quality score (average of the 3 scores)
    const aiQualityScore = Math.round(
      (extractedData.quality_score + extractedData.reliability_score + extractedData.price_competitiveness) / 3
    );

    // Log analytics
    const latency = Date.now() - startTime;
    await supabase.from('ai_analytics').insert({
      provider: 'lovable',
      model: 'google/gemini-2.5-pro',
      function_name: 'ai-enhanced-scraping',
      latency_ms: latency,
      success: true
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...extractedData,
          ai_quality_score: aiQualityScore,
          ai_analyzed_at: new Date().toISOString(),
          source_url: url
        },
        latency_ms: latency,
        model: 'gemini-2.5-pro'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-enhanced-scraping:', error);
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

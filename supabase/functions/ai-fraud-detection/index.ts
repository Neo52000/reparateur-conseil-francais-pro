import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function checkAdminRole(supabase: any, authHeader: string | null): Promise<boolean> {
  try {
    if (!authHeader?.startsWith("Bearer ")) return false;
    
    const token = authHeader.slice(7);
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    const userId = payload?.sub;
    
    if (!userId) return false;
    
    // SECURITY: Use server-side has_role() function instead of trusting JWT metadata
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });
    
    if (error) {
      console.error("❌ has_role RPC error:", error);
      return false;
    }
    
    return Boolean(data);
  } catch (e) {
    console.error("❌ Admin check error:", e);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const authHeader = req.headers.get("Authorization");

    // SECURITY: Check admin role using server-side has_role() function
    const isAdmin = await checkAdminRole(supabase, authHeader);

    if (!isAdmin) {
      console.log("❌ Access denied: user is not admin");
      return new Response(
        JSON.stringify({ success: false, error: "forbidden", message: "Admin required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { repairerId, mode = 'single' } = await req.json();
    const startTime = Date.now();

    let repairersToAnalyze = [];

    if (mode === 'batch') {
      // Analyze all recent repairers without fraud check
      const { data } = await supabase
        .from('repairers')
        .select('*')
        .is('fraud_risk_score', null)
        .order('created_at', { ascending: false })
        .limit(50);
      repairersToAnalyze = data || [];
    } else {
      // Analyze single repairer
      const { data } = await supabase
        .from('repairers')
        .select('*')
        .eq('id', repairerId)
        .single();
      repairersToAnalyze = data ? [data] : [];
    }

    const results = [];

    for (const repairer of repairersToAnalyze) {
      const messages = [
        {
          role: 'system',
          content: `Tu es un expert en détection de fraudes pour les plateformes de mise en relation.
Analyse les données du réparateur pour détecter des signaux suspects ou frauduleux.`
        },
        {
          role: 'user',
          content: `Analyse ce réparateur pour détecter d'éventuels signaux de fraude:

Nom: ${repairer.name}
Adresse: ${repairer.address}, ${repairer.city} ${repairer.postal_code}
Téléphone: ${repairer.phone || 'Non fourni'}
Email: ${repairer.email || 'Non fourni'}
Site web: ${repairer.website || 'Non fourni'}
Description: ${repairer.description || 'Non fournie'}
Services: ${repairer.services?.join(', ') || 'Non fournis'}
Note qualité: ${repairer.ai_quality_score || 'Non évaluée'}
Vérifié: ${repairer.is_verified ? 'Oui' : 'Non'}
Source: ${repairer.source}
Date création: ${repairer.created_at}

Fournis une analyse de risque détaillée.`
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
                name: 'analyze_fraud_risk',
                description: 'Analyze fraud risk for a repairer',
                parameters: {
                  type: 'object',
                  properties: {
                    risk_score: { 
                      type: 'number',
                      minimum: 0,
                      maximum: 100,
                      description: 'Risk score (0 = safe, 100 = very suspicious)' 
                    },
                    risk_level: { 
                      type: 'string',
                      enum: ['low', 'medium', 'high', 'critical'],
                      description: 'Overall risk level' 
                    },
                    red_flags: { 
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Specific suspicious elements detected' 
                    },
                    suspicious_patterns: { 
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Patterns that match fraud indicators' 
                    },
                    verification_recommendations: { 
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Actions to verify legitimacy' 
                    },
                    requires_manual_review: { 
                      type: 'boolean',
                      description: 'Whether manual review is needed' 
                    },
                    confidence_score: { 
                      type: 'number',
                      minimum: 0,
                      maximum: 100,
                      description: 'Confidence in fraud analysis' 
                    },
                    analysis_summary: { 
                      type: 'string',
                      description: 'Brief summary of fraud analysis' 
                    }
                  },
                  required: ['risk_score', 'risk_level', 'requires_manual_review', 'confidence_score']
                }
              }
            }
          ],
          tool_choice: { type: 'function', function: { name: 'analyze_fraud_risk' } }
        }),
      });

      if (!aiResponse.ok) {
        console.error(`AI error for repairer ${repairer.id}`);
        continue;
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices[0].message.tool_calls?.[0];
      
      if (!toolCall) {
        console.error(`No tool call for repairer ${repairer.id}`);
        continue;
      }

      const fraudAnalysis = JSON.parse(toolCall.function.arguments);
      
      // Update repairer with fraud analysis
      await supabase
        .from('repairers')
        .update({
          fraud_risk_score: fraudAnalysis.risk_score,
          fraud_risk_level: fraudAnalysis.risk_level,
          fraud_red_flags: fraudAnalysis.red_flags,
          requires_manual_review: fraudAnalysis.requires_manual_review,
          fraud_analyzed_at: new Date().toISOString()
        })
        .eq('id', repairer.id);

      results.push({
        repairer_id: repairer.id,
        repairer_name: repairer.name,
        ...fraudAnalysis
      });

      // Small delay between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Log analytics
    const latency = Date.now() - startTime;
    await supabase.from('ai_analytics').insert({
      provider: 'lovable',
      model: 'google/gemini-2.5-flash',
      function_name: 'ai-fraud-detection',
      latency_ms: latency,
      success: true
    });

    return new Response(
      JSON.stringify({
        success: true,
        analyzed_count: results.length,
        high_risk_count: results.filter(r => r.risk_level === 'high' || r.risk_level === 'critical').length,
        requires_review_count: results.filter(r => r.requires_manual_review).length,
        results: results,
        latency_ms: latency,
        model: 'gemini-2.5-flash'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-fraud-detection:', error);
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

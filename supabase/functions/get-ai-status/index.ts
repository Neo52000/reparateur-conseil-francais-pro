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
    // Vérifier la présence des clés API sans faire d'appels externes
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY');
    const mistralKey = Deno.env.get('CLE_API_MISTRAL');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    console.log('🔍 Checking AI service keys:', {
      deepseek: !!deepseekKey,
      mistral: !!mistralKey,
      openai: !!openaiKey
    });

    const statuses = {
      deepseek: deepseekKey ? 'configured' : 'needs_config',
      mistral: mistralKey ? 'configured' : 'needs_config',
      openai: openaiKey ? 'configured' : 'needs_config'
    };

    return new Response(JSON.stringify({
      success: true,
      statuses,
      message: 'AI service status check completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error checking AI status:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      statuses: {
        deepseek: 'error',
        mistral: 'error', 
        openai: 'error'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
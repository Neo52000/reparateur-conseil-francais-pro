import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProviderStatus {
  name: string;
  key: string;
  status: 'active' | 'error' | 'warning' | 'unknown';
  message: string;
  lastCheck?: string;
  credits?: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  docsUrl?: string;
}

async function checkLovableAI(apiKey: string): Promise<ProviderStatus> {
  const result: ProviderStatus = {
    name: 'Lovable AI',
    key: 'LOVABLE_API_KEY',
    status: 'unknown',
    message: 'Non vérifié',
    docsUrl: 'https://docs.lovable.dev/features/ai'
  };

  if (!apiKey) {
    result.status = 'error';
    result.message = 'Clé API non configurée';
    return result;
  }

  try {
    // Simple test request to check if API is working
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      })
    });

    if (response.ok) {
      result.status = 'active';
      result.message = 'API fonctionnelle';
    } else if (response.status === 402) {
      result.status = 'warning';
      result.message = 'Crédits épuisés - Rechargez votre compte';
      result.credits = { used: 100, limit: 100, unlimited: false };
    } else if (response.status === 429) {
      result.status = 'warning';
      result.message = 'Rate limit atteint - Réessayez plus tard';
    } else if (response.status === 401) {
      result.status = 'error';
      result.message = 'Clé API invalide';
    } else {
      result.status = 'error';
      result.message = `Erreur HTTP ${response.status}`;
    }
  } catch (error) {
    result.status = 'error';
    result.message = `Erreur de connexion: ${error.message}`;
  }

  result.lastCheck = new Date().toISOString();
  return result;
}

async function checkOpenAI(apiKey: string): Promise<ProviderStatus> {
  const result: ProviderStatus = {
    name: 'OpenAI',
    key: 'OPENAI_API_KEY',
    status: 'unknown',
    message: 'Non vérifié',
    docsUrl: 'https://platform.openai.com/api-keys'
  };

  if (!apiKey) {
    result.status = 'error';
    result.message = 'Clé API non configurée';
    return result;
  }

  try {
    // Check models endpoint (doesn't consume tokens)
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });

    if (response.ok) {
      result.status = 'active';
      result.message = 'API fonctionnelle';
      result.credits = { used: 0, limit: 0, unlimited: true };
    } else if (response.status === 401) {
      result.status = 'error';
      result.message = 'Clé API invalide ou expirée';
    } else if (response.status === 429) {
      result.status = 'warning';
      result.message = 'Rate limit ou quota dépassé';
    } else {
      result.status = 'error';
      result.message = `Erreur HTTP ${response.status}`;
    }
  } catch (error) {
    result.status = 'error';
    result.message = `Erreur de connexion: ${error.message}`;
  }

  result.lastCheck = new Date().toISOString();
  return result;
}

async function checkGemini(apiKey: string): Promise<ProviderStatus> {
  const result: ProviderStatus = {
    name: 'Google Gemini',
    key: 'GEMINI_API_KEY',
    status: 'unknown',
    message: 'Non vérifié',
    docsUrl: 'https://aistudio.google.com/apikey'
  };

  if (!apiKey) {
    result.status = 'error';
    result.message = 'Clé API non configurée';
    return result;
  }

  try {
    // Check models list endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (response.ok) {
      result.status = 'active';
      result.message = 'API fonctionnelle';
      result.credits = { used: 0, limit: 0, unlimited: true };
    } else if (response.status === 400 || response.status === 403) {
      result.status = 'error';
      result.message = 'Clé API invalide ou restrictions d\'accès';
    } else if (response.status === 404) {
      result.status = 'error';
      result.message = 'Clé API invalide';
    } else {
      result.status = 'error';
      result.message = `Erreur HTTP ${response.status}`;
    }
  } catch (error) {
    result.status = 'error';
    result.message = `Erreur de connexion: ${error.message}`;
  }

  result.lastCheck = new Date().toISOString();
  return result;
}

async function checkMistral(apiKey: string): Promise<ProviderStatus> {
  const result: ProviderStatus = {
    name: 'Mistral AI',
    key: 'CLE_API_MISTRAL',
    status: 'unknown',
    message: 'Non vérifié',
    docsUrl: 'https://console.mistral.ai/api-keys'
  };

  if (!apiKey) {
    result.status = 'error';
    result.message = 'Clé API non configurée';
    return result;
  }

  try {
    // Check models list endpoint
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });

    if (response.ok) {
      result.status = 'active';
      result.message = 'API fonctionnelle';
      result.credits = { used: 0, limit: 0, unlimited: true };
    } else if (response.status === 401) {
      result.status = 'error';
      result.message = 'Clé API invalide';
    } else if (response.status === 429) {
      result.status = 'warning';
      result.message = 'Rate limit atteint';
    } else {
      result.status = 'error';
      result.message = `Erreur HTTP ${response.status}`;
    }
  } catch (error) {
    result.status = 'error';
    result.message = `Erreur de connexion: ${error.message}`;
  }

  result.lastCheck = new Date().toISOString();
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get all API keys
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY') || '';
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
    const MISTRAL_API_KEY = Deno.env.get('CLE_API_MISTRAL') || '';

    console.log('🔍 Checking AI provider statuses...');

    // Check all providers in parallel
    const [lovable, openai, gemini, mistral] = await Promise.all([
      checkLovableAI(LOVABLE_API_KEY),
      checkOpenAI(OPENAI_API_KEY),
      checkGemini(GEMINI_API_KEY),
      checkMistral(MISTRAL_API_KEY)
    ]);

    const providers = [lovable, openai, gemini, mistral];
    
    const activeCount = providers.filter(p => p.status === 'active').length;
    const errorCount = providers.filter(p => p.status === 'error').length;

    console.log(`✅ Check complete: ${activeCount} active, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        providers,
        summary: {
          active: activeCount,
          errors: errorCount,
          warnings: providers.filter(p => p.status === 'warning').length,
          hasWorkingProvider: activeCount > 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error checking AI status:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

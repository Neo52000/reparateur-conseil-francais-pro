import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIProviderStatus {
  name: string;
  status: 'available' | 'configured' | 'needs_config' | 'error';
  configured: boolean;
  lastChecked: string;
  responseTime?: number;
  error?: string;
}

async function checkProvider(name: string, envKey: string, testFn?: () => Promise<void>): Promise<AIProviderStatus> {
  const apiKey = Deno.env.get(envKey);
  const startTime = Date.now();
  
  if (!apiKey) {
    return {
      name,
      status: 'needs_config',
      configured: false,
      lastChecked: new Date().toISOString()
    };
  }

  // If no test function provided, just check if configured
  if (!testFn) {
    return {
      name,
      status: 'configured',
      configured: true,
      lastChecked: new Date().toISOString()
    };
  }

  try {
    await testFn();
    return {
      name,
      status: 'available',
      configured: true,
      lastChecked: new Date().toISOString(),
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      name,
      status: 'error',
      configured: true,
      lastChecked: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}

async function testOpenAI(): Promise<void> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    }
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }
}

async function testMistral(): Promise<void> {
  const apiKey = Deno.env.get('CLE_API_MISTRAL') || Deno.env.get('MISTRAL_API_KEY');
  const response = await fetch('https://api.mistral.ai/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    }
  });
  
  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`);
  }
}

async function testDeepSeek(): Promise<void> {
  const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
  // DeepSeek doesn't have a models endpoint, so we'll do a minimal completion test
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 1
    })
  });
  
  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullTest } = await req.json().catch(() => ({}));
    
    console.log('🔍 Checking AI providers status...', { fullTest });
    
    // Check providers - only do full connectivity test if requested
    const providers = await Promise.all([
      checkProvider('OpenAI', 'OPENAI_API_KEY', fullTest ? testOpenAI : undefined),
      checkProvider('Mistral', 'CLE_API_MISTRAL', fullTest ? testMistral : undefined), 
      checkProvider('DeepSeek', 'DEEPSEEK_API_KEY', fullTest ? testDeepSeek : undefined)
    ]);

    // Check GPT-OSS if configured
    const gptOssUrl = Deno.env.get('GPT_OSS_BASE_URL');
    const gptOssKey = Deno.env.get('GPT_OSS_API_KEY');
    
    if (gptOssUrl && gptOssKey) {
      const gptOssTest = fullTest ? async () => {
        const response = await fetch(`${gptOssUrl.replace(/\/$/, '')}/v1/models`, {
          headers: {
            'Authorization': `Bearer ${gptOssKey}`,
          }
        });
        
        if (!response.ok) {
          throw new Error(`GPT-OSS API error: ${response.status}`);
        }
      } : undefined;
      
      providers.push(await checkProvider('GPT-OSS', 'GPT_OSS_API_KEY', gptOssTest));
    }

    // Summary statistics
    const summary = {
      total: providers.length,
      available: providers.filter(p => p.status === 'available').length,
      configured: providers.filter(p => p.configured).length,
      needsConfig: providers.filter(p => p.status === 'needs_config').length,
      errors: providers.filter(p => p.status === 'error').length
    };

    // Create status map for backward compatibility with useSystemDiagnostics
    const statuses = providers.reduce((acc, provider) => {
      const key = provider.name.toLowerCase().replace(/[^a-z]/g, '');
      acc[key] = provider.status === 'available' ? 'available' : 
                 provider.status === 'configured' ? 'configured' :
                 provider.status;
      return acc;
    }, {} as Record<string, string>);

    const result = {
      success: true,
      providers,
      summary,
      statuses,
      timestamp: new Date().toISOString(),
      healthy: summary.available > 0 || (!fullTest && summary.configured > 0),
      recommendedMode: summary.available > 0 ? 'ai' : 
                      summary.configured > 0 ? 'hybrid' : 'fallback',
      message: `AI service status check completed. ${summary.configured}/${summary.total} configured, ${summary.available}/${summary.total} available.`
    };

    console.log('✅ AI providers status check completed:', {
      configured: summary.configured,
      available: summary.available,
      total: summary.total,
      mode: result.recommendedMode
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error checking AI providers:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to check AI providers',
      message: error.message,
      providers: [],
      summary: { total: 0, available: 0, configured: 0, needsConfig: 0, errors: 1 },
      statuses: {
        deepseek: 'error',
        mistral: 'error',
        openai: 'error'
      },
      timestamp: new Date().toISOString(),
      healthy: false,
      recommendedMode: 'fallback'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
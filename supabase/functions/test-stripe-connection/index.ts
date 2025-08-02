import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { publicKey, secretKey } = await req.json();
    
    console.log('Testing Stripe connection with keys:', { 
      publicKey: publicKey?.substring(0, 20) + '...', 
      secretKey: secretKey?.substring(0, 20) + '...' 
    });

    // Validate key formats
    if (!publicKey || !publicKey.startsWith('pk_')) {
      throw new Error('Invalid public key format');
    }

    if (!secretKey || !secretKey.startsWith('sk_')) {
      throw new Error('Invalid secret key format');
    }

    // Test the secret key by making a simple API call to Stripe
    const stripeApiUrl = 'https://api.stripe.com/v1/balance';
    
    const response = await fetch(stripeApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Stripe API error:', errorData);
      throw new Error(`Stripe API error: ${response.status} ${response.statusText}`);
    }

    const balanceData = await response.json();
    console.log('Stripe connection test successful:', balanceData);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Stripe connection test successful',
        testResult: {
          publicKeyValid: true,
          secretKeyValid: true,
          apiAccessible: true,
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Stripe connection test error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        testResult: {
          publicKeyValid: false,
          secretKeyValid: false,
          apiAccessible: false,
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
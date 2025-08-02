import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { method, amount, cashReceived, items } = await req.json();
    
    console.log('Processing payment:', { method, amount, cashReceived, items });
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Process payment based on method
    let paymentResult;
    
    if (method === 'cash') {
      paymentResult = await processCashPayment({
        amount,
        cashReceived,
        change: Math.max(0, cashReceived - amount)
      });
    } else if (method === 'card' || method === 'contactless') {
      paymentResult = await processCardPayment({
        amount,
        method
      });
    } else {
      throw new Error('Invalid payment method');
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('pos_transactions')
      .insert({
        repairer_id: user.id,
        total_amount: amount,
        tax_amount: amount * 0.2, // 20% VAT
        payment_method: method,
        payment_status: 'completed',
        receipt_data: {
          items,
          payment: paymentResult,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      throw transactionError;
    }

    console.log('Payment processed successfully:', transaction);

    return new Response(
      JSON.stringify({
        success: true,
        transaction,
        payment: paymentResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

async function processCashPayment({ amount, cashReceived, change }: {
  amount: number;
  cashReceived: number;
  change: number;
}) {
  console.log('Processing cash payment:', { amount, cashReceived, change });
  
  if (cashReceived < amount) {
    throw new Error('Insufficient cash received');
  }

  return {
    type: 'cash',
    amount,
    cashReceived,
    change,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}

async function processCardPayment({ amount, method }: {
  amount: number;
  method: string;
}) {
  console.log('Processing card payment:', { amount, method });
  
  // Simulate card processing
  // In real implementation, integrate with Stripe Terminal or similar
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    type: method,
    amount,
    status: 'completed',
    transactionId: `txn_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
}
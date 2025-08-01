import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { payment_intent_id, quote_id } = await req.json();

    // Initialiser Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialiser Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Releasing funds for payment:', payment_intent_id);

    // Vérifier que le travail est validé
    const { data: quote, error: quoteError } = await supabase
      .from('quotes_with_timeline')
      .select('status, repair_validated')
      .eq('id', quote_id)
      .single();

    if (quoteError || !quote) {
      throw new Error('Quote not found');
    }

    if (quote.status !== 'completed' || !quote.repair_validated) {
      throw new Error('Repair not validated by client');
    }

    // Capturer le paiement (libérer les fonds)
    const paymentIntent = await stripe.paymentIntents.capture(payment_intent_id);

    // Mettre à jour le statut du paiement
    const { error } = await supabase
      .from('payments')
      .update({ 
        status: 'succeeded',
        funds_released: true,
        released_at: new Date().toISOString()
      })
      .eq('payment_intent_id', payment_intent_id);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_intent: paymentIntent.id,
        status: paymentIntent.status 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error releasing funds:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
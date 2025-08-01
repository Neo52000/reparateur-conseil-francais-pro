
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
    const { 
      quoteId, 
      repairerId, 
      clientId, 
      amount, 
      description,
      holdFunds = true 
    } = await req.json();

    // Initialiser Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialiser Stripe avec la vraie clé
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Calculer la commission (1%)
    const applicationFeeAmount = Math.round(amount * 0.01);

    // Créer un vrai payment intent Stripe avec rétention
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // montant en centimes
      currency: 'eur',
      application_fee_amount: applicationFeeAmount,
      capture_method: holdFunds ? 'manual' : 'automatic',
      metadata: {
        quote_id: quoteId,
        repairer_id: repairerId,
        client_id: clientId,
        hold_funds: holdFunds.toString()
      },
      description: description
    });

    // Enregistrer l'intention de paiement
    const { error } = await supabase
      .from('payments')
      .insert({
        payment_intent_id: paymentIntent.id,
        quote_id: quoteId,
        repairer_id: repairerId,
        client_id: clientId,
        amount: amount,
        currency: 'eur',
        status: 'pending',
        hold_funds: holdFunds,
        description: description,
        commission_amount: applicationFeeAmount,
        commission_rate: 1.0
      });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
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

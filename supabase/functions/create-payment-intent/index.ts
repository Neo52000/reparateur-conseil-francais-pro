
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // Simuler la création d'un payment intent Stripe
    // En production, vous utiliseriez l'API Stripe réelle
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      amount: amount,
      currency: 'eur',
      status: 'requires_payment_method',
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
      metadata: {
        quote_id: quoteId,
        repairer_id: repairerId,
        client_id: clientId,
        hold_funds: holdFunds.toString()
      }
    };

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
        description: description
      });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify(paymentIntent),
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

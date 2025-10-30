
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
    // ✅ SECURITY FIX: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialiser Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ✅ SECURITY FIX: Verify user identity
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const requestData = await req.json();
    const { 
      quoteId, 
      repairerId, 
      clientId, 
      amount, 
      description,
      holdFunds = true 
    } = requestData;

    // ✅ SECURITY FIX: Input validation
    if (!quoteId || typeof quoteId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid quoteId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!repairerId || typeof repairerId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid repairerId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!clientId || typeof clientId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid clientId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ SECURITY FIX: Verify user authorization - must be the client or an admin
    if (clientId !== user.id) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (roleData?.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Forbidden - Not authorized to create payment for this client' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ✅ SECURITY FIX: Validate amount
    if (typeof amount !== 'number' || amount <= 0 || amount > 100000000) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount - must be positive number and less than 1,000,000€' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ SECURITY FIX: Sanitize description
    const sanitizedDescription = description ? 
      String(description).substring(0, 500).replace(/[<>]/g, '') : 
      'Payment for quote';

    console.log(`[CreatePaymentIntent] User ${user.id} creating payment for quote ${quoteId}`);

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
        hold_funds: holdFunds.toString(),
        created_by: user.id
      },
      description: sanitizedDescription
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
        description: sanitizedDescription,
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

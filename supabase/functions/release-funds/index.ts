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
    // SECURITY: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { payment_intent_id, quote_id } = await req.json();

    // Input validation
    if (!payment_intent_id || typeof payment_intent_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid payment_intent_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!quote_id || typeof quote_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid quote_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // AUTHORIZATION: Check if user is admin or repairer for this quote
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    const isAdmin = roleData?.role === 'admin';

    // Initialiser Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Releasing funds for payment:', payment_intent_id);

    // Vérifier que le travail est validé et permissions
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('quotes_with_timeline')
      .select('status, repair_validated, repairer_id')
      .eq('id', quote_id)
      .single();

    if (quoteError || !quote) {
      throw new Error('Quote not found');
    }

    // Check authorization
    const { data: repairerProfile } = await supabaseAdmin
      .from('repairer_profiles')
      .select('user_id')
      .eq('id', quote.repairer_id)
      .single();

    if (!isAdmin && (!repairerProfile || repairerProfile.user_id !== user.id)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - You do not have permission to release these funds' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (quote.status !== 'completed' || !quote.repair_validated) {
      throw new Error('Repair not validated by client');
    }

    // Capturer le paiement (libérer les fonds)
    const paymentIntent = await stripe.paymentIntents.capture(payment_intent_id);

    // Mettre à jour le statut du paiement
    const { error } = await supabaseAdmin
      .from('payments')
      .update({ 
        status: 'succeeded',
        funds_released: true,
        released_at: new Date().toISOString()
      })
      .eq('payment_intent_id', payment_intent_id);

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'release_funds',
      resource_type: 'payment',
      resource_id: payment_intent_id,
      new_values: { status: 'succeeded', funds_released: true, quote_id }
    });

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
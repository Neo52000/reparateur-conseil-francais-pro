import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  const corsHeaders = buildCorsHeaders(req);

  try {
    // 🔐 Authentification : vérification du JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized — authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized — invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const requestData = await req.json();
    const { quoteId, repairerId, clientId, amount, description, holdFunds = true } = requestData;

    // Validation entrée
    if (!quoteId || typeof quoteId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid quoteId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    if (!repairerId || typeof repairerId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid repairerId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    if (!clientId || typeof clientId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid clientId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 🔐 Autorisation : seul le client concerné ou un admin peut créer le paiement
    if (clientId !== user.id) {
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (roleData?.role !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Forbidden — not authorized to create payment for this client' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    // Validation montant (en centimes : 100 = 1€, max 1 000 000€ = 100 000 000 centimes)
    if (typeof amount !== 'number' || amount <= 0 || amount > 100_000_000) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount — must be > 0 and < 1 000 000€' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const sanitizedDescription = description
      ? String(description).substring(0, 500).replace(/[<>]/g, '')
      : 'Paiement devis TopRéparateurs';

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured (STRIPE_SECRET_KEY missing)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Commission plateforme : 1%
    const applicationFeeAmount = Math.round(amount * 0.01);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      application_fee_amount: applicationFeeAmount,
      capture_method: holdFunds ? 'manual' : 'automatic',
      metadata: {
        quote_id: quoteId,
        repairer_id: repairerId,
        client_id: clientId,
        hold_funds: String(holdFunds),
        created_by: user.id,
      },
      description: sanitizedDescription,
    });

    // Cohérence avec la table : champ stripe_payment_intent_id (pas payment_intent_id)
    const { error: insertError } = await supabaseAdmin
      .from('payments')
      .insert({
        stripe_payment_intent_id: paymentIntent.id,
        quote_id: quoteId,
        repairer_id: repairerId,
        client_id: clientId,
        amount,
        currency: 'eur',
        status: 'pending',
        hold_funds: holdFunds,
        description: sanitizedDescription,
        commission_amount: applicationFeeAmount,
        commission_rate: 1.0,
      });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

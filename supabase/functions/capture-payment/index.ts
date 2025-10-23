import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!stripeKey) {
      throw new Error('Stripe not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { payment_intent_id } = await req.json();

    console.log('[CapturePayment] Capturing payment:', payment_intent_id);

    // Récupérer le paiement
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('stripe_payment_intent_id', payment_intent_id)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found');
    }

    // Vérifier que l'utilisateur a le droit (réparateur ou admin)
    if (payment.repairer_id !== user.id) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!userRole) {
        throw new Error('Unauthorized: not the repairer or admin');
      }
    }

    if (payment.status !== 'authorized') {
      throw new Error(`Payment cannot be captured. Current status: ${payment.status}`);
    }

    // Capturer le paiement via Stripe
    const paymentIntent = await stripe.paymentIntents.capture(payment_intent_id);

    console.log('[CapturePayment] Stripe capture successful:', paymentIntent.status);

    // Mettre à jour le paiement
    await supabase
      .from('payments')
      .update({
        status: 'captured',
        captured_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    // Créer le hold
    await supabase
      .from('payment_holds')
      .insert({
        payment_id: payment.id,
        amount: payment.amount,
        hold_reason: 'Awaiting service completion',
        status: 'held',
        release_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 jours
      });

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        status: 'captured',
        amount: payment.amount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('[CapturePayment] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});

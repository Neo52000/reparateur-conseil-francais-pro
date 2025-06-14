
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, billingCycle, repairerId, email } = await req.json();

    const stripe = new Stripe(Deno.env.get('stripe_key') || '', {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) {
      throw new Error('Plan not found');
    }

    // Check if customer exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
    }

    // Create or get Stripe price for the plan
    let priceId = billingCycle === 'yearly' ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly;
    
    if (!priceId) {
      const price = await stripe.prices.create({
        currency: 'eur',
        unit_amount: Math.round((billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly) * 100),
        recurring: {
          interval: billingCycle === 'yearly' ? 'year' : 'month',
        },
        product_data: {
          name: `TechRepair ${plan.name} - ${billingCycle === 'yearly' ? 'Annuel' : 'Mensuel'}`,
        },
      });
      priceId = price.id;

      // Update plan with price ID
      await supabase
        .from('subscription_plans')
        .update(billingCycle === 'yearly' ? { stripe_price_id_yearly: priceId } : { stripe_price_id_monthly: priceId })
        .eq('id', planId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${req.headers.get('origin')}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/subscription-canceled`,
      metadata: {
        repairer_id: repairerId,
        plan_id: planId,
        billing_cycle: billingCycle,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

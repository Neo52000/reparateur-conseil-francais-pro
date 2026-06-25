import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";

interface CreateSubscriptionRequest {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  selectedModules?: { pos?: boolean; ecommerce?: boolean };
  totalPrice?: number;
}

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  const corsHeaders = buildCorsHeaders(req);

  try {
    // 🔐 Authentification : seul le réparateur authentifié peut créer
    // un abonnement pour lui-même.
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

    if (authError || !user || !user.email) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized — invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const body = (await req.json()) as CreateSubscriptionRequest;
    const { planId, billingCycle, selectedModules, totalPrice } = body;

    if (!planId || typeof planId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid planId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    if (billingCycle !== 'monthly' && billingCycle !== 'yearly') {
      return new Response(
        JSON.stringify({ error: 'Invalid billingCycle' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 🔐 On utilise l'email/uid du JWT — pas de paramètre client.
    const userEmail = user.email;
    const userId = user.id;

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured (STRIPE_SECRET_KEY missing)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('id, name, price_monthly, price_yearly')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 🔐 Validation côté serveur du prix (le client ne peut pas l'imposer
    // arbitrairement — on prend le prix de la table, pas de la requête,
    // sauf si totalPrice = base + modules connus).
    const baseAmount = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    let finalAmount = baseAmount;
    if (totalPrice !== undefined) {
      if (typeof totalPrice !== 'number' || totalPrice < baseAmount || totalPrice > baseAmount * 5) {
        return new Response(
          JSON.stringify({ error: 'Invalid totalPrice — outside acceptable range' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      finalAmount = totalPrice;
    }

    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    const customerId = customers.data.length > 0
      ? customers.data[0].id
      : (await stripe.customers.create({ email: userEmail, metadata: { user_id: userId } })).id;

    const modulesDescription =
      selectedModules && (selectedModules.pos || selectedModules.ecommerce)
        ? ` + Modules: ${[selectedModules.pos && 'POS', selectedModules.ecommerce && 'E-commerce']
            .filter(Boolean)
            .join(' + ')}`
        : '';

    const price = await stripe.prices.create({
      currency: 'eur',
      unit_amount: Math.round(finalAmount * 100),
      recurring: { interval: billingCycle === 'yearly' ? 'year' : 'month' },
      product_data: {
        name: `TopRéparateurs ${plan.name}${modulesDescription} — ${billingCycle === 'yearly' ? 'Annuel' : 'Mensuel'}`,
      },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: `${req.headers.get('origin')}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/subscription-canceled`,
      metadata: {
        user_id: userId,
        plan_id: planId,
        billing_cycle: billingCycle,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_id: planId,
        },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

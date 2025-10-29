
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get('stripe_key') || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          const { repairer_id, plan_id, billing_cycle } = session.metadata || {};
          
          // Get subscription tier from plan
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('name')
            .eq('id', plan_id)
            .single();
          
          const tierMap: Record<string, string> = {
            'Gratuit': 'free',
            'Basique': 'basic',
            'Premium': 'premium',
            'Enterprise': 'enterprise'
          };

          // Create or update repairer subscription
          await supabase
            .from('repairer_subscriptions')
            .upsert({
              repairer_id,
              email: session.customer_details?.email,
              stripe_customer_id: session.customer,
              subscription_plan_id: plan_id,
              subscribed: true,
              subscription_tier: tierMap[plan?.name] || 'free',
              billing_cycle,
              stripe_subscription_id: session.subscription,
              updated_at: new Date().toISOString(),
            });

          // Générer automatiquement une page SEO pour le réparateur payant
          if (tierMap[plan?.name] && tierMap[plan?.name] !== 'free' && repairer_id) {
            console.log(`🚀 Génération automatique de la page SEO pour le réparateur ${repairer_id}`);
            try {
              const { data: seoResult } = await supabase.functions.invoke('generate-repairer-seo-page', {
                body: { repairer_id }
              });
              
              if (seoResult?.success) {
                console.log(`✅ Page SEO créée avec succès: ${seoResult.url_path}`);
                // TODO: Déclencher l'indexation Google ici si nécessaire
              } else {
                console.error('❌ Échec génération page SEO:', seoResult?.error);
              }
            } catch (seoError) {
              console.error('❌ Erreur lors de la génération de la page SEO:', seoError);
            }
          }
        }
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status to cancelled
        await supabase
          .from('repairer_subscriptions')
          .update({
            subscribed: false,
            subscription_tier: 'free',
            subscription_end: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

/**
 * Stripe webhook handler.
 *
 * Sécurité critique :
 * - Vérification de la signature `stripe-signature` via stripe.webhooks.constructEventAsync()
 *   avec STRIPE_WEBHOOK_SECRET. Sans ça, n'importe qui peut publier
 *   des "événements Stripe" et corrompre l'état de la base.
 * - Pas de CORS allowlist : ce endpoint est appelé directement par
 *   Stripe (server-to-server), pas par un navigateur.
 * - Idempotence : `event.id` est unique par événement Stripe ; on
 *   refuse les rejouages via une contrainte unique sur `stripe_event_id`.
 */

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature header' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!stripeKey || !webhookSecret) {
    return new Response(
      JSON.stringify({ error: 'Stripe not configured (STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET missing)' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
  const body = await req.text();

  // 🔐 Vérification cryptographique de la signature : OBLIGATOIRE.
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Webhook signature verification failed: ${(err as Error).message}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // Idempotence : insérer dans stripe_webhooks ; si l'event est déjà présent,
  // on ignore (ne pas le retraiter).
  const { error: insertError } = await supabase
    .from('stripe_webhooks')
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event,
      processed: false,
    });

  if (insertError && insertError.code === '23505') {
    // Duplicate key : déjà traité, on retourne 200 pour stopper les retries Stripe.
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (insertError) {
    return new Response(
      JSON.stringify({ error: `Failed to log webhook: ${insertError.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const { data: payment } = await supabase
          .from('payments')
          .select('id, repairer_id, client_id, amount')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();

        if (payment) {
          await supabase
            .from('payments')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', payment.id);

          // Commission tier (RPC métier custom)
          const { data: commissionData } = await supabase
            .rpc('calculate_repairer_commission', {
              repairer_uuid: payment.repairer_id,
              transaction_amount: payment.amount,
            })
            .single<{ commission_rate: number; commission_amount: number; tier_id: string }>();

          if (commissionData) {
            await supabase.from('transaction_commissions').insert({
              payment_id: payment.id,
              repairer_id: payment.repairer_id,
              transaction_amount: payment.amount,
              commission_rate: commissionData.commission_rate,
              commission_amount: commissionData.commission_amount,
              tier_applied: commissionData.tier_id,
              status: 'pending',
            });
          }

          // Notification client (best-effort, non-bloquant)
          await supabase.functions.invoke('send-push-notification', {
            body: {
              userId: payment.client_id,
              title: 'Paiement confirmé',
              body: 'Votre paiement a été traité avec succès',
              type: 'payment_completed',
              entityType: 'payment',
              entityId: payment.id,
            },
          }).catch(() => undefined);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            error_message: paymentIntent.last_payment_error?.message ?? null,
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const refundId = typeof charge.refunds?.data?.[0]?.id === 'string'
          ? charge.refunds.data[0].id
          : null;
        if (!refundId) break;

        const { data: refund } = await supabase
          .from('payment_refunds')
          .select('id, payment_id')
          .eq('stripe_refund_id', refundId)
          .single();

        if (refund) {
          await supabase
            .from('payment_refunds')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', refund.id);

          await supabase
            .from('transaction_commissions')
            .update({ status: 'cancelled' })
            .eq('payment_id', refund.payment_id);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const planId = subscription.metadata?.plan_id;
        if (userId) {
          await supabase.from('repairer_subscriptions').upsert(
            {
              user_id: userId,
              plan_id: planId ?? null,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer as string,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'stripe_subscription_id' },
          );
        }
        break;
      }
    }

    await supabase
      .from('stripe_webhooks')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
      })
      .eq('stripe_event_id', event.id);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    await supabase
      .from('stripe_webhooks')
      .update({
        processed: false,
        error_message: error instanceof Error ? error.message : String(error),
      })
      .eq('stripe_event_id', event.id);

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Webhook processing failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});

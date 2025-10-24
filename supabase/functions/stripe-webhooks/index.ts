import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Missing Stripe signature');
    }

    const body = await req.text();
    const event = JSON.parse(body);

    console.log('Received Stripe webhook:', event.type, event.id);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Enregistrer l'événement webhook
    const { error: webhookError } = await supabase
      .from('stripe_webhooks')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        payload: event,
        processed: false
      });

    if (webhookError) {
      console.error('Error saving webhook:', webhookError);
    }

    // Traiter selon le type d'événement
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);

        // Mettre à jour le paiement
        const { data: payment } = await supabase
          .from('payments')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();

        if (payment) {
          await supabase
            .from('payments')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', payment.id);

          // Calculer et créer la commission
          const { data: commissionData } = await supabase
            .rpc('calculate_repairer_commission', {
              repairer_uuid: payment.repairer_id,
              transaction_amount: payment.amount
            })
            .single();

          if (commissionData) {
            await supabase
              .from('transaction_commissions')
              .insert({
                payment_id: payment.id,
                repairer_id: payment.repairer_id,
                transaction_amount: payment.amount,
                commission_rate: commissionData.commission_rate,
                commission_amount: commissionData.commission_amount,
                tier_applied: commissionData.tier_id,
                status: 'pending'
              });
          }

          // Envoyer notification au client
          await supabase.functions.invoke('send-push-notification', {
            body: {
              userId: payment.client_id,
              title: 'Paiement confirmé',
              body: 'Votre paiement a été traité avec succès',
              type: 'payment_completed',
              entityType: 'payment',
              entityId: payment.id
            }
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('Payment failed:', paymentIntent.id);

        await supabase
          .from('payments')
          .update({
            status: 'failed',
            error_message: paymentIntent.last_payment_error?.message
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        console.log('Charge refunded:', charge.id);

        const { data: refund } = await supabase
          .from('payment_refunds')
          .select('*')
          .eq('stripe_refund_id', charge.refund)
          .single();

        if (refund) {
          await supabase
            .from('payment_refunds')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', refund.id);

          // Annuler la commission associée
          await supabase
            .from('transaction_commissions')
            .update({ status: 'cancelled' })
            .eq('payment_id', refund.payment_id);
        }
        break;
      }
    }

    // Marquer comme traité
    await supabase
      .from('stripe_webhooks')
      .update({
        processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('stripe_event_id', event.id);

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

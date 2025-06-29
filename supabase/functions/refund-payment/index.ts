
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
    const { payment_intent_id, reason } = await req.json();

    // Initialiser Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Simuler le remboursement Stripe
    // En production, vous utiliseriez l'API Stripe réelle
    const refund = {
      id: `re_${Date.now()}`,
      payment_intent: payment_intent_id,
      status: 'succeeded',
      reason: reason || 'requested_by_customer'
    };

    // Mettre à jour le statut du paiement
    const { error } = await supabase
      .from('payments')
      .update({ 
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_reason: reason
      })
      .eq('payment_intent_id', payment_intent_id);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, refund }),
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

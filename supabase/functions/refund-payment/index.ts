
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
    // SECURITY: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase with user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const requestData = await req.json();
    const { payment_intent_id, reason } = requestData;

    // Input validation
    if (!payment_intent_id || typeof payment_intent_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid payment_intent_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (reason && typeof reason !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid reason' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit reason length
    const sanitizedReason = reason ? reason.substring(0, 500) : 'requested_by_customer';

    // AUTHORIZATION: Check if user is admin or payment owner
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user has admin role
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    const isAdmin = roleData?.role === 'admin';

    // Verify payment ownership or admin status
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('client_id, repairer_id')
      .eq('payment_intent_id', payment_intent_id)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only admin or payment owner can refund
    if (!isAdmin && payment.client_id !== user.id && payment.repairer_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - You do not have permission to refund this payment' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simuler le remboursement Stripe
    // En production, vous utiliseriez l'API Stripe réelle
    const refund = {
      id: `re_${Date.now()}`,
      payment_intent: payment_intent_id,
      status: 'succeeded',
      reason: sanitizedReason
    };

    // Mettre à jour le statut du paiement
    const { error } = await supabaseAdmin
      .from('payments')
      .update({ 
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_reason: sanitizedReason
      })
      .eq('payment_intent_id', payment_intent_id);

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'refund_payment',
      resource_type: 'payment',
      resource_id: payment_intent_id,
      new_values: { status: 'refunded', reason: sanitizedReason }
    });

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

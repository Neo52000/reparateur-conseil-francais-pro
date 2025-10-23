import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowTransition {
  action?: string;
  notify?: 'client' | 'repairer' | 'both';
  requiresValidation?: boolean;
}

const WORKFLOW_TRANSITIONS: Record<string, Record<string, WorkflowTransition>> = {
  quote: {
    'draft→sent': { action: 'sendQuoteEmail', notify: 'client' },
    'sent→viewed': { action: 'logView' },
    'viewed→accepted': { action: 'createPaymentIntent', notify: 'repairer' },
    'accepted→payment_pending': { action: 'waitForPayment' },
    'payment_pending→paid': { action: 'enableAppointmentBooking', notify: 'both' },
    'paid→scheduled': { action: 'confirmAppointment', notify: 'both' },
    'scheduled→in_progress': { action: 'startRepairTracking', notify: 'client' },
    'in_progress→completed': { action: 'releasePayment', notify: 'both' },
    'draft→cancelled': { notify: 'client' },
    'sent→expired': { action: 'archiveQuote' },
  },
  appointment: {
    'pending→confirmed': { action: 'sendConfirmation', notify: 'both' },
    'confirmed→reminded': { action: 'sendReminder', notify: 'client' },
    'reminded→ongoing': { action: 'startTracking', notify: 'both' },
    'ongoing→completed': { action: 'requestReview', notify: 'client' },
    'pending→cancelled': { action: 'refundPayment', notify: 'both' },
    'confirmed→no_show': { action: 'logNoShow', notify: 'repairer' },
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { entity_type, entity_id, new_status, metadata } = await req.json();

    console.log('[Workflow] Transition request:', { entity_type, entity_id, new_status });

    // Récupérer l'entité actuelle
    let currentEntity;
    if (entity_type === 'quote') {
      const { data, error } = await supabase
        .from('quotes_with_timeline')
        .select('*, repairer_id, client_id')
        .eq('id', entity_id)
        .single();
      
      if (error) throw error;
      currentEntity = data;
    } else if (entity_type === 'appointment') {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, repairer_id, client_id')
        .eq('id', entity_id)
        .single();
      
      if (error) throw error;
      currentEntity = data;
    } else {
      throw new Error('Invalid entity type');
    }

    const currentStatus = currentEntity.workflow_status || 'draft';
    const transitionKey = `${currentStatus}→${new_status}`;
    const transition = WORKFLOW_TRANSITIONS[entity_type]?.[transitionKey];

    if (!transition) {
      throw new Error(`Invalid transition: ${transitionKey}`);
    }

    console.log('[Workflow] Executing transition:', transitionKey, transition);

    // Mettre à jour le statut
    const updateData: any = { 
      workflow_status: new_status,
      updated_at: new Date().toISOString()
    };

    // Ajouter timestamps selon le statut
    if (new_status === 'accepted') updateData.accepted_at = new Date().toISOString();
    if (new_status === 'paid') updateData.paid_at = new Date().toISOString();
    if (new_status === 'scheduled') updateData.scheduled_at = new Date().toISOString();
    if (new_status === 'completed') updateData.completed_at = new Date().toISOString();
    if (new_status === 'cancelled') updateData.cancelled_at = new Date().toISOString();

    const table = entity_type === 'quote' ? 'quotes_with_timeline' : 'appointments';
    const { error: updateError } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', entity_id);

    if (updateError) throw updateError;

    // Exécuter l'action associée
    if (transition.action) {
      console.log('[Workflow] Executing action:', transition.action);
      // Ici on pourrait appeler d'autres edge functions ou exécuter des actions
      // Par exemple: sendQuoteEmail, createPaymentIntent, etc.
    }

    // Envoyer les notifications
    if (transition.notify) {
      const recipients = [];
      if (transition.notify === 'client' || transition.notify === 'both') {
        recipients.push(currentEntity.client_id);
      }
      if (transition.notify === 'repairer' || transition.notify === 'both') {
        recipients.push(currentEntity.repairer_id);
      }

      for (const recipientId of recipients) {
        await supabase.from('workflow_notifications').insert({
          entity_type,
          entity_id,
          recipient_id: recipientId,
          notification_type: 'email',
          template_name: `${entity_type}_${new_status}`,
          metadata: { transition: transitionKey, ...metadata }
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        entity_type,
        entity_id,
        from_status: currentStatus,
        to_status: new_status,
        action_executed: transition.action
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[Workflow] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

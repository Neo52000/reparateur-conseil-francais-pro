import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { conversation_id, message_id, sender_id, sender_type } = await req.json();

    console.log('[MessageNotification] Processing notification for message:', message_id);

    // Récupérer la conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*, client:profiles!conversations_client_id_fkey(*), repairer:profiles!conversations_repairer_id_fkey(*)')
      .eq('id', conversation_id)
      .single();

    if (convError || !conversation) {
      throw new Error('Conversation not found');
    }

    // Déterminer le destinataire
    const recipientId = sender_type === 'user' 
      ? conversation.repairer_id 
      : conversation.client_id;

    const recipient = sender_type === 'user' 
      ? conversation.repairer 
      : conversation.client;

    if (!recipient?.email) {
      console.log('[MessageNotification] No email for recipient');
      return new Response(
        JSON.stringify({ success: false, reason: 'No email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer le message
    const { data: message } = await supabase
      .from('chat_messages')
      .select('message')
      .eq('id', message_id)
      .single();

    const messagePreview = message?.message?.substring(0, 100) || 'Nouveau message';

    // Vérifier si le destinataire est en ligne (optionnel)
    // Si oui, ne pas envoyer d'email, juste une notification push

    // Pour l'instant, on log juste l'intention d'envoyer
    console.log('[MessageNotification] Would send email to:', recipient.email);
    console.log('[MessageNotification] Message preview:', messagePreview);

    // Ici vous pourriez intégrer avec Resend, SendGrid, etc.
    // const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    // if (RESEND_API_KEY) {
    //   await fetch('https://api.resend.com/emails', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${RESEND_API_KEY}`
    //     },
    //     body: JSON.stringify({
    //       from: 'RepairConnect <notifications@repairconnect.fr>',
    //       to: recipient.email,
    //       subject: 'Nouveau message sur RepairConnect',
    //       html: `
    //         <h2>Nouveau message</h2>
    //         <p>Vous avez reçu un nouveau message:</p>
    //         <blockquote>${messagePreview}</blockquote>
    //         <p><a href="https://app.repairconnect.fr/messages/${conversation_id}">Voir la conversation</a></p>
    //       `
    //     })
    //   });
    // }

    // Créer une notification in-app
    await supabase
      .from('notifications_system')
      .insert({
        user_id: recipientId,
        title: 'Nouveau message',
        message: messagePreview,
        type: 'message',
        link: `/messages/${conversation_id}`,
        metadata: {
          conversation_id,
          message_id,
          sender_id
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        recipient_email: recipient.email,
        notification_created: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[MessageNotification] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

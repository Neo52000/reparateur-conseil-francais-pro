import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EMAIL_TEMPLATES: Record<string, { subject: string; body: (data: any) => string }> = {
  quote_sent: {
    subject: 'Nouveau devis disponible',
    body: (data) => `Bonjour,\n\nVous avez reçu un nouveau devis pour votre réparation.\nMontant: ${data.amount}€\n\nConsultez-le sur votre espace client.`
  },
  quote_accepted: {
    subject: 'Devis accepté par le client',
    body: (data) => `Bonjour,\n\nLe client a accepté votre devis #${data.quote_number}.\nMontant: ${data.amount}€\n\nProchaine étape: paiement.`
  },
  quote_paid: {
    subject: 'Paiement reçu - Rendez-vous à planifier',
    body: (data) => `Bonjour,\n\nLe paiement a été reçu pour le devis #${data.quote_number}.\nVous pouvez maintenant planifier votre rendez-vous.`
  },
  quote_scheduled: {
    subject: 'Rendez-vous confirmé',
    body: (data) => `Bonjour,\n\nVotre rendez-vous est confirmé.\nDate: ${data.appointment_date}\nAdresse: ${data.address}\n\nÀ bientôt!`
  },
  quote_in_progress: {
    subject: 'Réparation en cours',
    body: (data) => `Bonjour,\n\nVotre réparation est en cours.\nVous pouvez suivre l'avancement en temps réel sur votre espace.`
  },
  quote_completed: {
    subject: 'Réparation terminée',
    body: (data) => `Bonjour,\n\nVotre réparation est terminée!\nN'hésitez pas à laisser un avis.`
  },
  appointment_confirmed: {
    subject: 'Rendez-vous confirmé',
    body: (data) => `Votre rendez-vous est confirmé pour le ${data.date} à ${data.time}.`
  },
  appointment_reminded: {
    subject: 'Rappel: Rendez-vous demain',
    body: (data) => `N'oubliez pas votre rendez-vous demain à ${data.time}.`
  },
  appointment_completed: {
    subject: 'Merci de votre visite',
    body: (data) => `Merci d'avoir choisi nos services. N'hésitez pas à laisser un avis!`
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

    // Récupérer les notifications en attente
    const { data: notifications, error: fetchError } = await supabase
      .from('workflow_notifications')
      .select('*')
      .eq('status', 'pending')
      .limit(50);

    if (fetchError) throw fetchError;

    console.log(`[Notifications] Processing ${notifications?.length || 0} notifications`);

    const results = [];

    for (const notification of notifications || []) {
      try {
        // Récupérer les infos du destinataire
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', notification.recipient_id)
          .single();

        if (!profile?.email) {
          console.error('[Notifications] No email for recipient:', notification.recipient_id);
          await supabase
            .from('workflow_notifications')
            .update({ 
              status: 'failed', 
              error_message: 'No email address' 
            })
            .eq('id', notification.id);
          continue;
        }

        const template = EMAIL_TEMPLATES[notification.template_name];
        if (!template) {
          console.error('[Notifications] Unknown template:', notification.template_name);
          await supabase
            .from('workflow_notifications')
            .update({ 
              status: 'failed', 
              error_message: 'Unknown template' 
            })
            .eq('id', notification.id);
          continue;
        }

        const emailBody = template.body(notification.metadata || {});

        console.log(`[Notifications] Sending ${notification.notification_type} to ${profile.email}`);

        // Ici vous pourriez intégrer avec Resend, SendGrid, etc.
        // Pour l'instant on simule l'envoi
        
        // Exemple avec Resend (décommentez si vous avez configuré):
        // const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
        // if (RESEND_API_KEY) {
        //   const res = await fetch('https://api.resend.com/emails', {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json',
        //       'Authorization': `Bearer ${RESEND_API_KEY}`
        //     },
        //     body: JSON.stringify({
        //       from: 'RepairConnect <noreply@repairconnect.fr>',
        //       to: profile.email,
        //       subject: template.subject,
        //       text: emailBody
        //     })
        //   });
        // }

        // Marquer comme envoyé
        await supabase
          .from('workflow_notifications')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString() 
          })
          .eq('id', notification.id);

        results.push({ id: notification.id, status: 'sent' });

      } catch (notifError) {
        console.error('[Notifications] Error processing notification:', notifError);
        await supabase
          .from('workflow_notifications')
          .update({ 
            status: 'failed', 
            error_message: notifError.message 
          })
          .eq('id', notification.id);
        
        results.push({ id: notification.id, status: 'failed', error: notifError.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[Notifications] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

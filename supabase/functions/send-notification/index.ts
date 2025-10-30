import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  channels: {
    browser: boolean;
    email: boolean;
    sms: boolean;
  };
  data?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ: Vérification de l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Tentative d\'envoi de notification non authentifiée');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer un client Supabase avec le token utilisateur
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Vérifier que l'utilisateur est authentifié
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('❌ Token invalide:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notification: NotificationRequest = await req.json();

    // ✅ SÉCURITÉ: Validation stricte du userId destinataire
    if (!notification.userId || typeof notification.userId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Bad Request: Valid userId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier le rôle de l'utilisateur
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    const isAdmin = roleData?.role === 'admin';

    // ✅ SÉCURITÉ: Vérifier l'autorisation d'envoi
    if (!isAdmin && notification.userId !== user.id) {
      // Si pas admin et qu'on envoie à quelqu'un d'autre,
      // vérifier qu'il s'agit d'une relation client/réparateur valide
      const { data: relationship } = await supabaseClient
        .from('quote_requests')
        .select('id')
        .or(`client_id.eq.${notification.userId},repairer_id.eq.${user.id}`)
        .or(`client_id.eq.${user.id},repairer_id.eq.${notification.userId}`)
        .maybeSingle();

      if (!relationship) {
        console.error('❌ Tentative d\'envoi non autorisé:', {
          from: user.id,
          to: notification.userId
        });
        return new Response(
          JSON.stringify({ 
            error: 'Forbidden: Cannot send notification to this user' 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ✅ SÉCURITÉ: Rate limiting (100 notifications/heure)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count } = await supabaseClient
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', user.id)
      .gte('sent_at', oneHourAgo);

    if (count && count >= 100) {
      console.warn('⚠️ Rate limit atteint pour:', user.id);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded: max 100 notifications per hour' 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Envoi autorisé (${isAdmin ? 'admin' : 'user'}):`, user.email);

    // Client admin pour les opérations de notification
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const results = [];

    console.log("📢 Envoi de notification:", {
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      channels: notification.channels
    });

    // 1. Sauvegarder la notification en base
    const { error: dbError } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.userId,
        sender_id: user.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        sent_at: new Date().toISOString(),
        channels_used: notification.channels
      });

    // 🔒 Log de sécurité
    await supabase
      .from('admin_audit_logs')
      .insert({
        user_id: user.id,
        action: 'notification_sent',
        resource: `notification/${notification.type}`,
        details: { 
          recipient: notification.userId, 
          channels: notification.channels 
        }
      })
      .then(() => console.log('🔒 Audit log créé'))
      .catch(err => console.warn('⚠️ Erreur audit log:', err));

    if (dbError) {
      console.error("Erreur sauvegarde notification:", dbError);
    }

    // 2. Notification push (Web Push)
    if (notification.channels.browser) {
      try {
        // Récupérer les tokens de notification push pour cet utilisateur
        const { data: pushTokens } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', notification.userId)
          .eq('active', true);

        if (pushTokens && pushTokens.length > 0) {
          for (const token of pushTokens) {
            // Envoyer la notification push
            // Note: En production, utiliser un service comme Firebase Cloud Messaging
            console.log("🔔 Envoi push notification vers:", token.endpoint);
            
            // Simuler l'envoi pour le moment
            results.push({
              channel: 'browser',
              status: 'sent',
              endpoint: token.endpoint
            });
          }
        }
      } catch (error) {
        console.error("Erreur notification push:", error);
        results.push({
          channel: 'browser',
          status: 'error',
          error: error.message
        });
      }
    }

    // 3. Notification email
    if (notification.channels.email) {
      try {
        // Récupérer l'email de l'utilisateur
        const { data: user } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', notification.userId)
          .single();

        if (user && user.email) {
          // Utiliser Resend pour envoyer l'email
          const resendApiKey = Deno.env.get("RESEND_API_KEY");
          
          if (resendApiKey) {
            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Réparateur Pro <notifications@topreparateurs.fr>',
                to: [user.email],
                subject: notification.title,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #f97316;">${notification.title}</h1>
                    <p>Bonjour ${user.first_name || 'Utilisateur'},</p>
                    <p>${notification.message}</p>
                    ${notification.data?.actionUrl ? 
                      `<a href="${notification.data.actionUrl}" style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Voir les détails</a>` 
                      : ''
                    }
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">
                      Cette notification a été envoyée par Réparateur Pro.<br>
                      Pour gérer vos préférences de notification, <a href="${Deno.env.get('APP_URL')}/settings">cliquez ici</a>.
                    </p>
                  </div>
                `
              })
            });

            if (emailResponse.ok) {
              results.push({
                channel: 'email',
                status: 'sent',
                email: user.email
              });
            } else {
              throw new Error('Erreur envoi email');
            }
          }
        }
      } catch (error) {
        console.error("Erreur notification email:", error);
        results.push({
          channel: 'email',
          status: 'error',
          error: error.message
        });
      }
    }

    // 4. Notification SMS
    if (notification.channels.sms) {
      try {
        // Récupérer le numéro de téléphone
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', notification.userId)
          .single();

        if (profile && profile.phone) {
          // Utiliser Twilio pour envoyer le SMS
          const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
          const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
          const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

          if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
            const smsBody = `${notification.title}\n\n${notification.message}`;
            
            const smsResponse = await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  From: twilioPhoneNumber,
                  To: profile.phone,
                  Body: smsBody
                })
              }
            );

            if (smsResponse.ok) {
              results.push({
                channel: 'sms',
                status: 'sent',
                phone: profile.phone
              });
            } else {
              throw new Error('Erreur envoi SMS');
            }
          }
        }
      } catch (error) {
        console.error("Erreur notification SMS:", error);
        results.push({
          channel: 'sms',
          status: 'error',
          error: error.message
        });
      }
    }

    console.log("✅ Résultats notifications:", results);

    return new Response(JSON.stringify({
      success: true,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erreur générale:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
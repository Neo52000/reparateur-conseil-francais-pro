import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  type: 'error' | 'warning' | 'success';
  schedule_name: string;
  schedule_id: string;
  error_message: string;
  error_details?: {
    provider?: string;
    http_status?: number;
    api_response?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const notification: NotifyRequest = await req.json();
    
    console.log(`📧 Blog automation notification:`, notification);

    // Get admin emails
    const { data: admins, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .eq('is_active', true);

    if (adminError) {
      console.error('Error fetching admins:', adminError);
      throw adminError;
    }

    if (!admins || admins.length === 0) {
      console.log('No admins found to notify');
      return new Response(
        JSON.stringify({ success: true, message: 'No admins to notify' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin emails from profiles
    const adminIds = admins.map(a => a.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('email, first_name')
      .in('id', adminIds);

    if (profileError || !profiles) {
      console.error('Error fetching admin profiles:', profileError);
      throw profileError || new Error('No profiles found');
    }

    const adminEmails = profiles.filter(p => p.email).map(p => p.email);
    
    if (adminEmails.length === 0) {
      console.log('No admin emails found');
      return new Response(
        JSON.stringify({ success: true, message: 'No admin emails found' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending notification to ${adminEmails.length} admin(s)`);

    // Store notification in database
    await supabase.from('notifications').insert({
      user_id: adminIds[0], // Primary admin
      type: 'blog_automation_error',
      title: `Erreur automatisation blog: ${notification.schedule_name}`,
      message: notification.error_message,
      data: {
        schedule_id: notification.schedule_id,
        schedule_name: notification.schedule_name,
        error_details: notification.error_details,
        timestamp: new Date().toISOString()
      },
      sent_at: new Date().toISOString()
    });

    // Send email if Resend is configured
    if (resendApiKey) {
      const errorTypeEmoji = notification.type === 'error' ? '🚨' : notification.type === 'warning' ? '⚠️' : '✅';
      const errorTypeLabel = notification.type === 'error' ? 'ERREUR' : notification.type === 'warning' ? 'ATTENTION' : 'SUCCÈS';
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${notification.type === 'error' ? '#fee2e2' : notification.type === 'warning' ? '#fef3c7' : '#dcfce7'}; 
                      border-left: 4px solid ${notification.type === 'error' ? '#ef4444' : notification.type === 'warning' ? '#f59e0b' : '#22c55e'}; 
                      padding: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: ${notification.type === 'error' ? '#dc2626' : notification.type === 'warning' ? '#d97706' : '#16a34a'};">
              ${errorTypeEmoji} ${errorTypeLabel}: Automatisation Blog
            </h2>
          </div>
          
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px 0;"><strong>Planification:</strong> ${notification.schedule_name}</p>
            <p style="margin: 0 0 8px 0;"><strong>ID:</strong> ${notification.schedule_id}</p>
            <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</p>
          </div>
          
          <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #374151;">Message d'erreur</h3>
            <p style="margin: 0; color: #6b7280; font-family: monospace; white-space: pre-wrap;">${notification.error_message}</p>
          </div>
          
          ${notification.error_details ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #991b1b;">Détails techniques</h3>
            ${notification.error_details.provider ? `<p style="margin: 0 0 8px 0;"><strong>Fournisseur IA:</strong> ${notification.error_details.provider}</p>` : ''}
            ${notification.error_details.http_status ? `<p style="margin: 0 0 8px 0;"><strong>Code HTTP:</strong> ${notification.error_details.http_status}</p>` : ''}
            ${notification.error_details.api_response ? `<p style="margin: 0;"><strong>Réponse API:</strong><br><code style="font-size: 12px; background: #fff; padding: 8px; display: block; margin-top: 4px; border-radius: 4px;">${notification.error_details.api_response.substring(0, 500)}</code></p>` : ''}
          </div>
          ` : ''}
          
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; color: #1e40af;">Actions recommandées</h3>
            <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
              <li>Vérifiez vos clés API dans les paramètres Supabase</li>
              <li>Consultez le dashboard de statut des APIs</li>
              <li>Vérifiez vos crédits sur les plateformes IA concernées</li>
              <li>Consultez les logs de la fonction edge pour plus de détails</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${Deno.env.get('APP_URL') || 'https://topreparateurs.fr'}/admin?tab=blog&blogTab=automation" 
               style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Voir le tableau de bord
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Cette notification a été envoyée automatiquement par le système d'automatisation du blog.<br>
            Pour modifier vos préférences de notification, accédez aux paramètres admin.
          </p>
        </div>
      `;

      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TopRéparateurs <notifications@topreparateurs.fr>',
            to: adminEmails,
            subject: `${errorTypeEmoji} Blog Automation ${errorTypeLabel}: ${notification.schedule_name}`,
            html: htmlContent
          })
        });

        if (emailResponse.ok) {
          console.log('✅ Email notification sent successfully');
        } else {
          const errorText = await emailResponse.text();
          console.error('❌ Email send failed:', errorText);
        }
      } catch (emailError) {
        console.error('❌ Email send exception:', emailError);
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not configured - email notification skipped');
    }

    return new Response(
      JSON.stringify({ success: true, notified: adminEmails.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Notification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

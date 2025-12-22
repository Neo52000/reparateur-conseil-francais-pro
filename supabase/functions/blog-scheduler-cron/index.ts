import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Obtenir l'heure de Paris avec gestion correcte du DST
function getParisDateTime(): { day: number; time: string; offset: number } {
  const now = new Date();
  
  const parisFormatter = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const parts = parisFormatter.formatToParts(now);
  const weekdayShort = parts.find(p => p.type === 'weekday')?.value || '';
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  
  const dayMap: Record<string, number> = {
    'dim.': 0, 'lun.': 1, 'mar.': 2, 'mer.': 3, 
    'jeu.': 4, 'ven.': 5, 'sam.': 6
  };
  const day = dayMap[weekdayShort] ?? now.getDay();
  
  const parisDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const offset = (parisDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
  
  return {
    day,
    time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    offset
  };
}

function isTimeInWindow(currentTime: string, targetTime: string, windowMinutes: number = 5): boolean {
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  const [targetHour, targetMinute] = targetTime.split(':').map(Number);
  
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const targetTotalMinutes = targetHour * 60 + targetMinute;
  
  const diff = Math.abs(currentTotalMinutes - targetTotalMinutes);
  const diffAcrossMidnight = Math.abs(1440 - diff);
  
  return diff <= windowMinutes || diffAcrossMidnight <= windowMinutes;
}

// Send error notification directly (merged from blog-automation-notify)
async function sendErrorNotification(
  supabase: any,
  supabaseUrl: string,
  notification: {
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
): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  console.log(`📧 Blog automation notification:`, notification);

  try {
    // Get admin emails
    const { data: admins, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .eq('is_active', true);

    if (adminError || !admins || admins.length === 0) {
      console.log('No admins found to notify');
      return;
    }

    const adminIds = admins.map((a: any) => a.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('email, first_name')
      .in('id', adminIds);

    if (profileError || !profiles) {
      console.error('Error fetching admin profiles:', profileError);
      return;
    }

    const adminEmails = profiles.filter((p: any) => p.email).map((p: any) => p.email);
    
    if (adminEmails.length === 0) {
      console.log('No admin emails found');
      return;
    }

    console.log(`Sending notification to ${adminEmails.length} admin(s)`);

    // Store notification in database
    await supabase.from('notifications').insert({
      user_id: adminIds[0],
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
            Cette notification a été envoyée automatiquement par le système d'automatisation du blog.
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
  } catch (error) {
    console.error('❌ Notification error:', error);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const paris = getParisDateTime();
    const currentDay = paris.day;
    const currentTime = paris.time;

    console.log(`🕐 Checking schedules for day ${currentDay} at ${currentTime} Paris time (UTC+${paris.offset})`);

    const { data: allSchedules, error: fetchError } = await supabase
      .from('blog_automation_schedules')
      .select('*')
      .eq('enabled', true)
      .eq('schedule_day', currentDay);

    if (fetchError) {
      console.error('❌ Error fetching schedules:', fetchError);
      throw fetchError;
    }

    console.log(`📋 Found ${allSchedules?.length || 0} schedules for today (day ${currentDay})`);

    const schedules = allSchedules?.filter(schedule => {
      const inWindow = isTimeInWindow(currentTime, schedule.schedule_time, 5);
      if (inWindow) {
        console.log(`✅ Schedule "${schedule.name}" at ${schedule.schedule_time} is in window (current: ${currentTime})`);
      }
      return inWindow;
    }) || [];

    console.log(`📋 Found ${schedules.length} matching schedules in time window`);

    if (schedules.length === 0) {
      if (allSchedules && allSchedules.length > 0) {
        console.log(`📅 Next schedules for today: ${allSchedules.map(s => `${s.name} at ${s.schedule_time}`).join(', ')}`);
      }
      
      return new Response(
        JSON.stringify({ 
          message: 'No schedules to execute at this time',
          current_day: currentDay,
          current_time: currentTime,
          schedules_today: allSchedules?.length || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const results = [];

    for (const schedule of schedules) {
      if (schedule.last_run_at) {
        const lastRun = new Date(schedule.last_run_at);
        const minutesSinceLastRun = (Date.now() - lastRun.getTime()) / (1000 * 60);
        if (minutesSinceLastRun < 30) {
          console.log(`⏭️ Skipping schedule "${schedule.name}" - already ran ${Math.round(minutesSinceLastRun)} minutes ago`);
          continue;
        }
      }

      console.log(`🚀 Executing schedule: ${schedule.name} (ID: ${schedule.id})`);

      try {
        console.log(`📡 Calling blog-ai-generator with SERVICE_ROLE_KEY...`);
        
        const response = await fetch(`${supabaseUrl}/functions/v1/blog-ai-generator`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate',
            category_id: schedule.category_id,
            auto_publish: schedule.auto_publish,
            ai_model: schedule.ai_model || 'google/gemini-2.5-flash',
            prompt_template: schedule.prompt_template,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Error generating article for schedule ${schedule.id}: ${response.status} - ${errorText}`);
          
          // Send error notification directly
          await sendErrorNotification(supabase, supabaseUrl, {
            type: 'error',
            schedule_name: schedule.name,
            schedule_id: schedule.id,
            error_message: `Échec de génération d'article: HTTP ${response.status}`,
            error_details: {
              http_status: response.status,
              api_response: errorText.substring(0, 500)
            }
          });
          
          results.push({
            schedule_id: schedule.id,
            schedule_name: schedule.name,
            success: false,
            error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
          });
          continue;
        }

        const generatedPost = await response.json();
        console.log(`✅ blog-ai-generator response received for schedule ${schedule.name}`);

        const { error: updateError } = await supabase
          .from('blog_automation_schedules')
          .update({ last_run_at: new Date().toISOString() })
          .eq('id', schedule.id);

        if (updateError) {
          console.error(`⚠️ Error updating last_run_at for schedule ${schedule.id}:`, updateError);
        }

        results.push({
          schedule_id: schedule.id,
          schedule_name: schedule.name,
          success: true,
          post_id: generatedPost?.id,
        });
      } catch (error) {
        console.error(`❌ Exception for schedule ${schedule.id}:`, error);
        
        // Send error notification directly for exceptions
        await sendErrorNotification(supabase, supabaseUrl, {
          type: 'error',
          schedule_name: schedule.name,
          schedule_id: schedule.id,
          error_message: `Exception lors de la génération: ${error.message}`,
          error_details: {
            provider: 'unknown',
            api_response: error.stack || error.message
          }
        });
        
        results.push({
          schedule_id: schedule.id,
          schedule_name: schedule.name,
          success: false,
          error: error.message,
        });
      }
    }

    console.log(`✅ Scheduler execution completed. Results:`, results);

    return new Response(
      JSON.stringify({
        message: 'Scheduler executed',
        current_day: currentDay,
        current_time: currentTime,
        executed_count: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('❌ Scheduler error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

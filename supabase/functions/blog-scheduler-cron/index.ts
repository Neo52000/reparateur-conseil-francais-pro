import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Obtenir l'heure de Paris avec gestion correcte du DST
function getParisDateTime(): { day: number; time: string; offset: number } {
  const now = new Date();
  
  // Utiliser l'API Intl pour obtenir l'heure exacte de Paris
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
  
  // Mapper les jours français vers les numéros JavaScript (0=Dimanche)
  const dayMap: Record<string, number> = {
    'dim.': 0, 'lun.': 1, 'mar.': 2, 'mer.': 3, 
    'jeu.': 4, 'ven.': 5, 'sam.': 6
  };
  const day = dayMap[weekdayShort] ?? now.getDay();
  
  // Calculer l'offset Paris (pour le log)
  const parisDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
  const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const offset = (parisDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
  
  return {
    day,
    time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    offset
  };
}

// Vérifier si l'heure actuelle est dans une fenêtre de 5 minutes autour de l'heure cible
function isTimeInWindow(currentTime: string, targetTime: string, windowMinutes: number = 5): boolean {
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  const [targetHour, targetMinute] = targetTime.split(':').map(Number);
  
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const targetTotalMinutes = targetHour * 60 + targetMinute;
  
  const diff = Math.abs(currentTotalMinutes - targetTotalMinutes);
  
  // Gérer le passage de minuit
  const diffAcrossMidnight = Math.abs(1440 - diff);
  
  return diff <= windowMinutes || diffAcrossMidnight <= windowMinutes;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obtenir l'heure de Paris avec la bonne méthode
    const paris = getParisDateTime();
    const currentDay = paris.day;
    const currentTime = paris.time;

    console.log(`🕐 Checking schedules for day ${currentDay} at ${currentTime} Paris time (UTC+${paris.offset})`);

    // Récupérer TOUTES les planifications activées pour ce jour
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

    // Filtrer les schedules dans la fenêtre de temps (±5 minutes)
    const schedules = allSchedules?.filter(schedule => {
      const inWindow = isTimeInWindow(currentTime, schedule.schedule_time, 5);
      if (inWindow) {
        console.log(`✅ Schedule "${schedule.name}" at ${schedule.schedule_time} is in window (current: ${currentTime})`);
      }
      return inWindow;
    }) || [];

    console.log(`📋 Found ${schedules.length} matching schedules in time window`);

    if (schedules.length === 0) {
      // Log les prochaines exécutions pour debug
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

    // Pour chaque planification trouvée, générer un article
    for (const schedule of schedules) {
      // Vérifier si déjà exécuté dans les 30 dernières minutes (éviter doublons)
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
        // Appeler blog-ai-generator avec fetch direct et SERVICE_ROLE_KEY pour éviter les problèmes d'authentification
        console.log(`📡 Calling blog-ai-generator with SERVICE_ROLE_KEY...`);
        
        const response = await fetch(`${supabaseUrl}/functions/v1/blog-ai-generator`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category_id: schedule.category_id,
            auto_publish: schedule.auto_publish,
            ai_model: schedule.ai_model || 'google/gemini-2.5-flash',
            prompt_template: schedule.prompt_template,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Error generating article for schedule ${schedule.id}: ${response.status} - ${errorText}`);
          
          // Send error notification
          try {
            await fetch(`${supabaseUrl}/functions/v1/blog-automation-notify`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'error',
                schedule_name: schedule.name,
                schedule_id: schedule.id,
                error_message: `Échec de génération d'article: HTTP ${response.status}`,
                error_details: {
                  http_status: response.status,
                  api_response: errorText.substring(0, 500)
                }
              })
            });
            console.log(`📧 Error notification sent for schedule ${schedule.name}`);
          } catch (notifyError) {
            console.error(`⚠️ Failed to send error notification:`, notifyError);
          }
          
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

        console.log(`✅ Article generated successfully for schedule ${schedule.name}`);

        // Mettre à jour last_run_at
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
        
        // Send error notification for exceptions
        try {
          await fetch(`${supabaseUrl}/functions/v1/blog-automation-notify`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'error',
              schedule_name: schedule.name,
              schedule_id: schedule.id,
              error_message: `Exception lors de la génération: ${error.message}`,
              error_details: {
                provider: 'unknown',
                api_response: error.stack || error.message
              }
            })
          });
          console.log(`📧 Exception notification sent for schedule ${schedule.name}`);
        } catch (notifyError) {
          console.error(`⚠️ Failed to send exception notification:`, notifyError);
        }
        
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

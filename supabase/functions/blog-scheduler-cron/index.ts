import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Convertir UTC en heure de Paris
function getParisTime(): Date {
  const now = new Date();
  // Paris est UTC+1 en hiver, UTC+2 en été (DST)
  const parisOffset = getParisOffset(now);
  return new Date(now.getTime() + parisOffset * 60 * 60 * 1000);
}

// Déterminer l'offset de Paris (gestion DST)
function getParisOffset(date: Date): number {
  const year = date.getUTCFullYear();
  // DST en Europe: dernier dimanche de mars au dernier dimanche d'octobre
  const marchLast = new Date(Date.UTC(year, 2, 31));
  const lastSundayMarch = new Date(marchLast.setDate(31 - marchLast.getUTCDay()));
  lastSundayMarch.setUTCHours(1, 0, 0, 0); // DST commence à 1h UTC
  
  const octoberLast = new Date(Date.UTC(year, 9, 31));
  const lastSundayOctober = new Date(octoberLast.setDate(31 - octoberLast.getUTCDay()));
  lastSundayOctober.setUTCHours(1, 0, 0, 0); // DST finit à 1h UTC
  
  if (date >= lastSundayMarch && date < lastSundayOctober) {
    return 2; // CEST (été)
  }
  return 1; // CET (hiver)
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

    // Utiliser l'heure de Paris au lieu de UTC
    const parisNow = getParisTime();
    const currentDay = parisNow.getUTCDay(); // 0=Dimanche, 1=Lundi, ..., 6=Samedi
    const currentHour = parisNow.getUTCHours();
    const currentMinute = parisNow.getUTCMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    console.log(`🕐 Checking schedules for day ${currentDay} at ${currentTime} Paris time (UTC+${getParisOffset(new Date())})`);

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

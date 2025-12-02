import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const currentDay = now.getUTCDay(); // 0=Dimanche, 1=Lundi, ..., 6=Samedi
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    console.log(`🕐 Checking schedules for day ${currentDay} at ${currentTime} UTC`);

    // Récupérer les planifications qui correspondent au jour et à l'heure actuelle
    const { data: schedules, error: fetchError } = await supabase
      .from('blog_automation_schedules')
      .select('*')
      .eq('enabled', true)
      .eq('schedule_day', currentDay)
      .eq('schedule_time', currentTime);

    if (fetchError) {
      console.error('❌ Error fetching schedules:', fetchError);
      throw fetchError;
    }

    console.log(`📋 Found ${schedules?.length || 0} matching schedules`);

    if (!schedules || schedules.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No schedules to execute at this time' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const results = [];

    // Pour chaque planification trouvée, générer un article
    for (const schedule of schedules) {
      console.log(`🚀 Executing schedule: ${schedule.name} (ID: ${schedule.id})`);

      try {
        // Appeler blog-ai-generator avec les paramètres de la planification
        const { data: generatedPost, error: generateError } = await supabase.functions.invoke(
          'blog-ai-generator',
          {
            body: {
              category_id: schedule.category_id,
              auto_publish: schedule.auto_publish,
              ai_model: schedule.ai_model || 'google/gemini-2.5-flash',
              prompt_template: schedule.prompt_template,
            },
          }
        );

        if (generateError) {
          console.error(`❌ Error generating article for schedule ${schedule.id}:`, generateError);
          results.push({
            schedule_id: schedule.id,
            schedule_name: schedule.name,
            success: false,
            error: generateError.message,
          });
          continue;
        }

        console.log(`✅ Article generated successfully for schedule ${schedule.name}`);

        // Mettre à jour last_run_at
        const { error: updateError } = await supabase
          .from('blog_automation_schedules')
          .update({ last_run_at: now.toISOString() })
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
        executed_count: schedules.length,
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

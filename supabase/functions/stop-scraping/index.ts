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

    // Mettre à jour tous les scrapings en cours
    const { data, error } = await supabase
      .from('scraping_logs')
      .update({
        status: 'stopped',
        completed_at: new Date().toISOString(),
      })
      .eq('status', 'running')
      .select();

    if (error) throw error;

    console.log(`🛑 ${data?.length || 0} scraping(s) arrêté(s)`);

    return new Response(
      JSON.stringify({
        success: true,
        stopped_count: data?.length || 0,
        message: `${data?.length || 0} scraping(s) arrêté(s)`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erreur arrêt scraping:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

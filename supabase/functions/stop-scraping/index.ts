import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  const corsHeaders = buildCorsHeaders(req);

  const limited = enforceRateLimit(req, { namespace: 'stop-scraping', limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

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
        error: (error as Error).message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

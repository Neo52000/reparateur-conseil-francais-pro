
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧹 Cleanup audit logs function started');

    // Récupérer la configuration de nettoyage
    const { data: config, error: configError } = await supabase
      .from('audit_cleanup_config')
      .select('*')
      .limit(1)
      .single();

    if (configError) {
      console.error('❌ Error fetching cleanup config:', configError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch cleanup configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier si le nettoyage automatique est activé
    if (!config.auto_cleanup_enabled) {
      console.log('ℹ️ Auto cleanup is disabled, skipping');
      return new Response(
        JSON.stringify({ message: 'Auto cleanup is disabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const daysToKeep = config.days_to_keep || 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    console.log(`🗓️ Cleaning up logs older than ${daysToKeep} days (before ${cutoffDate.toISOString()})`);

    // Compter les logs à supprimer
    const { count: logsToDelete, error: countError } = await supabase
      .from('admin_audit_logs')
      .select('*', { count: 'exact', head: true })
      .lt('timestamp', cutoffDate.toISOString());

    if (countError) {
      console.error('❌ Error counting logs to delete:', countError);
      return new Response(
        JSON.stringify({ error: 'Failed to count logs to delete' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Supprimer les anciens logs
    const { error: deleteError } = await supabase
      .from('admin_audit_logs')
      .delete()
      .lt('timestamp', cutoffDate.toISOString());

    if (deleteError) {
      console.error('❌ Error deleting old logs:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete old logs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mettre à jour la date du dernier nettoyage
    const { error: updateError } = await supabase
      .from('audit_cleanup_config')
      .update({ 
        last_cleanup: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', config.id);

    if (updateError) {
      console.error('❌ Error updating cleanup config:', updateError);
    }

    const result = {
      success: true,
      message: `Successfully cleaned up ${logsToDelete || 0} audit logs`,
      deletedCount: logsToDelete || 0,
      cutoffDate: cutoffDate.toISOString(),
      daysToKeep
    };

    console.log('✅ Cleanup completed:', result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Unexpected error in cleanup function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

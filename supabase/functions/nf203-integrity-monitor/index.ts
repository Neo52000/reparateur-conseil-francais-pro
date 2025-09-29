import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 NF203 Integrity Monitor - Starting checks...');

    // Récupérer tous les réparateurs actifs avec des factures
    const { data: repairers, error: repairersError } = await supabase
      .from('repairer_profiles')
      .select('user_id')
      .limit(100);

    if (repairersError) throw repairersError;

    let checksRun = 0;
    let alertsCreated = 0;

    for (const repairer of repairers || []) {
      try {
        // Vérifier l'intégrité de la chaîne
        const { data: result, error: integrityError } = await supabase.rpc('verify_chain_integrity', {
          repairer_uuid: repairer.user_id
        });

        if (integrityError) {
          console.error(`Error checking integrity for ${repairer.user_id}:`, integrityError);
          continue;
        }

        checksRun++;

        // Si la chaîne est cassée, créer une alerte
        if (result && result[0] && !result[0].is_valid) {
          const { error: alertError } = await supabase
            .from('nf203_alerts')
            .insert([{
              repairer_id: repairer.user_id,
              alert_type: 'chain_broken',
              severity: 'critical',
              title: '⚠️ Rupture de chaîne cryptographique détectée',
              description: result[0].error_details || 'La chaîne de facturation électronique présente une anomalie.',
              metadata: {
                total_invoices: result[0].total_invoices,
                broken_links: result[0].broken_links,
                first_error_sequence: result[0].first_error_sequence
              }
            }]);

          if (!alertError) {
            alertsCreated++;

            // Créer une notification
            await supabase
              .from('notifications')
              .insert([{
                user_id: repairer.user_id,
                title: '🔴 Alerte: Intégrité de la chaîne compromise',
                message: `La chaîne cryptographique présente ${result[0].broken_links} anomalie(s). Action immédiate requise.`,
                type: 'nf203_error',
                data: { urgent: true, category: 'chain_integrity' }
              }]);
          }
        }

        // Vérifier les archives proches de l'expiration
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const { data: expiringArchives } = await supabase
          .from('nf203_archives')
          .select('id')
          .eq('repairer_id', repairer.user_id)
          .eq('legal_hold', false)
          .lte('deletion_date', expiryDate.toISOString())
          .is('deleted_at', null);

        if (expiringArchives && expiringArchives.length > 0) {
          for (const archive of expiringArchives) {
            await supabase
              .from('nf203_alerts')
              .insert([{
                repairer_id: repairer.user_id,
                alert_type: 'archive_expiring',
                severity: 'medium',
                title: '⚠️ Archive proche de l\'expiration',
                description: `Une archive arrive à expiration dans moins de 30 jours.`,
                metadata: { archive_id: archive.id }
              }]);
          }
        }

      } catch (error) {
        console.error(`Error processing repairer ${repairer.user_id}:`, error);
      }
    }

    console.log(`✅ Integrity monitor completed: ${checksRun} checks, ${alertsCreated} alerts created`);

    return new Response(
      JSON.stringify({
        success: true,
        checks_run: checksRun,
        alerts_created: alertsCreated
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in integrity monitor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

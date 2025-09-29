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

    console.log('📊 NF203 Monthly Report Generator - Starting...');

    // Calculer le mois précédent
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const periodEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

    // Récupérer tous les réparateurs actifs
    const { data: repairers, error: repairersError } = await supabase
      .from('repairer_profiles')
      .select('user_id')
      .limit(100);

    if (repairersError) throw repairersError;

    let reportsGenerated = 0;

    for (const repairer of repairers || []) {
      try {
        // Compter les factures de la période
        const { count: totalInvoices } = await supabase
          .from('electronic_invoices')
          .select('*', { count: 'exact', head: true })
          .eq('repairer_id', repairer.user_id)
          .gte('invoice_date', periodStart.toISOString())
          .lte('invoice_date', periodEnd.toISOString());

        // Compter les factures chaînées
        const { count: chainedInvoices } = await supabase
          .from('electronic_invoices_chain')
          .select('*', { count: 'exact', head: true })
          .eq('repairer_id', repairer.user_id)
          .gte('chained_at', periodStart.toISOString())
          .lte('chained_at', periodEnd.toISOString());

        // Compter les archives
        const { count: archivesCreated } = await supabase
          .from('nf203_archives')
          .select('*', { count: 'exact', head: true })
          .eq('repairer_id', repairer.user_id)
          .gte('created_at', periodStart.toISOString())
          .lte('created_at', periodEnd.toISOString());

        // Compter les clôtures
        const { count: periodsClosed } = await supabase
          .from('nf203_period_closures')
          .select('*', { count: 'exact', head: true })
          .eq('repairer_id', repairer.user_id)
          .gte('closure_date', periodStart.toISOString())
          .lte('closure_date', periodEnd.toISOString());

        // Compter les alertes
        const { count: alertsCount } = await supabase
          .from('nf203_alerts')
          .select('*', { count: 'exact', head: true })
          .eq('repairer_id', repairer.user_id)
          .gte('created_at', periodStart.toISOString())
          .lte('created_at', periodEnd.toISOString());

        const complianceRate = totalInvoices ? (chainedInvoices || 0) / totalInvoices * 100 : 100;

        const reportData = {
          period: {
            start: periodStart.toISOString(),
            end: periodEnd.toISOString()
          },
          statistics: {
            total_invoices: totalInvoices || 0,
            chained_invoices: chainedInvoices || 0,
            compliance_rate: complianceRate,
            archives_created: archivesCreated || 0,
            periods_closed: periodsClosed || 0,
            alerts_count: alertsCount || 0
          }
        };

        // Insérer le rapport
        const { error: insertError } = await supabase
          .from('nf203_compliance_reports')
          .insert([{
            repairer_id: repairer.user_id,
            report_type: 'monthly',
            period_start: periodStart.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0],
            total_invoices: totalInvoices || 0,
            chained_invoices: chainedInvoices || 0,
            compliance_rate: complianceRate,
            periods_closed: periodsClosed || 0,
            archives_created: archivesCreated || 0,
            fec_exports: 0,
            alerts_count: alertsCount || 0,
            report_data: reportData
          }]);

        if (!insertError) {
          reportsGenerated++;

          // Envoyer une notification
          await supabase
            .from('notifications')
            .insert([{
              user_id: repairer.user_id,
              title: '📊 Rapport mensuel de conformité disponible',
              message: `Votre rapport de conformité pour ${lastMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} est disponible.`,
              type: 'nf203_info',
              data: { category: 'monthly_report', compliance_rate: complianceRate }
            }]);
        }

      } catch (error) {
        console.error(`Error generating report for ${repairer.user_id}:`, error);
      }
    }

    console.log(`✅ Monthly reports generated: ${reportsGenerated}`);

    return new Response(
      JSON.stringify({
        success: true,
        reports_generated: reportsGenerated,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in monthly report generator:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

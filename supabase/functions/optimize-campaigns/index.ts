import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { campaign_id } = await req.json();

    // Récupérer les données de performance
    const { data: analytics, error: analyticsError } = await supabase
      .from('advertising_analytics')
      .select('*')
      .eq('campaign_id', campaign_id)
      .order('date', { ascending: false })
      .limit(30); // 30 derniers jours

    if (analyticsError) throw analyticsError;

    // Analyser les performances
    const analysis = analyzePerformance(analytics || []);
    
    // Générer des recommandations
    const recommendations = generateRecommendations(analysis);
    
    // Appliquer les optimisations automatiques si activées
    const { data: campaign, error: campaignError } = await supabase
      .from('advertising_campaigns')
      .select('auto_optimization, targeting_config')
      .eq('id', campaign_id)
      .single();

    if (campaignError) throw campaignError;

    let appliedOptimizations = [];

    if (campaign.auto_optimization) {
      appliedOptimizations = await applyAutoOptimizations(supabase, campaign_id, analysis, recommendations);
    }

    // Sauvegarder les résultats d'optimisation
    const { error: logError } = await supabase
      .from('campaign_optimization_logs')
      .insert({
        campaign_id: campaign_id,
        analysis_date: new Date().toISOString(),
        performance_data: analysis,
        recommendations: recommendations,
        applied_optimizations: appliedOptimizations,
        optimization_score: calculateOptimizationScore(analysis)
      });

    if (logError) console.warn('Erreur sauvegarde log:', logError);

    return new Response(JSON.stringify({
      success: true,
      analysis: analysis,
      recommendations: recommendations,
      applied_optimizations: appliedOptimizations,
      optimization_score: calculateOptimizationScore(analysis)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur optimisation campagne:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzePerformance(analytics: any[]) {
  if (!analytics.length) {
    return {
      total_impressions: 0,
      total_clicks: 0,
      total_conversions: 0,
      total_cost: 0,
      total_revenue: 0,
      avg_ctr: 0,
      avg_cpc: 0,
      avg_roas: 0,
      trend: 'stable',
      channel_performance: {}
    };
  }

  const totals = analytics.reduce((acc, record) => ({
    impressions: acc.impressions + (record.impressions || 0),
    clicks: acc.clicks + (record.clicks || 0),
    conversions: acc.conversions + (record.conversions || 0),
    cost: acc.cost + (record.cost || 0),
    revenue: acc.revenue + (record.revenue || 0)
  }), { impressions: 0, clicks: 0, conversions: 0, cost: 0, revenue: 0 });

  const avg_ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
  const avg_cpc = totals.clicks > 0 ? totals.cost / totals.clicks : 0;
  const avg_roas = totals.cost > 0 ? totals.revenue / totals.cost : 0;

  // Analyser les performances par canal
  const channelStats = analytics.reduce((acc, record) => {
    if (!acc[record.channel]) {
      acc[record.channel] = { impressions: 0, clicks: 0, conversions: 0, cost: 0, revenue: 0 };
    }
    acc[record.channel].impressions += record.impressions || 0;
    acc[record.channel].clicks += record.clicks || 0;
    acc[record.channel].conversions += record.conversions || 0;
    acc[record.channel].cost += record.cost || 0;
    acc[record.channel].revenue += record.revenue || 0;
    return acc;
  }, {} as Record<string, any>);

  // Calculer les métriques par canal
  Object.keys(channelStats).forEach(channel => {
    const stats = channelStats[channel];
    stats.ctr = stats.impressions > 0 ? stats.clicks / stats.impressions : 0;
    stats.cpc = stats.clicks > 0 ? stats.cost / stats.clicks : 0;
    stats.roas = stats.cost > 0 ? stats.revenue / stats.cost : 0;
    stats.conversion_rate = stats.clicks > 0 ? stats.conversions / stats.clicks : 0;
  });

  return {
    total_impressions: totals.impressions,
    total_clicks: totals.clicks,
    total_conversions: totals.conversions,
    total_cost: totals.cost,
    total_revenue: totals.revenue,
    avg_ctr: avg_ctr,
    avg_cpc: avg_cpc,
    avg_roas: avg_roas,
    trend: calculateTrend(analytics),
    channel_performance: channelStats
  };
}

function generateRecommendations(analysis: any): string[] {
  const recommendations = [];

  // Recommandations basées sur le CTR
  if (analysis.avg_ctr < 0.02) {
    recommendations.push('CTR faible: Améliorer les créations publicitaires et les titres');
  } else if (analysis.avg_ctr > 0.05) {
    recommendations.push('Excellent CTR: Augmenter le budget pour maximiser la visibilité');
  }

  // Recommandations basées sur le ROAS
  if (analysis.avg_roas < 2) {
    recommendations.push('ROAS faible: Revoir le ciblage et optimiser les conversions');
  } else if (analysis.avg_roas > 5) {
    recommendations.push('ROAS élevé: Augmenter le budget et étendre le ciblage');
  }

  // Recommandations basées sur le CPC
  if (analysis.avg_cpc > 2) {
    recommendations.push('CPC élevé: Affiner le ciblage et améliorer le Quality Score');
  }

  // Recommandations par canal
  Object.entries(analysis.channel_performance).forEach(([channel, stats]: [string, any]) => {
    if (stats.roas < 2) {
      recommendations.push(`${channel}: Réduire le budget ou améliorer le ciblage (ROAS: ${stats.roas.toFixed(2)})`);
    } else if (stats.roas > 4) {
      recommendations.push(`${channel}: Augmenter le budget (ROAS: ${stats.roas.toFixed(2)})`);
    }
  });

  return recommendations;
}

async function applyAutoOptimizations(supabase: any, campaignId: string, analysis: any, recommendations: string[]): Promise<string[]> {
  const appliedOptimizations = [];

  try {
    // Optimisation 1: Ajuster les budgets par canal selon les performances
    const { data: budgets, error: budgetsError } = await supabase
      .from('advertising_budgets')
      .select('*')
      .eq('campaign_id', campaignId);

    if (!budgetsError && budgets) {
      for (const budget of budgets) {
        const channelPerf = analysis.channel_performance[budget.channel];
        if (channelPerf) {
          let newAllocation = budget.budget_allocated;
          
          if (channelPerf.roas > 4) {
            newAllocation = Math.min(budget.budget_allocated * 1.2, 200); // +20% max 200€
            appliedOptimizations.push(`Augmenté budget ${budget.channel}: +20%`);
          } else if (channelPerf.roas < 2) {
            newAllocation = Math.max(budget.budget_allocated * 0.8, 10); // -20% min 10€
            appliedOptimizations.push(`Réduit budget ${budget.channel}: -20%`);
          }

          if (newAllocation !== budget.budget_allocated) {
            await supabase
              .from('advertising_budgets')
              .update({ budget_allocated: newAllocation })
              .eq('id', budget.id);
          }
        }
      }
    }

    // Optimisation 2: Ajuster le ciblage si CTR faible
    if (analysis.avg_ctr < 0.015) {
      const { data: campaign, error: campaignError } = await supabase
        .from('advertising_campaigns')
        .select('targeting_config')
        .eq('id', campaignId)
        .single();

      if (!campaignError && campaign) {
        const newTargeting = { ...campaign.targeting_config };
        
        // Réduire le rayon si configuré
        if (newTargeting.location_radius && newTargeting.location_radius > 5) {
          newTargeting.location_radius = Math.max(newTargeting.location_radius * 0.8, 5);
          appliedOptimizations.push('Réduit rayon géographique pour améliorer pertinence');
        }

        await supabase
          .from('advertising_campaigns')
          .update({ targeting_config: newTargeting })
          .eq('id', campaignId);
      }
    }

  } catch (error) {
    console.error('Erreur application optimisations:', error);
  }

  return appliedOptimizations;
}

function calculateTrend(analytics: any[]): string {
  if (analytics.length < 7) return 'insufficient_data';

  const recent = analytics.slice(0, 3);
  const previous = analytics.slice(-3);

  const recentAvg = recent.reduce((sum, r) => sum + (r.roas || 0), 0) / recent.length;
  const previousAvg = previous.reduce((sum, r) => sum + (r.roas || 0), 0) / previous.length;

  if (recentAvg > previousAvg * 1.1) return 'improving';
  if (recentAvg < previousAvg * 0.9) return 'declining';
  return 'stable';
}

function calculateOptimizationScore(analysis: any): number {
  let score = 50; // Base score

  // Score based on ROAS
  if (analysis.avg_roas > 4) score += 20;
  else if (analysis.avg_roas > 2) score += 10;
  else if (analysis.avg_roas < 1) score -= 20;

  // Score based on CTR
  if (analysis.avg_ctr > 0.03) score += 15;
  else if (analysis.avg_ctr > 0.02) score += 10;
  else if (analysis.avg_ctr < 0.01) score -= 15;

  // Score based on trend
  if (analysis.trend === 'improving') score += 10;
  else if (analysis.trend === 'declining') score -= 10;

  return Math.max(0, Math.min(100, score));
}
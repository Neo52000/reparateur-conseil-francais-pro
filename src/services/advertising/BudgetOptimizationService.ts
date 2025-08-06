import { supabase } from '@/integrations/supabase/client';
import { AdvertisingBudget } from '@/types/advertising-ai';

export class BudgetOptimizationService {
  static async optimizeBudgetAllocation(campaignId: string): Promise<AdvertisingBudget[]> {
    // Récupérer les performances par canal
    const { data: analytics, error } = await supabase
      .from('advertising_analytics')
      .select('*')
      .eq('campaign_id', campaignId);

    if (error) throw error;

    const performanceByChannel = this.analyzeChannelPerformance(analytics || []);
    const budgets = await this.getCurrentBudgets(campaignId);

    // Redistribuer le budget selon les performances
    return this.redistributeBudgets(budgets, performanceByChannel);
  }

  private static analyzeChannelPerformance(analytics: any[]) {
    const channelStats = analytics.reduce((acc, record) => {
      if (!acc[record.channel]) {
        acc[record.channel] = {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          cost: 0,
          revenue: 0
        };
      }

      acc[record.channel].impressions += record.impressions || 0;
      acc[record.channel].clicks += record.clicks || 0;
      acc[record.channel].conversions += record.conversions || 0;
      acc[record.channel].cost += record.cost || 0;
      acc[record.channel].revenue += record.revenue || 0;

      return acc;
    }, {} as Record<string, any>);

    // Calculer le ROAS pour chaque canal
    Object.keys(channelStats).forEach(channel => {
      const stats = channelStats[channel];
      stats.roas = stats.cost > 0 ? stats.revenue / stats.cost : 0;
      stats.ctr = stats.impressions > 0 ? stats.clicks / stats.impressions : 0;
      stats.conversionRate = stats.clicks > 0 ? stats.conversions / stats.clicks : 0;
    });

    return channelStats;
  }

  private static async getCurrentBudgets(campaignId: string): Promise<AdvertisingBudget[]> {
    const { data, error } = await supabase
      .from('advertising_budgets')
      .select('*')
      .eq('campaign_id', campaignId);

    if (error) throw error;
    return (data || []) as AdvertisingBudget[];
  }

  private static async redistributeBudgets(
    budgets: AdvertisingBudget[],
    performance: Record<string, any>
  ): Promise<AdvertisingBudget[]> {
    const totalBudget = budgets.reduce((sum, b) => sum + b.budget_allocated, 0);
    const channels = Object.keys(performance);
    
    if (channels.length === 0) return budgets;

    // Calculer les scores de performance
    const performanceScores = channels.reduce((acc, channel) => {
      const stats = performance[channel];
      // Score basé sur ROAS, CTR et taux de conversion
      acc[channel] = (stats.roas * 0.5) + (stats.ctr * 100 * 0.3) + (stats.conversionRate * 100 * 0.2);
      return acc;
    }, {} as Record<string, number>);

    const totalScore = Object.values(performanceScores).reduce((sum, score) => sum + score, 0);

    // Redistribuer le budget proportionnellement aux scores
    const updatedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const score = performanceScores[budget.channel] || 0;
        const newAllocation = totalScore > 0 ? (score / totalScore) * totalBudget : budget.budget_allocated;

        const { data, error } = await supabase
          .from('advertising_budgets')
          .update({ budget_allocated: Math.round(newAllocation) })
          .eq('id', budget.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      })
    );

    return updatedBudgets as AdvertisingBudget[];
  }

  static async setAutoBidding(budgetId: string, enabled: boolean, rules: any): Promise<void> {
    const { error } = await supabase
      .from('advertising_budgets')
      .update({
        auto_optimization: enabled,
        optimization_rules: rules
      })
      .eq('id', budgetId);

    if (error) throw error;
  }

  static async getBudgetRecommendations(campaignId: string): Promise<string[]> {
    const performance = await this.analyzeChannelPerformance([]);
    const recommendations: string[] = [];

    Object.entries(performance).forEach(([channel, stats]: [string, any]) => {
      if (stats.roas < 2) {
        recommendations.push(`Réduire le budget sur ${channel} (ROAS faible: ${stats.roas.toFixed(2)})`);
      } else if (stats.roas > 5) {
        recommendations.push(`Augmenter le budget sur ${channel} (ROAS élevé: ${stats.roas.toFixed(2)})`);
      }

      if (stats.ctr < 0.01) {
        recommendations.push(`Améliorer les créations sur ${channel} (CTR faible: ${(stats.ctr * 100).toFixed(2)}%)`);
      }
    });

    return recommendations;
  }
}
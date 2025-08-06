import { supabase } from '@/integrations/supabase/client';
import { AdvertisingCampaign, CreateCampaignData, CampaignPerformanceMetrics } from '@/types/advertising-ai';

export class AdvertisingCampaignService {
  static async createCampaign(data: CreateCampaignData): Promise<AdvertisingCampaign> {
    const { data: campaign, error } = await supabase
      .from('advertising_campaigns')
      .insert({
        ...data,
        repairer_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return campaign as AdvertisingCampaign;
  }

  static async getCampaigns(repairerId?: string): Promise<AdvertisingCampaign[]> {
    let query = supabase.from('advertising_campaigns').select('*');
    
    if (repairerId) {
      query = query.eq('repairer_id', repairerId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as AdvertisingCampaign[];
  }

  static async updateCampaign(id: string, updates: Partial<AdvertisingCampaign>): Promise<AdvertisingCampaign> {
    const { data, error } = await supabase
      .from('advertising_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AdvertisingCampaign;
  }

  static async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('advertising_campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getCampaignPerformance(campaignId: string): Promise<CampaignPerformanceMetrics> {
    const { data, error } = await supabase
      .from('advertising_analytics')
      .select('*')
      .eq('campaign_id', campaignId);

    if (error) throw error;

    const analytics = data || [];
    
    return {
      total_impressions: analytics.reduce((sum, a) => sum + (a.impressions || 0), 0),
      total_clicks: analytics.reduce((sum, a) => sum + (a.clicks || 0), 0),
      total_conversions: analytics.reduce((sum, a) => sum + (a.conversions || 0), 0),
      total_cost: analytics.reduce((sum, a) => sum + (a.cost || 0), 0),
      total_revenue: analytics.reduce((sum, a) => sum + (a.revenue || 0), 0),
      average_ctr: analytics.length ? analytics.reduce((sum, a) => sum + (a.ctr || 0), 0) / analytics.length : 0,
      average_cpc: analytics.length ? analytics.reduce((sum, a) => sum + (a.cpc || 0), 0) / analytics.length : 0,
      average_roas: analytics.length ? analytics.reduce((sum, a) => sum + (a.roas || 0), 0) / analytics.length : 0,
      best_performing_channel: 'google_ads',
      best_performing_creative: '',
      optimization_suggestions: []
    };
  }

  static async optimizeCampaign(campaignId: string): Promise<string[]> {
    const performance = await this.getCampaignPerformance(campaignId);
    const suggestions: string[] = [];

    if (performance.average_ctr < 2) {
      suggestions.push('Améliorer les créations publicitaires pour augmenter le CTR');
    }

    if (performance.average_roas < 3) {
      suggestions.push('Revoir le ciblage pour améliorer le ROAS');
    }

    if (performance.total_clicks > 0 && performance.total_conversions === 0) {
      suggestions.push('Optimiser la page de destination pour améliorer les conversions');
    }

    return suggestions;
  }
}
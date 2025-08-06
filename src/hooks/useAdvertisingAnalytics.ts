import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdvertisingAnalytics {
  id: string;
  date: string;
  campaign_id?: string;
  creative_id?: string;
  channel: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
  ctr: number;
  cpc: number;
  roas: number;
}

export interface CampaignPerformance {
  id: string;
  name: string;
  status: string;
  budget_total: number;
  budget_spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
}

export const useAdvertisingAnalytics = () => {
  const [analytics, setAnalytics] = useState<AdvertisingAnalytics[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAnalytics = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('advertising_analytics')
        .select('*')
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignPerformance = async () => {
    setLoading(true);
    try {
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('advertising_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      // Calculer les performances pour chaque campagne
      const campaignPerformance = await Promise.all(
        (campaignsData || []).map(async (campaign) => {
          const { data: analyticsData } = await supabase
            .from('advertising_analytics')
            .select('*')
            .eq('campaign_id', campaign.id);

          const totalImpressions = analyticsData?.reduce((sum, row) => sum + row.impressions, 0) || 0;
          const totalClicks = analyticsData?.reduce((sum, row) => sum + row.clicks, 0) || 0;
          const totalConversions = analyticsData?.reduce((sum, row) => sum + row.conversions, 0) || 0;
          const totalCost = analyticsData?.reduce((sum, row) => sum + row.cost, 0) || 0;
          const totalRevenue = analyticsData?.reduce((sum, row) => sum + row.revenue, 0) || 0;

          const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
          const cpc = totalClicks > 0 ? totalCost / totalClicks : 0;
          const roas = totalCost > 0 ? totalRevenue / totalCost : 0;

          return {
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            budget_total: campaign.budget_total,
            budget_spent: campaign.budget_spent,
            impressions: totalImpressions,
            clicks: totalClicks,
            conversions: totalConversions,
            ctr: Number(ctr.toFixed(2)),
            cpc: Number(cpc.toFixed(2)),
            roas: Number(roas.toFixed(2))
          };
        })
      );

      setCampaigns(campaignPerformance);
    } catch (error) {
      console.error('Error fetching campaign performance:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les performances des campagnes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTopPerformers = () => {
    return campaigns
      .sort((a, b) => b.roas - a.roas)
      .slice(0, 5);
  };

  const getTotalMetrics = () => {
    return analytics.reduce((acc, item) => {
      acc.impressions += item.impressions;
      acc.clicks += item.clicks;
      acc.conversions += item.conversions;
      acc.cost += item.cost;
      acc.revenue += item.revenue;
      return acc;
    }, {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      cost: 0,
      revenue: 0
    });
  };

  useEffect(() => {
    fetchAnalytics();
    fetchCampaignPerformance();
  }, []);

  return {
    analytics,
    campaigns,
    loading,
    fetchAnalytics,
    fetchCampaignPerformance,
    getTopPerformers,
    getTotalMetrics
  };
};
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface RepairerAnalyticsData {
  profileViews: number;
  quoteRequests: number;
  contactClicks: number;
  conversionRate: number;
  rankingPosition: number | null;
  dailyStats: Array<{
    date: string;
    profile_views: number;
    quote_requests: number;
    contact_clicks: number;
    conversion_rate: number;
  }>;
}

export function useRepairerAnalytics(repairerId?: string) {
  const { profile } = useAuth();
  const [data, setData] = useState<RepairerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const targetId = repairerId || profile?.id;

  const loadAnalytics = useCallback(async () => {
    if (!targetId) return;
    try {
      setLoading(true);

      // Last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: stats, error } = await supabase
        .from('repairer_analytics')
        .select('*')
        .eq('repairer_id', targetId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const dailyStats = (stats || []).map(s => ({
        date: s.date,
        profile_views: s.profile_views || 0,
        quote_requests: s.quote_requests || 0,
        contact_clicks: s.contact_clicks || 0,
        conversion_rate: s.conversion_rate || 0,
      }));

      const totals = dailyStats.reduce(
        (acc, day) => ({
          profileViews: acc.profileViews + day.profile_views,
          quoteRequests: acc.quoteRequests + day.quote_requests,
          contactClicks: acc.contactClicks + day.contact_clicks,
        }),
        { profileViews: 0, quoteRequests: 0, contactClicks: 0 }
      );

      const conversionRate = totals.profileViews > 0
        ? (totals.quoteRequests / totals.profileViews) * 100
        : 0;

      const latestRanking = stats?.length
        ? stats[stats.length - 1].ranking_position
        : null;

      setData({
        ...totals,
        conversionRate: Math.round(conversionRate * 10) / 10,
        rankingPosition: latestRanking,
        dailyStats,
      });
    } catch (err) {
      console.error('Error loading repairer analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  // Track a profile view
  const trackView = useCallback(async (viewedRepairerId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Upsert today's record
      const { data: existing } = await supabase
        .from('repairer_analytics')
        .select('id, profile_views')
        .eq('repairer_id', viewedRepairerId)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('repairer_analytics')
          .update({ profile_views: (existing.profile_views || 0) + 1 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('repairer_analytics')
          .insert({ repairer_id: viewedRepairerId, date: today, profile_views: 1 });
      }
    } catch (err) {
      // Silent fail for tracking
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return { data, loading, refresh: loadAnalytics, trackView };
}

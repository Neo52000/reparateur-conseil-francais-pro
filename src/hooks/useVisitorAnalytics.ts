import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VisitorStats {
  today: number;
  yesterday: number;
  thisWeek: number;
  thisMonth: number;
  totalPageViews: number;
  uniqueVisitors: number;
  topPages: Array<{
    page_path: string;
    views: number;
  }>;
  deviceStats: Array<{
    device_type: string;
    count: number;
  }>;
  trafficSources: Array<{
    referrer: string;
    count: number;
  }>;
}

export const useVisitorAnalytics = () => {
  const [stats, setStats] = useState<VisitorStats>({
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0,
    totalPageViews: 0,
    uniqueVisitors: 0,
    topPages: [],
    deviceStats: [],
    trafficSources: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const trackVisitor = async (pageData: {
    page_path: string;
    session_id?: string;
    user_agent?: string;
    referrer?: string;
    device_type?: string;
    browser?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('visitor_analytics')
        .insert([{
          ...pageData,
          visited_at: new Date().toISOString()
        }]);

      if (error) {
        console.warn('Warning tracking visitor (non-critical):', error);
        return; // Ne pas faire planter l'app pour un problème de tracking
      }
    } catch (error) {
      console.warn('Error tracking visitor (non-critical):', error);
      // Ne pas relancer l'erreur pour éviter de faire planter l'app
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      // Stats du jour
      const { count: todayCount } = await supabase
        .from('visitor_analytics')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', today.toISOString());

      // Stats d'hier
      const { count: yesterdayCount } = await supabase
        .from('visitor_analytics')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', yesterday.toISOString())
        .lt('visited_at', today.toISOString());

      // Stats de la semaine
      const { count: weekCount } = await supabase
        .from('visitor_analytics')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', weekAgo.toISOString());

      // Stats du mois
      const { count: monthCount } = await supabase
        .from('visitor_analytics')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', monthAgo.toISOString());

      // Total des pages vues
      const { count: totalViews } = await supabase
        .from('visitor_analytics')
        .select('*', { count: 'exact', head: true });

      // Visiteurs uniques (approximation via session_id)
      const { data: uniqueSessionsData } = await supabase
        .from('visitor_analytics')
        .select('session_id')
        .not('session_id', 'is', null);

      const uniqueVisitors = new Set(uniqueSessionsData?.map(item => item.session_id)).size;

      // Pages les plus visitées
      const { data: topPagesData } = await supabase
        .from('visitor_analytics')
        .select('page_path')
        .gte('visited_at', weekAgo.toISOString());

      const pageViewCounts = topPagesData?.reduce((acc, item) => {
        acc[item.page_path] = (acc[item.page_path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topPages = Object.entries(pageViewCounts)
        .map(([page_path, views]) => ({ page_path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Stats par type d'appareil
      const { data: deviceData } = await supabase
        .from('visitor_analytics')
        .select('device_type')
        .not('device_type', 'is', null)
        .gte('visited_at', weekAgo.toISOString());

      const deviceCounts = deviceData?.reduce((acc, item) => {
        const device = item.device_type || 'Inconnu';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const deviceStats = Object.entries(deviceCounts)
        .map(([device_type, count]) => ({ device_type, count }))
        .sort((a, b) => b.count - a.count);

      // Sources de trafic
      const { data: referrerData } = await supabase
        .from('visitor_analytics')
        .select('referrer')
        .not('referrer', 'is', null)
        .gte('visited_at', weekAgo.toISOString());

      const referrerCounts = referrerData?.reduce((acc, item) => {
        const referrer = item.referrer || 'Direct';
        const domain = referrer === 'Direct' ? 'Direct' : 
          referrer.startsWith('http') ? new URL(referrer).hostname : referrer;
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const trafficSources = Object.entries(referrerCounts)
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        today: todayCount || 0,
        yesterday: yesterdayCount || 0,
        thisWeek: weekCount || 0,
        thisMonth: monthCount || 0,
        totalPageViews: totalViews || 0,
        uniqueVisitors,
        topPages,
        deviceStats,
        trafficSources
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    
    // Actualiser les stats toutes les 5 minutes
    const interval = setInterval(loadAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    loading,
    error,
    trackVisitor,
    refreshStats: loadAnalytics
  };
};
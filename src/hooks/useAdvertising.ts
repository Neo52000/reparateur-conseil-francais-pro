
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AdBanner, AdStats, AdBannerRow } from '@/types/advertising';

// Helper function to convert database row to AdBanner
const convertRowToAdBanner = (row: AdBannerRow): AdBanner => ({
  ...row,
  target_type: row.target_type as 'client' | 'repairer',
  start_date: row.start_date || undefined,
  end_date: row.end_date || undefined,
  max_impressions: row.max_impressions || undefined,
  max_clicks: row.max_clicks || undefined,
  daily_budget: row.daily_budget || undefined,
  created_by: row.created_by || undefined,
  targeting_config: typeof row.targeting_config === 'string' 
    ? JSON.parse(row.targeting_config) 
    : (row.targeting_config || {})
});

export const useAdvertising = () => {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchBanners = async (targetType?: 'client' | 'repairer') => {
    setLoading(true);
    try {
      let query = supabase
        .from('ad_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (targetType) {
        query = query.eq('target_type', targetType);
      }

      const { data, error } = await query;

      if (error) throw error;
      const convertedBanners = (data || []).map((row) => convertRowToAdBanner(row as AdBannerRow));
      setBanners(convertedBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les bannières",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createBanner = async (banner: Omit<AdBanner, 'id' | 'created_at' | 'updated_at' | 'current_impressions' | 'current_clicks'>) => {
    try {
      const { data, error } = await supabase
        .from('ad_banners')
        .insert([banner])
        .select()
        .single();

      if (error) throw error;

      const convertedBanner = convertRowToAdBanner(data as AdBannerRow);
      setBanners(prev => [convertedBanner, ...prev]);
      toast({
        title: "Succès",
        description: "Bannière créée avec succès"
      });
      return convertedBanner;
    } catch (error) {
      console.error('Error creating banner:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la bannière",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateBanner = async (id: string, updates: Partial<AdBanner>) => {
    try {
      const { data, error } = await supabase
        .from('ad_banners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const convertedBanner = convertRowToAdBanner(data as AdBannerRow);
      setBanners(prev => prev.map(banner => 
        banner.id === id ? convertedBanner : banner
      ));
      
      toast({
        title: "Succès",
        description: "Bannière mise à jour"
      });
      return convertedBanner;
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la bannière",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ad_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBanners(prev => prev.filter(banner => banner.id !== id));
      toast({
        title: "Succès",
        description: "Bannière supprimée"
      });
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la bannière",
        variant: "destructive"
      });
      throw error;
    }
  };

  const recordImpression = async (bannerId: string, placement: string) => {
    try {
      await supabase
        .from('ad_impressions')
        .insert([{
          banner_id: bannerId,
          placement,
          user_agent: navigator.userAgent
        }]);

      // Increment banner impression count using RPC
      await supabase.rpc('increment_impressions', { banner_id: bannerId });
    } catch (error) {
      console.error('Error recording impression:', error);
    }
  };

  const recordClick = async (bannerId: string, placement: string) => {
    try {
      await supabase
        .from('ad_clicks')
        .insert([{
          banner_id: bannerId,
          placement,
          user_agent: navigator.userAgent
        }]);

      // Increment banner click count using RPC
      await supabase.rpc('increment_clicks', { banner_id: bannerId });
    } catch (error) {
      console.error('Error recording click:', error);
    }
  };

  const getStats = async (bannerId?: string): Promise<AdStats[]> => {
    try {
      let query = supabase
        .from('ad_banners')
        .select(`
          id,
          title,
          current_impressions,
          current_clicks
        `);

      if (bannerId) {
        query = query.eq('id', bannerId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(banner => ({
        banner_id: banner.id,
        impressions: banner.current_impressions,
        clicks: banner.current_clicks,
        ctr: banner.current_impressions > 0 ? (banner.current_clicks / banner.current_impressions) * 100 : 0,
        period: 'total'
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
      return [];
    }
  };

  const getActiveBanners = async (targetType: 'client' | 'repairer', placement: string) => {
    try {
      const { data, error } = await supabase
        .from('ad_banners')
        .select('*')
        .eq('target_type', targetType)
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${new Date().toISOString()}`)
        .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
        .limit(3);

      if (error) throw error;
      return (data || []).map((row) => convertRowToAdBanner(row as AdBannerRow));
    } catch (error) {
      console.error('Error fetching active banners:', error);
      return [];
    }
  };

  return {
    banners,
    loading,
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    recordImpression,
    recordClick,
    getStats,
    getActiveBanners
  };
};

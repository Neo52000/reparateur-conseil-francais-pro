
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdBanner, AdPlacement, AdTargetingRules } from '@/types/advertising';
import { useAuth } from '@/hooks/useAuth';

const isDev = import.meta.env.DEV;

export const useAdvertising = (placement: AdPlacement) => {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const { user, profile } = useAuth();

  // Récupérer les bannières en fonction du placement et du ciblage
  const fetchBanners = useCallback(async () => {
    if (hasFetched) return;
    
    try {
      setLoading(true);
      
      const { data: rawBanners, error } = await supabase
        .from('ad_banners')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching banners:', error);
        setBanners([]);
        return;
      }

      if (!rawBanners || rawBanners.length === 0) {
        setBanners([]);
        return;
      }

      const filteredBanners = rawBanners
        .filter(banner => {
          if (placement === 'homepage_carousel') {
            return banner.target_type === 'client';
          } else if (placement === 'repairer_dashboard') {
            return banner.target_type === 'repairer';
          }
          return true;
        })
        .map(banner => ({
          ...banner,
          target_type: banner.target_type as 'client' | 'repairer'
        })) as AdBanner[];

      setBanners(filteredBanners);
      setHasFetched(true);
    } catch (error) {
      console.error('Exception in fetchBanners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, [placement, hasFetched]);

  // Enregistrer une impression
  const trackImpression = useCallback(async (bannerId: string) => {
    try {
      const { error: rpcError } = await supabase.rpc('increment_impressions', { banner_id: bannerId });
      if (rpcError && isDev) {
        console.error('Error incrementing impressions:', rpcError);
      }

      if (user?.id) {
        await supabase
          .from('ad_impressions')
          .insert({
            banner_id: bannerId,
            user_id: user.id,
            placement,
            ip_address: null,
            user_agent: navigator.userAgent
          });
      }
    } catch (error) {
      if (isDev) console.error('Error tracking impression:', error);
    }
  }, [user?.id, placement]);

  // Enregistrer un clic
  const trackClick = useCallback(async (bannerId: string) => {
    try {
      const { error: rpcError } = await supabase.rpc('increment_clicks', { banner_id: bannerId });
      if (rpcError && isDev) {
        console.error('Error incrementing clicks:', rpcError);
      }

      if (user?.id) {
        await supabase
          .from('ad_clicks')
          .insert({
            banner_id: bannerId,
            user_id: user.id,
            placement,
            ip_address: null,
            user_agent: navigator.userAgent
          });
      }
    } catch (error) {
      if (isDev) console.error('Error tracking click:', error);
    }
  }, [user?.id, placement]);

  // Rotation automatique des bannières
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Charger les bannières au montage
  useEffect(() => {
    if (!hasFetched) {
      fetchBanners();
    }
  }, [fetchBanners, hasFetched]);

  const currentBanner = banners[currentBannerIndex] || null;

  // Enregistrer l'impression quand une nouvelle bannière est affichée
  useEffect(() => {
    if (currentBanner) {
      trackImpression(currentBanner.id);
    }
  }, [currentBanner, trackImpression]);

  return {
    banners,
    currentBanner,
    loading,
    trackClick,
    refreshBanners: fetchBanners
  };
};

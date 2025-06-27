
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdBanner, AdPlacement, AdTargetingRules } from '@/types/advertising';
import { useAuth } from '@/hooks/useAuth';

export const useAdvertising = (placement: AdPlacement) => {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  console.log('useAdvertising - placement:', placement);
  console.log('useAdvertising - user:', user?.id);

  // Récupérer les bannières en fonction du placement et du ciblage
  const fetchBanners = useCallback(async () => {
    try {
      console.log('useAdvertising - fetching banners for placement:', placement);
      setLoading(true);
      
      const now = new Date().toISOString();
      console.log('useAdvertising - current time:', now);
      
      // Requête de base pour les bannières actives
      let query = supabase
        .from('ad_banners')
        .select('*')
        .eq('is_active', true);

      // Ajouter les filtres de date si nécessaire
      // On ne filtre plus par date pour le debug
      console.log('useAdvertising - executing query...');

      const { data: rawBanners, error } = await query;

      console.log('useAdvertising - query result:', { rawBanners, error });

      if (error) {
        console.error('Error fetching banners:', error);
        setBanners([]);
        return;
      }

      if (!rawBanners || rawBanners.length === 0) {
        console.log('useAdvertising - no banners found');
        setBanners([]);
        return;
      }

      console.log('useAdvertising - found banners:', rawBanners.length);

      // Filtrer par type de cible selon le placement
      const filteredBanners = rawBanners
        .filter(banner => {
          console.log('useAdvertising - checking banner:', banner.id, 'target_type:', banner.target_type);
          
          if (placement === 'homepage_carousel') {
            return banner.target_type === 'client';
          } else if (placement === 'repairer_dashboard') {
            return banner.target_type === 'repairer';
          }
          
          // Pour search_results, accepter les deux types
          return true;
        })
        .map(banner => ({
          ...banner,
          target_type: banner.target_type as 'client' | 'repairer'
        })) as AdBanner[];

      console.log('useAdvertising - filtered banners:', filteredBanners.length);
      setBanners(filteredBanners);
    } catch (error) {
      console.error('Error in fetchBanners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, [placement]);

  // Enregistrer une impression
  const trackImpression = useCallback(async (bannerId: string) => {
    try {
      console.log('useAdvertising - tracking impression for banner:', bannerId);
      
      // Utiliser la fonction RPC existante
      const { error: rpcError } = await supabase.rpc('increment_impressions', { banner_id: bannerId });
      if (rpcError) {
        console.error('Error incrementing impressions:', rpcError);
      }

      // Enregistrer l'impression détaillée
      const { error: insertError } = await supabase
        .from('ad_impressions')
        .insert({
          banner_id: bannerId,
          user_id: user?.id,
          placement,
          ip_address: null,
          user_agent: navigator.userAgent
        });

      if (insertError) {
        console.error('Error inserting impression:', insertError);
      } else {
        console.log('useAdvertising - impression tracked successfully');
      }
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  }, [user?.id, placement]);

  // Enregistrer un clic
  const trackClick = useCallback(async (bannerId: string) => {
    try {
      console.log('useAdvertising - tracking click for banner:', bannerId);
      
      // Utiliser la fonction RPC existante
      const { error: rpcError } = await supabase.rpc('increment_clicks', { banner_id: bannerId });
      if (rpcError) {
        console.error('Error incrementing clicks:', rpcError);
      }

      // Enregistrer le clic détaillé
      const { error: insertError } = await supabase
        .from('ad_clicks')
        .insert({
          banner_id: bannerId,
          user_id: user?.id,
          placement,
          ip_address: null,
          user_agent: navigator.userAgent
        });

      if (insertError) {
        console.error('Error inserting click:', insertError);
      } else {
        console.log('useAdvertising - click tracked successfully');
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }, [user?.id, placement]);

  // Rotation automatique des bannières (toutes les 10 secondes)
  useEffect(() => {
    if (banners.length <= 1) return;

    console.log('useAdvertising - setting up banner rotation for', banners.length, 'banners');
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => {
        const newIndex = (prev + 1) % banners.length;
        console.log('useAdvertising - rotating to banner index:', newIndex);
        return newIndex;
      });
    }, 10000);

    return () => {
      console.log('useAdvertising - cleaning up banner rotation');
      clearInterval(interval);
    };
  }, [banners.length]);

  // Charger les bannières au montage
  useEffect(() => {
    console.log('useAdvertising - mounting, fetching banners');
    fetchBanners();
  }, [fetchBanners]);

  // Bannière actuelle
  const currentBanner = banners[currentBannerIndex] || null;

  // Enregistrer automatiquement l'impression quand une nouvelle bannière est affichée
  useEffect(() => {
    if (currentBanner) {
      console.log('useAdvertising - new banner displayed:', currentBanner.id);
      trackImpression(currentBanner.id);
    }
  }, [currentBanner, trackImpression]);

  console.log('useAdvertising - returning:', {
    banners: banners.length,
    currentBanner: currentBanner?.id,
    loading
  });

  return {
    banners,
    currentBanner,
    loading,
    trackClick,
    refreshBanners: fetchBanners
  };
};

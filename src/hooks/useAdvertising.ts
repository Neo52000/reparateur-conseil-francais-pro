
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdBanner, AdPlacement, AdTargetingRules } from '@/types/advertising';
import { useAuth } from '@/hooks/useAuth';

export const useAdvertising = (placement: AdPlacement) => {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  // Récupérer les bannières en fonction du placement et du ciblage
  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      
      const now = new Date().toISOString();
      
      // Requête de base pour les bannières actives
      let query = supabase
        .from('ad_banners')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`);

      // Filtrer par type de cible selon le placement
      if (placement === 'homepage_carousel') {
        query = query.eq('target_type', 'client');
      } else if (placement === 'repairer_dashboard') {
        query = query.eq('target_type', 'repairer');
      }

      const { data: rawBanners, error } = await query;

      if (error) {
        console.error('Error fetching banners:', error);
        return;
      }

      if (!rawBanners) {
        setBanners([]);
        return;
      }

      // Filtrer par ciblage spécifique et caster le type
      const filteredBanners = rawBanners
        .filter(banner => {
          const targeting = banner.targeting_config as AdTargetingRules;
          
          // Si c'est un ciblage global, afficher partout
          if (targeting.global) {
            return true;
          }

          // Pour le dashboard réparateur, vérifier le niveau d'abonnement
          if (placement === 'repairer_dashboard' && targeting.subscription_tiers) {
            // On utilisera cette logique plus tard avec les données de subscription
            return true;
          }

          // Pour l'instant, afficher toutes les bannières actives
          return true;
        })
        .map(banner => ({
          ...banner,
          target_type: banner.target_type as 'client' | 'repairer'
        })) as AdBanner[];

      setBanners(filteredBanners);
    } catch (error) {
      console.error('Error in fetchBanners:', error);
    } finally {
      setLoading(false);
    }
  }, [placement]);

  // Enregistrer une impression
  const trackImpression = useCallback(async (bannerId: string) => {
    try {
      // Utiliser la fonction RPC existante
      await supabase.rpc('increment_impressions', { banner_id: bannerId });

      // Enregistrer l'impression détaillée
      await supabase
        .from('ad_impressions')
        .insert({
          banner_id: bannerId,
          user_id: user?.id,
          placement,
          ip_address: null, // À implémenter côté serveur si nécessaire
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  }, [user?.id, placement]);

  // Enregistrer un clic
  const trackClick = useCallback(async (bannerId: string) => {
    try {
      // Utiliser la fonction RPC existante
      await supabase.rpc('increment_clicks', { banner_id: bannerId });

      // Enregistrer le clic détaillé
      await supabase
        .from('ad_clicks')
        .insert({
          banner_id: bannerId,
          user_id: user?.id,
          placement,
          ip_address: null, // À implémenter côté serveur si nécessaire
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }, [user?.id, placement]);

  // Rotation automatique des bannières (toutes les 10 secondes)
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Charger les bannières au montage
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Bannière actuelle
  const currentBanner = banners[currentBannerIndex] || null;

  // Enregistrer automatiquement l'impression quand une nouvelle bannière est affichée
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

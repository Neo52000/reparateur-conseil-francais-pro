
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdBanner, AdPlacement, AdTargetingRules } from '@/types/advertising';
import { useAuth } from '@/hooks/useAuth';

export const useAdvertising = (placement: AdPlacement) => {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const { user, profile } = useAuth();

  console.log('🔥 useAdvertising - Hook initialized for placement:', placement);

  // Récupérer les bannières en fonction du placement et du ciblage
  const fetchBanners = useCallback(async () => {
    if (hasFetched) return; // Éviter les appels multiples
    
    try {
      console.log('🔍 Fetching banners for placement:', placement);
      console.log('🗄️ Database connection test - calling Supabase...');
      setLoading(true);
      
      // Requête simplifiée pour récupérer toutes les bannières actives
      const { data: rawBanners, error } = await supabase
        .from('ad_banners')
        .select('*')
        .eq('is_active', true);

      console.log('📊 Raw Supabase query result:', { 
        rawBannerCount: rawBanners?.length || 0, 
        error,
        rawBanners: rawBanners?.map(b => ({ 
          id: b.id, 
          title: b.title, 
          target_type: b.target_type,
          is_active: b.is_active,
          image_url: b.image_url?.substring(0, 50) + '...'
        }))
      });

      if (error) {
        console.error('❌ Error fetching banners:', error);
        setBanners([]);
        return;
      }

      if (!rawBanners || rawBanners.length === 0) {
        console.log('⚠️ No banners found in database - checking if table exists and has data');
        
        // Test de connexion à la table
        const { count } = await supabase
          .from('ad_banners')
          .select('*', { count: 'exact', head: true });
        
        console.log('🔢 Total banners in database (including inactive):', count);
        setBanners([]);
        return;
      }

      console.log('✅ Found banners:', rawBanners.length);

      // Filtrer par type de cible selon le placement
      const filteredBanners = rawBanners
        .filter(banner => {
          console.log('🎯 Checking banner:', {
            id: banner.id,
            title: banner.title,
            target_type: banner.target_type,
            placement: placement,
            shouldShow: placement === 'homepage_carousel' ? banner.target_type === 'client' : true
          });
          
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

      console.log('🎪 Filtered banners for', placement, ':', {
        count: filteredBanners.length,
        banners: filteredBanners.map(b => ({ id: b.id, title: b.title, target_type: b.target_type }))
      });
      setBanners(filteredBanners);
      setHasFetched(true); // Marquer comme récupéré
    } catch (error) {
      console.error('💥 Exception in fetchBanners:', error);
      setBanners([]);
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  }, [placement, hasFetched]);

  // Enregistrer une impression
  const trackImpression = useCallback(async (bannerId: string) => {
    try {
      console.log('👁️ Tracking impression for banner:', bannerId);
      
      // Utiliser la fonction RPC existante
      const { error: rpcError } = await supabase.rpc('increment_impressions', { banner_id: bannerId });
      if (rpcError) {
        console.error('❌ Error incrementing impressions:', rpcError);
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
        console.error('❌ Error inserting impression:', insertError);
      } else {
        console.log('✅ Impression tracked successfully');
      }
    } catch (error) {
      console.error('💥 Error tracking impression:', error);
    }
  }, [user?.id, placement]);

  // Enregistrer un clic
  const trackClick = useCallback(async (bannerId: string) => {
    try {
      console.log('🖱️ Tracking click for banner:', bannerId);
      
      // Utiliser la fonction RPC existante
      const { error: rpcError } = await supabase.rpc('increment_clicks', { banner_id: bannerId });
      if (rpcError) {
        console.error('❌ Error incrementing clicks:', rpcError);
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
        console.error('❌ Error inserting click:', insertError);
      } else {
        console.log('✅ Click tracked successfully');
      }
    } catch (error) {
      console.error('💥 Error tracking click:', error);
    }
  }, [user?.id, placement]);

  // Rotation automatique des bannières (toutes les 10 secondes)
  useEffect(() => {
    if (banners.length <= 1) return;

    console.log('🔄 Setting up banner rotation for', banners.length, 'banners');
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => {
        const newIndex = (prev + 1) % banners.length;
        console.log('🎠 Rotating to banner index:', newIndex);
        return newIndex;
      });
    }, 10000);

    return () => {
      console.log('🧹 Cleaning up banner rotation');
      clearInterval(interval);
    };
  }, [banners.length]);

  // Charger les bannières au montage (une seule fois)
  useEffect(() => {
    if (!hasFetched) {
      console.log('🚀 Hook mounted, fetching banners');
      fetchBanners();
    }
  }, [fetchBanners, hasFetched]);

  // Bannière actuelle
  const currentBanner = banners[currentBannerIndex] || null;

  // Enregistrer automatiquement l'impression quand une nouvelle bannière est affichée
  useEffect(() => {
    if (currentBanner) {
      console.log('👀 New banner displayed:', currentBanner.id, currentBanner.title);
      trackImpression(currentBanner.id);
    }
  }, [currentBanner, trackImpression]);

  console.log('📤 Hook returning:', {
    banners: banners.length,
    currentBanner: currentBanner?.id,
    currentBannerTitle: currentBanner?.title,
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

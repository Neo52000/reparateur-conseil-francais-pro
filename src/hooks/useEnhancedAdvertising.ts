
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdBanner, AdPlacement } from '@/types/advertising';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  subscription_tier?: string;
  user_type?: 'client' | 'repairer';
  city?: string;
  postal_code?: string;
  device_preferences?: string[];
}

export const useEnhancedAdvertising = (placement: AdPlacement, userProfile?: UserProfile) => {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  console.log('🔥 useEnhancedAdvertising - Hook initialized for placement:', placement, 'with profile:', userProfile);

  // Fonction de scoring pour le ciblage
  const calculateTargetingScore = useCallback((banner: AdBanner, profile?: UserProfile): number => {
    let score = 0;
    const targeting = banner.targeting_config as any;

    // Si ciblage global, score de base
    if (targeting.global) {
      return 50;
    }

    if (!profile) {
      return 10; // Score faible sans profil
    }

    // Correspondance type d'utilisateur
    if (targeting.user_types && profile.user_type) {
      if (targeting.user_types.includes(profile.user_type)) {
        score += 30;
      } else {
        return 0; // Exclusion si type ne correspond pas
      }
    }

    // Correspondance niveau d'abonnement
    if (targeting.subscription_tiers && profile.subscription_tier) {
      if (targeting.subscription_tiers.includes(profile.subscription_tier)) {
        score += 20;
      }
    }

    // Correspondance géographique
    if (targeting.cities && profile.city) {
      if (targeting.cities.some((city: string) => 
        city.toLowerCase().includes(profile.city!.toLowerCase()) ||
        profile.city!.toLowerCase().includes(city.toLowerCase())
      )) {
        score += 15;
      }
    }

    if (targeting.postal_codes && profile.postal_code) {
      if (targeting.postal_codes.includes(profile.postal_code)) {
        score += 15;
      }
    }

    // Correspondance appareils
    if (targeting.device_types && profile.device_preferences) {
      const matchingDevices = targeting.device_types.filter((device: string) =>
        profile.device_preferences!.some(pref => 
          pref.toLowerCase().includes(device.toLowerCase()) ||
          device.toLowerCase().includes(pref.toLowerCase())
        )
      );
      score += matchingDevices.length * 10;
    }

    return score;
  }, []);

  // Récupérer les bannières ciblées
  const fetchTargetedBanners = useCallback(async () => {
    try {
      console.log('🔍 Fetching targeted banners for placement:', placement);
      setLoading(true);
      
      // Récupérer toutes les bannières actives
      const { data: rawBanners, error } = await supabase
        .from('ad_banners')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error fetching banners:', error);
        setBanners([]);
        return;
      }

      if (!rawBanners || rawBanners.length === 0) {
        console.log('⚠️ No banners found in database');
        setBanners([]);
        return;
      }

      console.log('✅ Found banners:', rawBanners.length);

      // Typer les bannières
      const typedBanners = rawBanners.map(banner => ({
        ...banner,
        target_type: banner.target_type as 'client' | 'repairer'
      })) as AdBanner[];

      // Construire le profil utilisateur effectif avec subscription_tier par défaut
      const effectiveProfile: UserProfile = {
        ...userProfile,
        user_type: userProfile?.user_type || (placement === 'repairer_dashboard' ? 'repairer' : 'client'),
        subscription_tier: userProfile?.subscription_tier || 'free' // Valeur par défaut
      };

      console.log('👤 Effective user profile for targeting:', effectiveProfile);

      // Scorer et filtrer les bannières
      const scoredBanners = typedBanners
        .map(banner => ({
          banner,
          score: calculateTargetingScore(banner, effectiveProfile)
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ banner }) => banner);

      console.log('🎯 Scored and filtered banners:', {
        total: typedBanners.length,
        targeted: scoredBanners.length,
        topScores: scoredBanners.slice(0, 3).map(b => ({
          title: b.title,
          score: calculateTargetingScore(b, effectiveProfile)
        }))
      });

      setBanners(scoredBanners);
    } catch (error) {
      console.error('💥 Exception in fetchTargetedBanners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, [placement, userProfile, calculateTargetingScore]);

  // Enregistrer une impression
  const trackImpression = useCallback(async (bannerId: string) => {
    try {
      console.log('👁️ Tracking targeted impression for banner:', bannerId);
      
      const { error: rpcError } = await supabase.rpc('increment_impressions', { banner_id: bannerId });
      if (rpcError) {
        console.error('❌ Error incrementing impressions:', rpcError);
      }

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
        console.log('✅ Targeted impression tracked successfully');
      }

      if (insertError) {
        console.error('❌ Error inserting impression:', insertError);
      } else {
        console.log('✅ Targeted impression tracked successfully');
      }
    } catch (error) {
      console.error('💥 Error tracking impression:', error);
    }
  }, [user?.id, placement]);

  // Enregistrer un clic
  const trackClick = useCallback(async (bannerId: string) => {
    try {
      console.log('🖱️ Tracking targeted click for banner:', bannerId);
      
      const { error: rpcError } = await supabase.rpc('increment_clicks', { banner_id: bannerId });
      if (rpcError) {
        console.error('❌ Error incrementing clicks:', rpcError);
      }

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
        console.log('✅ Targeted click tracked successfully');
      }

      if (insertError) {
        console.error('❌ Error inserting click:', insertError);
      } else {
        console.log('✅ Targeted click tracked successfully');
      }
    } catch (error) {
      console.error('💥 Error tracking click:', error);
    }
  }, [user?.id, placement]);

  // Rotation automatique intelligente (plus lente pour les bannières ciblées)
  useEffect(() => {
    if (banners.length <= 1) return;

    console.log('🔄 Setting up intelligent banner rotation for', banners.length, 'targeted banners');
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => {
        const newIndex = (prev + 1) % banners.length;
        console.log('🎠 Rotating to targeted banner index:', newIndex);
        return newIndex;
      });
    }, 15000); // 15 secondes pour les bannières ciblées

    return () => {
      console.log('🧹 Cleaning up targeted banner rotation');
      clearInterval(interval);
    };
  }, [banners.length]);

  // Charger les bannières au montage
  useEffect(() => {
    console.log('🚀 Enhanced hook mounted, fetching targeted banners');
    fetchTargetedBanners();
  }, [fetchTargetedBanners]);

  // Bannière actuelle
  const currentBanner = banners[currentBannerIndex] || null;

  // Enregistrer automatiquement l'impression
  useEffect(() => {
    if (currentBanner) {
      console.log('👀 New targeted banner displayed:', currentBanner.id, currentBanner.title);
      trackImpression(currentBanner.id);
    }
  }, [currentBanner, trackImpression]);

  console.log('📤 Enhanced hook returning:', {
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
    refreshBanners: fetchTargetedBanners
  };
};

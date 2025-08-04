import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePlanPreview } from '@/hooks/usePlanPreview';

export interface FeatureAccess {
  hasAccess: boolean;
  featureLimit?: number;
  reason?: string;
}

export const useFeatureAccess = () => {
  const { user } = useAuth();
  const { activeTier } = usePlanPreview(); // Utilise le tier actif (preview ou réel)
  const [planFeatures, setPlanFeatures] = useState<Record<string, { enabled: boolean; limit?: number }>>({});
  const [loading, setLoading] = useState(true);

  // Charger les fonctionnalités disponibles pour le tier actif
  useEffect(() => {
    const loadPlanFeatures = async () => {
      if (!user?.id || !activeTier) {
        setLoading(false);
        return;
      }

      try {
        // Mapper les tiers aux noms de plans dans la base
        const tierToPlanName = {
          'free': 'Gratuit',
          'basic': 'Visibilité',
          'premium': 'Pro',
          'enterprise': 'Premium'
        };

        const planName = tierToPlanName[activeTier as keyof typeof tierToPlanName] || 'Gratuit';

        // Récupérer les fonctionnalités disponibles pour ce plan
        const { data: features, error: featuresError } = await supabase
          .from('feature_flags_by_plan')
          .select('feature_key, enabled')
          .eq('plan_name', planName);

        if (featuresError) {
          console.error('Error loading plan features:', featuresError);
        } else {
          const featuresMap = features?.reduce((acc, feature) => {
            acc[feature.feature_key] = {
              enabled: feature.enabled,
              limit: undefined // feature_flags_by_plan doesn't have limits
            };
            return acc;
          }, {} as Record<string, { enabled: boolean; limit?: number }>) || {};

          setPlanFeatures(featuresMap);
        }
      } catch (error) {
        console.error('Error loading plan features:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlanFeatures();
  }, [user?.id, activeTier]);

  // Vérifier l'accès à une fonctionnalité
  const checkFeatureAccess = (featureKey: string): FeatureAccess => {
    if (loading) {
      return { hasAccess: false, reason: 'Chargement en cours...' };
    }

    const feature = planFeatures[featureKey];
    
    if (!feature) {
      return { 
        hasAccess: false, 
        reason: `Fonctionnalité non disponible dans le plan ${activeTier}` 
      };
    }

    if (!feature.enabled) {
      return { 
        hasAccess: false, 
        reason: `Fonctionnalité désactivée dans le plan ${activeTier}` 
      };
    }

    return { 
      hasAccess: true, 
      featureLimit: feature.limit 
    };
  };

  // Vérifier l'accès à un module (POS, E-commerce)
  const checkModuleAccess = (moduleType: 'pos' | 'ecommerce'): FeatureAccess => {
    const moduleFeatureKey = `${moduleType}_system_enabled`;
    return checkFeatureAccess(moduleFeatureKey);
  };

  // Vérifier si l'utilisateur peut dépasser une limite
  const checkFeatureLimit = (featureKey: string, currentUsage: number): FeatureAccess => {
    const baseAccess = checkFeatureAccess(featureKey);
    
    if (!baseAccess.hasAccess) {
      return baseAccess;
    }

    if (baseAccess.featureLimit !== undefined && baseAccess.featureLimit !== null) {
      if (currentUsage >= baseAccess.featureLimit) {
        return {
          hasAccess: false,
          featureLimit: baseAccess.featureLimit,
          reason: `Limite atteinte (${currentUsage}/${baseAccess.featureLimit}). Passez à un plan supérieur.`
        };
      }
    }

    return {
      hasAccess: true,
      featureLimit: baseAccess.featureLimit
    };
  };

  // Obtenir la liste des fonctionnalités disponibles pour le plan actuel
  const getAvailableFeatures = () => {
    return Object.keys(planFeatures).filter(key => planFeatures[key].enabled);
  };

  // Obtenir des suggestions de mise à niveau
  const getUpgradeSuggestions = (featureKey: string) => {
    const suggestions = {
      'free': 'basic',
      'basic': 'premium',
      'premium': 'enterprise'
    };

    return suggestions[activeTier as keyof typeof suggestions] || null;
  };

  return {
    activeTier,
    planFeatures,
    loading,
    checkFeatureAccess,
    checkModuleAccess,
    checkFeatureLimit,
    getAvailableFeatures,
    getUpgradeSuggestions
  };
};

// Hook pour vérifier une fonctionnalité spécifique
export const useFeature = (featureKey: string) => {
  const { checkFeatureAccess, loading } = useFeatureAccess();
  const [access, setAccess] = useState<FeatureAccess>({ hasAccess: false });

  useEffect(() => {
    if (!loading) {
      setAccess(checkFeatureAccess(featureKey));
    }
  }, [featureKey, loading, checkFeatureAccess]);

  return { ...access, loading };
};

// Hook pour vérifier l'accès à un module
export const useModuleAccess = (moduleType: 'pos' | 'ecommerce') => {
  const { checkModuleAccess, loading } = useFeatureAccess();
  const [access, setAccess] = useState<FeatureAccess>({ hasAccess: false });

  useEffect(() => {
    if (!loading) {
      setAccess(checkModuleAccess(moduleType));
    }
  }, [moduleType, loading, checkModuleAccess]);

  return { ...access, loading };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FeatureAccess {
  hasAccess: boolean;
  featureLimit?: number;
  reason?: string;
}

export const useFeatureAccess = () => {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<string>('Gratuit');
  const [planFeatures, setPlanFeatures] = useState<Record<string, { enabled: boolean; limit?: number }>>({});
  const [loading, setLoading] = useState(true);

  // Charger le plan de l'utilisateur et les fonctionnalités disponibles
  useEffect(() => {
    const loadUserPlanAndFeatures = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Récupérer l'abonnement de l'utilisateur
        const { data: subscription, error: subError } = await supabase
          .from('repairer_subscriptions')
          .select('subscription_tier')
          .eq('user_id', user.id)
          .single();

        if (subError && subError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading user subscription:', subError);
        }

        const currentPlan = subscription?.subscription_tier || 'Gratuit';
        const planName = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
        setUserPlan(planName);

        // Récupérer les fonctionnalités disponibles pour ce plan
        const { data: features, error: featuresError } = await supabase
          .from('plan_features')
          .select(`
            feature_key,
            enabled,
            feature_limit,
            available_features (
              feature_key,
              feature_name,
              category
            )
          `)
          .eq('plan_name', planName)
          .eq('enabled', true);

        if (featuresError) {
          console.error('Error loading plan features:', featuresError);
        } else {
          const featuresMap = features.reduce((acc, feature) => {
            acc[feature.feature_key] = {
              enabled: feature.enabled,
              limit: feature.feature_limit
            };
            return acc;
          }, {} as Record<string, { enabled: boolean; limit?: number }>);

          setPlanFeatures(featuresMap);
        }
      } catch (error) {
        console.error('Error loading user plan and features:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserPlanAndFeatures();
  }, [user?.id]);

  // Vérifier l'accès à une fonctionnalité
  const checkFeatureAccess = (featureKey: string): FeatureAccess => {
    if (loading) {
      return { hasAccess: false, reason: 'Chargement en cours...' };
    }

    const feature = planFeatures[featureKey];
    
    if (!feature) {
      return { 
        hasAccess: false, 
        reason: `Fonctionnalité non disponible dans le plan ${userPlan}` 
      };
    }

    if (!feature.enabled) {
      return { 
        hasAccess: false, 
        reason: `Fonctionnalité désactivée dans le plan ${userPlan}` 
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
      'Gratuit': 'Basique',
      'Basique': 'Premium',
      'Premium': 'Enterprise'
    };

    return suggestions[userPlan as keyof typeof suggestions] || null;
  };

  return {
    userPlan,
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
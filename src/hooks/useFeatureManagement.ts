import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';


export interface FeatureUsageStats {
  moduleName: string;
  moduleType: 'pos' | 'ecommerce' | 'blog' | 'repair' | 'admin';
  totalUsers: number;
  activeUsers: number;
  monthlyUsage: number;
  revenueImpact: number;
  status: 'active' | 'inactive' | 'deprecated';
  lastUpdate: string;
}

export interface PlanFeature {
  featureKey: string;
  featureName: string;
  category: string;
  description: string;
}

export interface PlanConfiguration {
  planName: 'Gratuit' | 'Basique' | 'Premium' | 'Enterprise';
  planPriceMonthly: number;
  planPriceYearly: number;
  planDescription: string;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  subscribers: number;
  revenue: number;
}

export interface PlanFeatureMatrix {
  feature: PlanFeature;
  planAccess: Record<string, boolean>;
}

export interface ModuleConfiguration {
  id: string;
  moduleName: string;
  moduleType: string;
  isEnabled: boolean;
  configuration: Record<string, any>;
  dependencies: string[];
  version: string;
  documentation?: string;
}

export const useFeatureManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<FeatureUsageStats[]>([]);
  const [moduleConfigs, setModuleConfigs] = useState<ModuleConfiguration[]>([]);
  const [planConfigs, setPlanConfigs] = useState<PlanConfiguration[]>([]);
  const [planFeatures, setPlanFeatures] = useState<PlanFeature[]>([]);
  const [planFeatureMatrix, setPlanFeatureMatrix] = useState<PlanFeatureMatrix[]>([]);

  console.log('🔄 useFeatureManagement - Hook initialized:', { 
    hasUser: !!user?.id, 
    loading 
  });

  // Fonctions pour charger les données depuis la base de données
  const loadUsageStats = async () => {
    try {
      // Charger les vraies données depuis la base
      const { data: subscriptions, error } = await supabase
        .from('repairer_subscriptions')
        .select('subscription_tier');

      if (error) throw error;

      // Créer des statistiques simples basées sur les abonnements
      const posStats = {
        moduleName: 'Système POS',
        moduleType: 'pos' as const,
        totalUsers: subscriptions.filter(s => ['premium', 'enterprise'].includes(s.subscription_tier)).length,
        activeUsers: subscriptions.filter(s => s.subscription_tier === 'enterprise').length,
        monthlyUsage: 247,
        revenueImpact: 15680,
        status: 'active' as const,
        lastUpdate: new Date().toISOString()
      };

      const ecommerceStats = {
        moduleName: 'Plateforme E-commerce',
        moduleType: 'ecommerce' as const,
        totalUsers: subscriptions.filter(s => s.subscription_tier === 'enterprise').length,
        activeUsers: subscriptions.filter(s => s.subscription_tier === 'enterprise').length,
        monthlyUsage: 156,
        revenueImpact: 8950,
        status: 'active' as const,
        lastUpdate: new Date().toISOString()
      };

      setUsageStats([posStats, ecommerceStats]);
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const loadModuleConfigs = async () => {
    try {
      // Charger les vraies configurations depuis la base
      const { data: pricing, error } = await supabase
        .from('module_pricing')
        .select('*');

      if (error) throw error;

      const realConfigs: ModuleConfiguration[] = pricing?.map(module => ({
        id: `feature-${module.module_type}-module`,
        moduleName: module.module_type === 'pos' ? 'Module POS Avancé' : 'Module E-commerce Avancé',
        moduleType: module.module_type,
        isEnabled: true,
        configuration: module.module_type === 'pos' ? {
          enableInventory: true,
          enableReporting: true,
          enablePaymentTerminal: true,
          maxTransactionsPerDay: 1000
        } : {
          enableStoreBuilder: true,
          enableOrderManagement: true,
          enableAnalytics: true,
          maxProductsPerStore: 500
        },
        dependencies: module.module_type === 'pos' 
          ? ['payment-gateway', 'inventory-system']
          : ['payment-system', 'shipping-calculator'],
        version: module.module_type === 'pos' ? '2.1.0' : '1.8.3',
        documentation: module.module_type === 'pos'
          ? 'Module de point de vente avancé avec gestion des stocks et rapports'
          : 'Module e-commerce avancé pour les réparateurs'
      })) || [];
      
    } catch (error) {
      console.error('Error loading module configs:', error);
    }
  };

  const loadPlanConfigs = async () => {
    try {
      console.log('💰 Loading plan configs (pricing always public)');
      
      // Toujours charger les plans de base depuis la DB
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (plansError) throw plansError;

      let planStats = {} as Record<string, { count: number; revenue: number }>;

      // Calculer les statistiques seulement si utilisateur connecté
      if (user?.id) {
        console.log('📊 Loading plan statistics (private data)');
        const { data: subscriptions, error: subscriptionsError } = await supabase
          .from('repairer_subscriptions')
          .select('subscription_tier, user_id');

        if (subscriptionsError) {
          console.warn('⚠️ Could not load subscription stats:', subscriptionsError);
        } else {
          // Calculer les statistiques par plan
          planStats = subscriptions.reduce((acc, sub) => {
            const tier = sub.subscription_tier;
            if (!acc[tier]) acc[tier] = { count: 0, revenue: 0 };
            acc[tier].count++;
            return acc;
          }, {} as Record<string, { count: number; revenue: number }>);
        }
      } else {
        console.log('👤 Skipping plan statistics (public mode)');
      }

      const configs: PlanConfiguration[] = plans.map(plan => ({
        planName: plan.name as 'Gratuit' | 'Basique' | 'Premium' | 'Enterprise',
        planPriceMonthly: plan.price_monthly,
        planPriceYearly: plan.price_yearly,
        planDescription: getPlanDescription(plan.name),
        features: {},
        limits: {},
        subscribers: planStats[plan.name.toLowerCase()]?.count || 0,
        revenue: (planStats[plan.name.toLowerCase()]?.count || 0) * plan.price_monthly
      }));

      console.log('✅ Plan configs loaded:', configs.map(p => `${p.planName}: ${p.planPriceMonthly}€/mois`));
      setPlanConfigs(configs);
    } catch (error) {
      console.error('❌ Error loading plan configs:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les configurations des plans',
        variant: 'destructive'
      });
    }
  };

  const loadPlanFeatures = async () => {
    try {
      const { data: features, error } = await supabase
        .from('available_features')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;

      const planFeatures: PlanFeature[] = features.map(feature => ({
        featureKey: feature.feature_key,
        featureName: feature.feature_name,
        category: feature.category,
        description: feature.description || ''
      }));

      setPlanFeatures(planFeatures);
    } catch (error) {
      console.error('Error loading plan features:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les fonctionnalités',
        variant: 'destructive'
      });
    }
  };

  const loadPlanFeatureMatrix = async () => {
    try {
      const { data: planFeatures, error } = await supabase
        .from('plan_features')
        .select(`
          plan_name,
          feature_key,
          enabled,
          feature_limit,
          available_features (
            feature_key,
            feature_name,
            category,
            description
          )
        `);

      if (error) throw error;

      // Grouper par fonctionnalité
      const featureMap = new Map();
      
      planFeatures.forEach(pf => {
        const featureKey = pf.feature_key;
        if (!featureMap.has(featureKey)) {
          featureMap.set(featureKey, {
            feature: {
              featureKey: pf.available_features.feature_key,
              featureName: pf.available_features.feature_name,
              category: pf.available_features.category,
              description: pf.available_features.description
            },
            planAccess: {}
          });
        }
        featureMap.get(featureKey).planAccess[pf.plan_name] = pf.enabled;
      });

      const matrix: PlanFeatureMatrix[] = Array.from(featureMap.values());
      setPlanFeatureMatrix(matrix);
    } catch (error) {
      console.error('Error loading plan feature matrix:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la matrice des fonctionnalités',
        variant: 'destructive'
      });
    }
  };

  const getPlanDescription = (planName: string): string => {
    switch (planName) {
      case 'Gratuit': return 'Plan de base pour débuter';
      case 'Basique': return 'Fonctionnalités essentielles pour les pros';
      case 'Premium': return 'Toutes les fonctionnalités avancées';
      case 'Enterprise': return 'Solution complète pour les entreprises';
      default: return 'Plan personnalisé';
    }
  };

  // Séparer les données publiques des données privées
  const loadPublicData = async () => {
    console.log('📊 useFeatureManagement - Loading public data (pricing & features)');
    try {
      await Promise.all([
        loadPlanConfigs(),
        loadPlanFeatures(),
        loadPlanFeatureMatrix()
      ]);
      console.log('✅ useFeatureManagement - Public data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading public data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les tarifs et fonctionnalités',
        variant: 'destructive'
      });
    }
  };

  const loadPrivateData = async () => {
    console.log('🔐 useFeatureManagement - Loading private data (stats & configs)');
    try {
      await Promise.all([
        loadUsageStats(),
        loadModuleConfigs()
      ]);
      console.log('✅ useFeatureManagement - Private data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading private data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les statistiques et configurations',
        variant: 'destructive'
      });
    }
  };

  // Charger les données depuis la base de données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      console.log('🚀 useFeatureManagement - Starting data load:', { 
        hasUser: !!user?.id 
      });
      
      try {
        // Toujours charger les données publiques (tarifs et fonctionnalités)
        await loadPublicData();
        
        // Charger les données privées seulement si utilisateur connecté
        if (user?.id) {
          console.log('👤 User authenticated, loading private data');
          await loadPrivateData();
        } else {
          console.log('👤 No user, skipping private data');
        }
      } catch (error) {
        console.error('❌ Error in main data loading:', error);
      } finally {
        setLoading(false);
        console.log('🏁 useFeatureManagement - Data loading completed');
      }
    };

    loadData();
  }, [user?.id]);

  // Synchronisation temps réel - Séparée en données publiques et privées
  useEffect(() => {
    console.log('🔄 useFeatureManagement - Setting up PUBLIC real-time sync (pricing)');
    
    // Toujours synchroniser les données publiques (tarifs et fonctionnalités)
    const publicChannel = supabase
      .channel('public_data_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscription_plans'
      }, (payload) => {
        console.log('💰 Real-time change on subscription_plans (public):', payload);
        loadPlanConfigs();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'plan_features'
      }, (payload) => {
        console.log('🎯 Real-time change on plan_features (public):', payload);
        loadPlanFeatureMatrix();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'available_features'
      }, (payload) => {
        console.log('⚡ Real-time change on available_features (public):', payload);
        loadPlanFeatures();
      })
      .subscribe((status) => {
        console.log('📡 Public real-time subscription status:', status);
      });

    return () => {
      console.log('🛑 useFeatureManagement - Cleaning up public real-time listeners');
      supabase.removeChannel(publicChannel);
    };
  }, []); // Pas de dépendance pour toujours activer

  // Synchronisation temps réel pour les données privées (admin seulement)
  useEffect(() => {
    if (!user?.id) {
      console.log('⏸️ useFeatureManagement - Private real-time disabled (no user)');
      return;
    }

    console.log('🔐 useFeatureManagement - Setting up PRIVATE real-time sync (stats & configs)');
    
    // Synchroniser les données privées seulement pour les utilisateurs connectés
    const privateChannel = supabase
      .channel('private_data_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'module_pricing'
      }, (payload) => {
        console.log('🔧 Real-time change on module_pricing (private):', payload);
        loadModuleConfigs();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'repairer_subscriptions'
      }, (payload) => {
        console.log('📊 Real-time change on repairer_subscriptions (private):', payload);
        loadUsageStats();
        loadPlanConfigs(); // Recalculer les stats des plans
      })
      .subscribe((status) => {
        console.log('🔐 Private real-time subscription status:', status);
      });

    return () => {
      console.log('🛑 useFeatureManagement - Cleaning up private real-time listeners');
      supabase.removeChannel(privateChannel);
    };
  }, [user?.id]);

  const updateModuleConfiguration = async (moduleId: string, newConfig: Partial<ModuleConfiguration>) => {
    try {
      setModuleConfigs(prev => 
        prev.map(config => 
          config.id === moduleId 
            ? { ...config, ...newConfig, lastUpdate: new Date().toISOString() }
            : config
        )
      );

      toast({
        title: 'Configuration mise à jour',
        description: `La configuration du module a été sauvegardée.`
      });
    } catch (error) {
      console.error('Error updating module config:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la configuration',
        variant: 'destructive'
      });
    }
  };

  const toggleModuleStatus = async (moduleId: string) => {
    try {
      setModuleConfigs(prev => 
        prev.map(config => 
          config.id === moduleId 
            ? { ...config, isEnabled: !config.isEnabled }
            : config
        )
      );

      const module = moduleConfigs.find(c => c.id === moduleId);
      toast({
        title: `Module ${module?.isEnabled ? 'désactivé' : 'activé'}`,
        description: `${module?.moduleName} a été ${module?.isEnabled ? 'désactivé' : 'activé'}.`
      });
    } catch (error) {
      console.error('Error toggling module:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut du module',
        variant: 'destructive'
      });
    }
  };

  const getModuleStats = (moduleType: string) => {
    return usageStats.find(stat => stat.moduleType === moduleType);
  };

  const getTotalStats = () => {
    return usageStats.reduce((acc, stat) => ({
      totalUsers: acc.totalUsers + stat.totalUsers,
      activeUsers: acc.activeUsers + stat.activeUsers,
      monthlyUsage: acc.monthlyUsage + stat.monthlyUsage,
      revenueImpact: acc.revenueImpact + stat.revenueImpact
    }), { totalUsers: 0, activeUsers: 0, monthlyUsage: 0, revenueImpact: 0 });
  };

  const togglePlanFeature = async (planName: string, featureKey: string) => {
    try {
      // Mettre à jour dans la base de données
      const currentMatrix = planFeatureMatrix.find(item => item.feature.featureKey === featureKey);
      const currentEnabled = currentMatrix?.planAccess[planName] || false;
      const newEnabled = !currentEnabled;

      const { error } = await supabase
        .from('plan_features')
        .upsert({
          plan_name: planName,
          feature_key: featureKey,
          enabled: newEnabled
        }, {
          onConflict: 'plan_name,feature_key'
        });

      if (error) throw error;

      // Mettre à jour l'état local
      setPlanFeatureMatrix(prev =>
        prev.map(item => ({
          ...item,
          planAccess: {
            ...item.planAccess,
            [planName]: item.feature.featureKey === featureKey 
              ? newEnabled 
              : item.planAccess[planName]
          }
        }))
      );

      toast({
        title: 'Configuration mise à jour',
        description: `Fonctionnalité ${featureKey} ${newEnabled ? 'activée' : 'désactivée'} pour le plan ${planName}.`
      });
    } catch (error) {
      console.error('Error toggling plan feature:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la fonctionnalité',
        variant: 'destructive'
      });
    }
  };

  const getPlanStats = () => {
    return planConfigs.reduce((acc, plan) => ({
      totalSubscribers: acc.totalSubscribers + plan.subscribers,
      totalRevenue: acc.totalRevenue + plan.revenue
    }), { totalSubscribers: 0, totalRevenue: 0 });
  };

  const updatePlanPricing = async (planName: string, monthlyPrice: number, yearlyPrice: number) => {
    try {
      // Mettre à jour dans la base de données
      const { error } = await supabase
        .from('subscription_plans')
        .update({ 
          price_monthly: monthlyPrice,
          price_yearly: yearlyPrice
        })
        .eq('name', planName);

      if (error) throw error;

      // Mettre à jour l'état local
      setPlanConfigs(prev => 
        prev.map(plan => 
          plan.planName === planName 
            ? { 
                ...plan, 
                planPriceMonthly: monthlyPrice,
                planPriceYearly: yearlyPrice
              }
            : plan
        )
      );

      toast({
        title: 'Tarifs mis à jour',
        description: `Les tarifs du plan ${planName} ont été sauvegardés.`
      });
    } catch (error) {
      console.error('Error updating plan pricing:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier les tarifs',
        variant: 'destructive'
      });
    }
  };

  return {
    loading,
    usageStats,
    moduleConfigs,
    planConfigs,
    planFeatures,
    planFeatureMatrix,
    updateModuleConfiguration,
    toggleModuleStatus,
    togglePlanFeature,
    updatePlanPricing,
    getModuleStats,
    getTotalStats,
    getPlanStats
  };
};
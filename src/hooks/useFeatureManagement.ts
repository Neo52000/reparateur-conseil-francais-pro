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

  // Données mockées pour la démonstration
  const mockUsageStats: FeatureUsageStats[] = [
    {
      moduleName: 'Système POS',
      moduleType: 'pos',
      totalUsers: 15,
      activeUsers: 12,
      monthlyUsage: 1250,
      revenueImpact: 7480,
      status: 'active',
      lastUpdate: '2024-01-07T10:30:00Z'
    },
    {
      moduleName: 'E-commerce',
      moduleType: 'ecommerce',
      totalUsers: 8,
      activeUsers: 6,
      monthlyUsage: 680,
      revenueImpact: 5340,
      status: 'active',
      lastUpdate: '2024-01-06T15:20:00Z'
    },
    {
      moduleName: 'Blog & Content',
      moduleType: 'blog',
      totalUsers: 25,
      activeUsers: 18,
      monthlyUsage: 320,
      revenueImpact: 0,
      status: 'active',
      lastUpdate: '2024-01-05T09:15:00Z'
    },
    {
      moduleName: 'Gestion Réparations',
      moduleType: 'repair',
      totalUsers: 142,
      activeUsers: 89,
      monthlyUsage: 2890,
      revenueImpact: 0,
      status: 'active',
      lastUpdate: '2024-01-07T14:45:00Z'
    }
  ];

  const mockModuleConfigs: ModuleConfiguration[] = [
    {
      id: 'pos-system',
      moduleName: 'Système POS',
      moduleType: 'pos',
      isEnabled: true,
      configuration: {
        enableInventory: true,
        enableReporting: true,
        enablePaymentTerminal: true,
        maxTransactionsPerDay: 1000
      },
      dependencies: ['payment-gateway', 'inventory-system'],
      version: '2.1.0',
      documentation: 'Système de point de vente complet avec gestion des stocks et rapports'
    },
    {
      id: 'ecommerce-platform',
      moduleName: 'Plateforme E-commerce',
      moduleType: 'ecommerce',
      isEnabled: true,
      configuration: {
        enableStoreBuilder: true,
        enableOrderManagement: true,
        enableAnalytics: true,
        maxProductsPerStore: 500
      },
      dependencies: ['payment-system', 'shipping-calculator'],
      version: '1.8.3',
      documentation: 'Plateforme e-commerce complète pour les réparateurs'
    },
    {
      id: 'blog-cms',
      moduleName: 'CMS Blog',
      moduleType: 'blog',
      isEnabled: true,
      configuration: {
        enableAIGeneration: true,
        enableScheduling: true,
        enableComments: true,
        maxPostsPerMonth: 50
      },
      dependencies: ['ai-service', 'seo-tools'],
      version: '1.5.2',
      documentation: 'Système de gestion de contenu avec génération IA'
    },
    {
      id: 'repair-management',
      moduleName: 'Gestion des Réparations',
      moduleType: 'repair',
      isEnabled: true,
      configuration: {
        enableDeviceIntake: true,
        enableStatusTracking: true,
        enableCustomerNotifications: true,
        maxActiveRepairs: 100
      },
      dependencies: ['notification-system'],
      version: '3.0.1',
      documentation: 'Système complet de gestion des réparations et suivi client'
    }
  ];

  const mockPlanConfigs: PlanConfiguration[] = [
    {
      planName: 'Gratuit',
      planPriceMonthly: 0,
      planPriceYearly: 0,
      planDescription: 'Plan de base pour débuter',
      features: {
        'basic-profile': true,
        'basic-search': true,
        'email-support': true,
        'pos-basic': false,
        'ecommerce': false,
        'blog-advanced': false,
        'analytics': false
      },
      limits: {
        'max-repairs': 10,
        'max-photos': 5,
        'storage-mb': 100
      },
      subscribers: 125,
      revenue: 0
    },
    {
      planName: 'Basique',
      planPriceMonthly: 29,
      planPriceYearly: 290,
      planDescription: 'Fonctionnalités essentielles pour les pros',
      features: {
        'basic-profile': true,
        'basic-search': true,
        'email-support': true,
        'pos-basic': true,
        'ecommerce': false,
        'blog-advanced': false,
        'analytics': true
      },
      limits: {
        'max-repairs': 50,
        'max-photos': 20,
        'storage-mb': 500
      },
      subscribers: 67,
      revenue: 1943
    },
    {
      planName: 'Premium',
      planPriceMonthly: 59,
      planPriceYearly: 590,
      planDescription: 'Toutes les fonctionnalités avancées',
      features: {
        'basic-profile': true,
        'basic-search': true,
        'email-support': true,
        'pos-basic': true,
        'pos-advanced': true,
        'ecommerce': true,
        'blog-advanced': true,
        'analytics': true,
        'priority-support': true
      },
      limits: {
        'max-repairs': 200,
        'max-photos': 100,
        'storage-mb': 2000
      },
      subscribers: 43,
      revenue: 2537
    },
    {
      planName: 'Enterprise',
      planPriceMonthly: 149,
      planPriceYearly: 1490,
      planDescription: 'Solution complète pour les entreprises',
      features: {
        'basic-profile': true,
        'basic-search': true,
        'email-support': true,
        'pos-basic': true,
        'pos-advanced': true,
        'pos-enterprise': true,
        'ecommerce': true,
        'ecommerce-advanced': true,
        'blog-advanced': true,
        'analytics': true,
        'priority-support': true,
        'api-access': true,
        'white-label': true
      },
      limits: {
        'max-repairs': -1, // Illimité
        'max-photos': -1,
        'storage-mb': -1
      },
      subscribers: 18,
      revenue: 2682
    }
  ];

  const mockPlanFeatures: PlanFeature[] = [
    {
      featureKey: 'basic-profile',
      featureName: 'Profil de base',
      category: 'Profil',
      description: 'Création et gestion du profil réparateur'
    },
    {
      featureKey: 'basic-search',
      featureName: 'Recherche de base',
      category: 'Recherche',
      description: 'Apparition dans les résultats de recherche'
    },
    {
      featureKey: 'email-support',
      featureName: 'Support email',
      category: 'Support',
      description: 'Assistance par email'
    },
    {
      featureKey: 'pos-basic',
      featureName: 'POS basique',
      category: 'POS',
      description: 'Système de caisse basique'
    },
    {
      featureKey: 'pos-advanced',
      featureName: 'POS avancé',
      category: 'POS',
      description: 'Fonctionnalités POS avancées'
    },
    {
      featureKey: 'pos-enterprise',
      featureName: 'POS entreprise',
      category: 'POS',
      description: 'Suite POS complète avec multi-boutiques'
    },
    {
      featureKey: 'ecommerce',
      featureName: 'E-commerce basique',
      category: 'E-commerce',
      description: 'Boutique en ligne basique'
    },
    {
      featureKey: 'ecommerce-advanced',
      featureName: 'E-commerce avancé',
      category: 'E-commerce',
      description: 'Fonctionnalités e-commerce avancées'
    },
    {
      featureKey: 'blog-advanced',
      featureName: 'Blog & Content',
      category: 'Marketing',
      description: 'Système de blog avec génération IA'
    },
    {
      featureKey: 'analytics',
      featureName: 'Analytics',
      category: 'Analytics',
      description: 'Statistiques et analyses avancées'
    },
    {
      featureKey: 'priority-support',
      featureName: 'Support prioritaire',
      category: 'Support',
      description: 'Support prioritaire avec chat'
    },
    {
      featureKey: 'api-access',
      featureName: 'Accès API',
      category: 'Développement',
      description: 'Accès aux APIs pour intégrations'
    },
    {
      featureKey: 'white-label',
      featureName: 'Marque blanche',
      category: 'Branding',
      description: 'Solution en marque blanche'
    }
  ];

  // Simuler le chargement des données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsageStats(mockUsageStats);
        setModuleConfigs(mockModuleConfigs);
        setPlanConfigs(mockPlanConfigs);
        setPlanFeatures(mockPlanFeatures);
        
        // Build plan-feature matrix
        const matrix = mockPlanFeatures.map(feature => ({
          feature,
          planAccess: mockPlanConfigs.reduce((acc, plan) => ({
            ...acc,
            [plan.planName]: plan.features[feature.featureKey] || false
          }), {} as Record<string, boolean>)
        }));
        setPlanFeatureMatrix(matrix);
      } catch (error) {
        console.error('Error loading feature management data:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données des fonctionnalités',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id, toast]);

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
      setPlanConfigs(prev => 
        prev.map(plan => 
          plan.planName === planName 
            ? { 
                ...plan, 
                features: {
                  ...plan.features,
                  [featureKey]: !plan.features[featureKey]
                }
              }
            : plan
        )
      );

      // Update matrix
      setPlanFeatureMatrix(prev =>
        prev.map(item => ({
          ...item,
          planAccess: {
            ...item.planAccess,
            [planName]: item.feature.featureKey === featureKey 
              ? !item.planAccess[planName] 
              : item.planAccess[planName]
          }
        }))
      );

      toast({
        title: 'Configuration mise à jour',
        description: `Fonctionnalité ${featureKey} mise à jour pour le plan ${planName}.`
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
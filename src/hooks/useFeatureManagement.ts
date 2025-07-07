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

  // Simuler le chargement des données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsageStats(mockUsageStats);
        setModuleConfigs(mockModuleConfigs);
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

  return {
    loading,
    usageStats,
    moduleConfigs,
    updateModuleConfiguration,
    toggleModuleStatus,
    getModuleStats,
    getTotalStats
  };
};
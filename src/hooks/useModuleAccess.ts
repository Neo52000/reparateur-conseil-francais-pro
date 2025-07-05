import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ModuleSubscription {
  id: string;
  module_type: 'pos' | 'ecommerce';
  module_active: boolean;
  module_price: number;
  billing_cycle: 'monthly' | 'yearly';
  activated_at: string | null;
  expires_at: string | null;
  payment_status: 'pending' | 'active' | 'past_due' | 'cancelled';
}

/**
 * Hook pour gérer l'accès aux modules POS et E-commerce
 */
export const useModuleAccess = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<ModuleSubscription[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Charger les modules souscrits par le réparateur
   */
  const loadModules = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('module_subscriptions')
        .select('*')
        .eq('repairer_id', user.id);

      if (error) {
        console.error('Erreur chargement modules:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les modules",
          variant: "destructive"
        });
        return;
      }

      // Filtrer et typer correctement les données
      const typedModules = (data || [])
        .filter(item => ['pos', 'ecommerce'].includes(item.module_type))
        .map(item => ({
          ...item,
          module_type: item.module_type as 'pos' | 'ecommerce',
          billing_cycle: item.billing_cycle as 'monthly' | 'yearly',
          payment_status: item.payment_status as 'pending' | 'active' | 'past_due' | 'cancelled'
        }));
      
      setModules(typedModules);
    } catch (error) {
      console.error('Exception chargement modules:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vérifier si un module spécifique est actif
   */
  const hasModuleAccess = (moduleType: 'pos' | 'ecommerce'): boolean => {
    // En mode démo, activer automatiquement tous les modules
    if (user?.email === 'demo@demo.fr') {
      return true;
    }
    
    const module = modules.find(m => 
      m.module_type === moduleType && 
      m.module_active && 
      m.payment_status === 'active'
    );
    return !!module;
  };

  /**
   * Obtenir les détails d'un module
   */
  const getModuleDetails = (moduleType: 'pos' | 'ecommerce'): ModuleSubscription | null => {
    return modules.find(m => m.module_type === moduleType) || null;
  };

  /**
   * Activer un module (création d'abonnement)
   */
  const activateModule = async (
    moduleType: 'pos' | 'ecommerce',
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ) => {
    if (!user?.id) return false;

    const prices = {
      pos: { monthly: 49.90, yearly: 499.00 },
      ecommerce: { monthly: 89.00, yearly: 890.00 }
    };

    try {
      const { error } = await supabase
        .from('module_subscriptions')
        .insert([{
          repairer_id: user.id,
          module_type: moduleType,
          billing_cycle: billingCycle,
          module_price: prices[moduleType][billingCycle],
          module_active: true,
          activated_at: new Date().toISOString(),
          payment_status: 'active'
        }]);

      if (error) {
        console.error('Erreur activation module:', error);
        toast({
          title: "Erreur",
          description: `Impossible d'activer le module ${moduleType}`,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Module activé",
        description: `Le module ${moduleType} a été activé avec succès`
      });

      // Déclencher la migration automatique des données
      await triggerDataMigration(moduleType);
      
      // Recharger les modules
      await loadModules();
      return true;

    } catch (error) {
      console.error('Exception activation module:', error);
      return false;
    }
  };

  /**
   * Déclencher la migration automatique des données
   */
  const triggerDataMigration = async (moduleType: 'pos' | 'ecommerce') => {
    if (!user?.id) return;

    try {
      // Créer les tâches de migration
      const migrationTypes = moduleType === 'pos' 
        ? ['appointments', 'repairs', 'inventory', 'customers']
        : ['products', 'customers'];

      for (const migrationType of migrationTypes) {
        await supabase
          .from('module_data_migrations')
          .insert([{
            repairer_id: user.id,
            module_type: moduleType,
            migration_type: migrationType,
            migration_status: 'pending'
          }]);
      }

      console.log(`Migration ${moduleType} déclenchée pour ${migrationTypes.length} types de données`);
    } catch (error) {
      console.error('Erreur déclenchement migration:', error);
    }
  };

  /**
   * Désactiver un module
   */
  const deactivateModule = async (moduleType: 'pos' | 'ecommerce') => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('module_subscriptions')
        .update({ 
          module_active: false,
          payment_status: 'cancelled'
        })
        .eq('repairer_id', user.id)
        .eq('module_type', moduleType);

      if (error) {
        console.error('Erreur désactivation module:', error);
        return false;
      }

      toast({
        title: "Module désactivé",
        description: `Le module ${moduleType} a été désactivé`
      });

      await loadModules();
      return true;

    } catch (error) {
      console.error('Exception désactivation module:', error);
      return false;
    }
  };

  // Charger les modules au montage
  useEffect(() => {
    if (user?.id) {
      loadModules();
    }
  }, [user?.id]);

  return {
    modules,
    loading,
    hasModuleAccess,
    getModuleDetails,
    activateModule,
    deactivateModule,
    loadModules
  };
};
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OPTIONAL_MODULES, OptionalModule } from '@/types/optionalModules';
import { useToast } from '@/components/ui/use-toast';

export interface ModuleConfiguration {
  id: string;
  module_id: string;
  is_active: boolean;
  pricing_monthly: number;
  pricing_yearly: number;
  available_plans: string[];
  created_at?: string;
  updated_at?: string;
}

export const useOptionalModules = () => {
  const [modules, setModules] = useState<OptionalModule[]>(OPTIONAL_MODULES);
  const [configurations, setConfigurations] = useState<ModuleConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Charger les configurations depuis la base de données
  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('optional_modules_config')
        .select('*');

      if (error) throw error;

      setConfigurations(data || []);
      
      // Mettre à jour les modules avec les configurations
      const updatedModules = OPTIONAL_MODULES.map(module => {
        const config = data?.find(c => c.module_id === module.id);
        if (config) {
          return {
            ...module,
            isActive: config.is_active,
            pricing: {
              monthly: config.pricing_monthly,
              yearly: config.pricing_yearly
            },
            availableForPlans: config.available_plans || module.availableForPlans
          };
        }
        return module;
      });
      
      setModules(updatedModules);
    } catch (error) {
      console.error('Erreur lors du chargement des configurations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les configurations des modules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder les configurations
  const saveConfigurations = async () => {
    try {
      setSaving(true);
      
      // Préparer les données à sauvegarder
      const configsToSave = modules.map(module => ({
        module_id: module.id,
        is_active: module.isActive,
        pricing_monthly: module.pricing.monthly,
        pricing_yearly: module.pricing.yearly,
        available_plans: module.availableForPlans
      }));

      // Utiliser upsert pour insérer ou mettre à jour
      const { error } = await supabase
        .from('optional_modules_config')
        .upsert(configsToSave, { 
          onConflict: 'module_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Configurations des modules sauvegardées avec succès",
      });

      // Recharger les configurations
      await loadConfigurations();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les configurations",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Basculer l'état actif d'un module
  const toggleModule = (moduleId: string, isActive: boolean) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId ? { ...module, isActive } : module
    ));
  };

  // Mettre à jour le pricing d'un module
  const updateModulePricing = (moduleId: string, pricing: { monthly: number; yearly: number }) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId ? { ...module, pricing } : module
    ));
  };

  // Mettre à jour les plans disponibles
  const updateAvailablePlans = (moduleId: string, plans: string[]) => {
    setModules(prev => prev.map(module => 
      module.id === moduleId ? { ...module, availableForPlans: plans } : module
    ));
  };

  // Obtenir les modules actifs pour un plan donné
  const getModulesForPlan = (planName: string): OptionalModule[] => {
    const planKey = planName.toLowerCase();
    return modules.filter(module => 
      module.isActive && module.availableForPlans.includes(planKey)
    );
  };

  // Vérifier si un module est disponible pour un plan
  const isModuleAvailableForPlan = (moduleId: string, planName: string): boolean => {
    const module = modules.find(m => m.id === moduleId);
    const planKey = planName.toLowerCase();
    return !!(module?.isActive && module.availableForPlans.includes(planKey));
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  return {
    modules,
    configurations,
    loading,
    saving,
    toggleModule,
    updateModulePricing,
    updateAvailablePlans,
    saveConfigurations,
    getModulesForPlan,
    isModuleAvailableForPlan,
    reload: loadConfigurations
  };
};
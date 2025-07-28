import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OPTIONAL_MODULES } from '@/types/optionalModules';

export interface OptionalModuleDB {
  id: string;
  module_id: string;
  module_name: string;
  description: string;
  icon: string;
  category: string;
  features: string[];
  color: string;
  is_active: boolean;
  pricing_monthly: number;
  pricing_yearly: number;
  available_plans: string[];
  created_at?: string;
  updated_at?: string;
}

export const useOptionalModulesDB = () => {
  const [modules, setModules] = useState<OptionalModuleDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Synchroniser les modules prédéfinis avec la base de données
  const syncPredefinedModules = async () => {
    for (const predefinedModule of OPTIONAL_MODULES) {
      const { data: existingModule } = await supabase
        .from('optional_modules_config')
        .select('id')
        .eq('module_id', predefinedModule.id)
        .single();

      if (!existingModule) {
        const moduleData = {
          module_id: predefinedModule.id,
          module_name: predefinedModule.name,
          description: predefinedModule.description,
          icon: predefinedModule.icon,
          category: predefinedModule.category,
          features: predefinedModule.features,
          color: predefinedModule.color,
          pricing_monthly: predefinedModule.pricing.monthly,
          pricing_yearly: predefinedModule.pricing.yearly,
          available_plans: predefinedModule.availableForPlans,
          is_active: predefinedModule.isActive
        };

        await supabase.from('optional_modules_config').insert(moduleData);
      }
    }
  };

  // Charger les modules depuis Supabase
  const loadModules = async () => {
    try {
      setLoading(true);
      
      // Synchroniser les modules prédéfinis avec la base de données
      await syncPredefinedModules();
      
      const { data, error } = await supabase
        .from('optional_modules_config')
        .select('*')
        .order('module_name');

      if (error) throw error;

      // Transformer les données pour s'assurer du bon format
      const transformedData = (data || []).map(item => ({
        ...item,
        // S'assurer que les features sont un array
        features: Array.isArray(item.features) ? item.features : 
                 typeof item.features === 'string' ? JSON.parse(item.features) : [],
        // S'assurer que les available_plans sont un array
        available_plans: Array.isArray(item.available_plans) ? item.available_plans :
                        typeof item.available_plans === 'string' ? JSON.parse(item.available_plans) : []
      }));

      setModules(transformedData);
    } catch (error) {
      console.error('Erreur lors du chargement des modules:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les modules optionnels",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un module
  const updateModule = async (moduleId: string, updates: Partial<OptionalModuleDB>) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('optional_modules_config')
        .update(updates)
        .eq('id', moduleId);

      if (error) throw error;
      
      await loadModules();
      toast({
        title: "Succès",
        description: "Module mis à jour avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le module",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Basculer l'état actif d'un module
  const toggleModule = async (moduleId: string, isActive: boolean) => {
    await updateModule(moduleId, { is_active: isActive });
  };

  // Mettre à jour le pricing d'un module
  const updateModulePricing = async (moduleId: string, pricing: { monthly: number; yearly: number }) => {
    await updateModule(moduleId, { 
      pricing_monthly: pricing.monthly,
      pricing_yearly: pricing.yearly 
    });
  };

  // Mettre à jour les plans disponibles
  const updateAvailablePlans = async (moduleId: string, plans: string[]) => {
    await updateModule(moduleId, { available_plans: plans });
  };

  // Obtenir les modules actifs pour un plan donné
  const getModulesForPlan = (planName: string): OptionalModuleDB[] => {
    const planKey = planName.toLowerCase();
    return modules.filter(module => 
      module.is_active && module.available_plans.includes(planKey)
    );
  };

  // Vérifier si un module est disponible pour un plan
  const isModuleAvailableForPlan = (moduleId: string, planName: string): boolean => {
    const module = modules.find(m => m.module_id === moduleId);
    const planKey = planName.toLowerCase();
    return !!(module?.is_active && module.available_plans.includes(planKey));
  };

  // Créer un nouveau module
  const createModule = async (moduleData: Omit<OptionalModuleDB, 'id'>) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('optional_modules_config')
        .insert([moduleData]);

      if (error) throw error;
      
      await loadModules();
      toast({
        title: "Succès",
        description: "Module créé avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le module",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Supprimer un module
  const deleteModule = async (moduleId: string) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('optional_modules_config')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;
      
      await loadModules();
      toast({
        title: "Succès",
        description: "Module supprimé avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le module",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  // Synchronisation manuelle des modules prédéfinis
  const syncModules = async () => {
    try {
      setSaving(true);
      await syncPredefinedModules();
      await loadModules();
      toast({
        title: "Succès",
        description: "Modules synchronisés avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de synchroniser les modules",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    modules,
    loading,
    saving,
    toggleModule,
    updateModulePricing,
    updateAvailablePlans,
    updateModule,
    createModule,
    deleteModule,
    getModulesForPlan,
    isModuleAvailableForPlan,
    syncModules,
    reload: loadModules
  };
};
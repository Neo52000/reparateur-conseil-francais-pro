
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FeatureFlag, PlanName } from "@/types/featureFlags";
import { PLANS, FEATURES } from "@/constants/features";

/**
 * Hook personnalisé pour gérer les feature flags
 * Centralise toute la logique métier liée aux fonctionnalités par plan
 */
export const useFeatureFlags = () => {
  const { toast } = useToast();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /**
   * Charge tous les feature flags depuis Supabase
   */
  const loadFeatureFlags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("feature_flags_by_plan")
        .select("*");

      if (error) {
        toast({ 
          title: "Erreur de chargement", 
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Filtrer et typer les données
      const validFlags = (data || [])
        .filter(flag => PLANS.includes(flag.plan_name as PlanName))
        .map(flag => ({
          ...flag,
          plan_name: flag.plan_name as PlanName
        }));

      setFlags(validFlags);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de charger les fonctionnalités",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Trouve un flag spécifique pour un plan et une fonctionnalité donnés
   */
  const getFlag = (plan: PlanName, featureKey: string): FeatureFlag | undefined => {
    return flags.find(f => f.plan_name === plan && f.feature_key === featureKey);
  };

  /**
   * Met à jour l'état local d'un flag (sans sauvegarder en base)
   */
  const handleToggleFlag = (plan: PlanName, featureKey: string, enabled: boolean) => {
    setFlags(currentFlags => {
      const existingFlag = currentFlags.find(f => 
        f.plan_name === plan && f.feature_key === featureKey
      );

      if (existingFlag) {
        // Mise à jour d'un flag existant
        return currentFlags.map(f =>
          f.plan_name === plan && f.feature_key === featureKey
            ? { ...f, enabled }
            : f
        );
      } else {
        // Création d'un nouveau flag local (sera créé en base lors de la sauvegarde)
        return [...currentFlags, {
          id: `temp-${Date.now()}`, // ID temporaire
          plan_name: plan,
          feature_key: featureKey,
          enabled
        }];
      }
    });
  };

  /**
   * Sauvegarde tous les changements en base de données
   */
  const handleSave = async () => {
    setSaving(true);
    let hasError = false;

    try {
      // Traiter chaque combinaison plan/fonctionnalité
      for (const plan of PLANS) {
        for (const feature of FEATURES) {
          const localFlag = getFlag(plan, feature.key);
          
          if (localFlag && localFlag.id.startsWith('temp-')) {
            // Créer un nouveau flag en base
            const { error } = await supabase
              .from("feature_flags_by_plan")
              .insert([{
                plan_name: plan,
                feature_key: feature.key,
                enabled: localFlag.enabled,
              }]);

            if (error) {
              console.error(`Erreur création ${plan}/${feature.key}:`, error);
              hasError = true;
            }
          } else if (localFlag) {
            // Mettre à jour un flag existant
            const { error } = await supabase
              .from("feature_flags_by_plan")
              .update({ 
                enabled: localFlag.enabled, 
                updated_at: new Date().toISOString() 
              })
              .eq("id", localFlag.id);

            if (error) {
              console.error(`Erreur mise à jour ${plan}/${feature.key}:`, error);
              hasError = true;
            }
          }
        }
      }

      if (hasError) {
        toast({ 
          title: "Erreurs lors de la sauvegarde", 
          description: "Certaines fonctionnalités n'ont pas pu être sauvegardées",
          variant: "destructive"
        });
      } else {
        toast({ 
          title: "Sauvegarde réussie", 
          description: "Les fonctionnalités ont été mises à jour avec succès"
        });
        // Recharger les données pour obtenir les vrais IDs
        await loadFeatureFlags();
      }
    } catch (error) {
      console.error("Erreur générale:", error);
      toast({ 
        title: "Erreur", 
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Charger les flags au montage du composant
  useEffect(() => {
    loadFeatureFlags();
  }, []);

  return {
    flags,
    loading,
    saving,
    getFlag,
    handleToggleFlag,
    handleSave
  };
};

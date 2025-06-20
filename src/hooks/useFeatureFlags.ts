
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
      console.log("🔄 Chargement des feature flags...");
      
      const { data, error } = await supabase
        .from("feature_flags_by_plan")
        .select("*");

      if (error) {
        console.error("❌ Erreur lors du chargement des flags:", error);
        toast({ 
          title: "Erreur de chargement", 
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log("✅ Flags chargés:", data);

      // Filtrer et typer les données
      const validFlags = (data || [])
        .filter(flag => PLANS.includes(flag.plan_name as PlanName))
        .map(flag => ({
          ...flag,
          plan_name: flag.plan_name as PlanName
        }));

      setFlags(validFlags);
    } catch (error) {
      console.error("💥 Erreur lors du chargement:", error);
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
    console.log(`🔄 Toggle flag: ${plan}/${featureKey} = ${enabled}`);
    
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
          id: `temp-${Date.now()}-${Math.random()}`, // ID temporaire unique
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
    let successCount = 0;

    try {
      console.log("💾 Début de la sauvegarde des flags...");
      
      // Traiter chaque flag dans l'état local
      for (const flag of flags) {
        try {
          if (flag.id.startsWith('temp-')) {
            // Créer un nouveau flag en base
            console.log(`➕ Création du flag: ${flag.plan_name}/${flag.feature_key}`);
            
            const { error } = await supabase
              .from("feature_flags_by_plan")
              .insert([{
                plan_name: flag.plan_name,
                feature_key: flag.feature_key,
                enabled: flag.enabled,
              }]);

            if (error) {
              console.error(`❌ Erreur création ${flag.plan_name}/${flag.feature_key}:`, error);
              hasError = true;
            } else {
              successCount++;
              console.log(`✅ Flag créé: ${flag.plan_name}/${flag.feature_key}`);
            }
          } else {
            // Mettre à jour un flag existant
            console.log(`🔄 Mise à jour du flag: ${flag.plan_name}/${flag.feature_key}`);
            
            const { error } = await supabase
              .from("feature_flags_by_plan")
              .update({ 
                enabled: flag.enabled, 
                updated_at: new Date().toISOString() 
              })
              .eq("id", flag.id);

            if (error) {
              console.error(`❌ Erreur mise à jour ${flag.plan_name}/${flag.feature_key}:`, error);
              hasError = true;
            } else {
              successCount++;
              console.log(`✅ Flag mis à jour: ${flag.plan_name}/${flag.feature_key}`);
            }
          }
        } catch (flagError) {
          console.error(`💥 Erreur traitement flag ${flag.plan_name}/${flag.feature_key}:`, flagError);
          hasError = true;
        }
      }

      if (hasError && successCount === 0) {
        toast({ 
          title: "Échec de la sauvegarde", 
          description: "Aucune fonctionnalité n'a pu être sauvegardée",
          variant: "destructive"
        });
      } else if (hasError) {
        toast({ 
          title: "Sauvegarde partielle", 
          description: `${successCount} fonctionnalité(s) sauvegardée(s), mais certaines ont échoué`,
          variant: "destructive"
        });
      } else {
        toast({ 
          title: "Sauvegarde réussie", 
          description: `${successCount} fonctionnalité(s) mise(s) à jour avec succès`
        });
      }

      // Recharger les données pour obtenir les vrais IDs et l'état actuel
      await loadFeatureFlags();
      
    } catch (error) {
      console.error("💥 Erreur générale de sauvegarde:", error);
      toast({ 
        title: "Erreur", 
        description: "Une erreur inattendue s'est produite lors de la sauvegarde",
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

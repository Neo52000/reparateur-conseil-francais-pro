
/**
 * Types pour le système de gestion des fonctionnalités par plan d'abonnement
 */

/**
 * Types de plans d'abonnement disponibles
 */
export type PlanName = "Gratuit" | "Basique" | "Premium" | "Enterprise";

/**
 * Structure pour une fonctionnalité avec sa clé et son nom d'affichage
 */
export interface Feature {
  key: string;
  name: string;
  category: string;
}

/**
 * Structure d'un flag de fonctionnalité en base de données
 */
export interface FeatureFlag {
  id: string;
  plan_name: PlanName;
  feature_key: string;
  enabled: boolean;
}

/**
 * Props pour le composant FeatureFlagsTable
 */
export interface FeatureFlagsTableProps {
  category: string;
  features: Feature[];
  plans: readonly PlanName[];
  getFlag: (plan: PlanName, featureKey: string) => FeatureFlag | undefined;
  onToggleFlag: (plan: PlanName, featureKey: string, enabled: boolean) => void;
}

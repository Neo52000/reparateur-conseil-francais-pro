import { PlanName } from "@/types/featureFlags";

/**
 * Types de widgets disponibles pour les fiches réparateurs
 */
export type ProfileWidgetType = 
  | 'header' 
  | 'photos' 
  | 'services' 
  | 'pricing' 
  | 'hours' 
  | 'reviews' 
  | 'contact' 
  | 'map' 
  | 'certifications' 
  | 'about';

/**
 * Règles de visibilité d'un widget selon le plan d'abonnement
 */
export interface WidgetVisibilityRules {
  minPlan: PlanName;
  blurIfNotAllowed: boolean;
  hideIfNotAllowed: boolean;
  customMessage?: string;
}

/**
 * Styles personnalisables d'un widget
 */
export interface WidgetStyles {
  padding?: string;
  background?: string;
  borderRadius?: string;
  shadow?: string;
  margin?: string;
}

/**
 * Widget de profil réparateur
 */
export interface ProfileWidget {
  id: string;
  type: ProfileWidgetType;
  name: string;
  icon: string;
  order: number;
  isVisible: boolean;
  visibilityRules: WidgetVisibilityRules;
  styles: WidgetStyles;
}

/**
 * Thème d'un template de profil
 */
export interface ProfileTheme {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  spacing: 'compact' | 'normal' | 'spacious';
}

/**
 * Template de fiche réparateur stocké en base
 */
export interface ProfileTemplate {
  id: string;
  name: string;
  description: string | null;
  widgets: ProfileWidget[];
  theme_data: ProfileTheme;
  is_default: boolean;
  is_ai_generated: boolean;
  preview_image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * État de visibilité d'un widget après évaluation des règles
 */
export type WidgetVisibilityState = 'visible' | 'blurred' | 'hidden';

/**
 * Configuration des widgets disponibles dans la bibliothèque
 */
export interface WidgetLibraryItem {
  type: ProfileWidgetType;
  name: string;
  icon: string;
  description: string;
  defaultMinPlan: PlanName;
}

/**
 * Liste des widgets disponibles avec leurs métadonnées
 */
export const PROFILE_WIDGETS: WidgetLibraryItem[] = [
  { type: 'header', name: 'En-tête', icon: 'User', description: 'Nom, logo, badges et note', defaultMinPlan: 'Gratuit' },
  { type: 'about', name: 'À propos', icon: 'FileText', description: 'Description et présentation', defaultMinPlan: 'Visibilité' },
  { type: 'contact', name: 'Contact', icon: 'Phone', description: 'Téléphone, email, adresse', defaultMinPlan: 'Visibilité' },
  { type: 'photos', name: 'Photos', icon: 'Image', description: 'Galerie de photos', defaultMinPlan: 'Visibilité' },
  { type: 'hours', name: 'Horaires', icon: 'Clock', description: "Horaires d'ouverture", defaultMinPlan: 'Visibilité' },
  { type: 'services', name: 'Services', icon: 'Wrench', description: 'Liste des services proposés', defaultMinPlan: 'Gratuit' },
  { type: 'pricing', name: 'Tarifs', icon: 'Euro', description: 'Grille tarifaire', defaultMinPlan: 'Pro' },
  { type: 'certifications', name: 'Certifications', icon: 'Award', description: 'Labels et certifications', defaultMinPlan: 'Gratuit' },
  { type: 'map', name: 'Carte', icon: 'MapPin', description: 'Carte interactive', defaultMinPlan: 'Pro' },
  { type: 'reviews', name: 'Avis', icon: 'Star', description: 'Avis clients', defaultMinPlan: 'Gratuit' },
];

/**
 * Évalue la visibilité d'un widget selon le plan du réparateur
 */
export const evaluateWidgetVisibility = (
  widget: ProfileWidget, 
  repairerPlan: PlanName
): WidgetVisibilityState => {
  const planOrder: PlanName[] = ['Gratuit', 'Visibilité', 'Pro', 'Premium'];
  const minPlanIndex = planOrder.indexOf(widget.visibilityRules.minPlan);
  const currentPlanIndex = planOrder.indexOf(repairerPlan);
  
  if (currentPlanIndex >= minPlanIndex) return 'visible';
  if (widget.visibilityRules.blurIfNotAllowed) return 'blurred';
  if (widget.visibilityRules.hideIfNotAllowed) return 'hidden';
  return 'visible';
};

/**
 * Crée un widget par défaut à partir d'un type
 */
export const createDefaultWidget = (type: ProfileWidgetType, order: number): ProfileWidget => {
  const libraryItem = PROFILE_WIDGETS.find(w => w.type === type);
  
  if (!libraryItem) {
    throw new Error(`Widget type "${type}" not found in library`);
  }

  return {
    id: `widget-${type}-${Date.now()}`,
    type,
    name: libraryItem.name,
    icon: libraryItem.icon,
    order,
    isVisible: true,
    visibilityRules: {
      minPlan: libraryItem.defaultMinPlan,
      blurIfNotAllowed: libraryItem.defaultMinPlan !== 'Gratuit',
      hideIfNotAllowed: false,
    },
    styles: {},
  };
};

/**
 * Thème par défaut pour les nouveaux templates
 */
export const DEFAULT_THEME: ProfileTheme = {
  primaryColor: '217 91% 60%',
  accentColor: '142 76% 36%',
  fontFamily: 'Inter',
  spacing: 'normal',
};

/**
 * Index central pour tous les types de l'application
 * Permet un import simplifié : import { Repairer, SearchFilters } from '@/types'
 */

// Types de base
export type { Repairer } from './repairer';
export type { SearchFilters, RepairerSearchFilters } from './searchFilters';
export type { FeatureFlag } from './featureFlags';

// Types d'authentification
export type { Profile, UserSignUpData, AuthState } from './auth';

// Types de blog
export type { BlogPost, BlogCategory, BlogComment } from './blog';

// Types de publicité
export type { AdBanner, AdCampaign, AdClick, AdImpression } from './advertising';

// Types de catalogue
export type { Brand, DeviceModel, DeviceType, RepairType } from './catalog';

// Types de réparateur
export type { RepairerProfile } from './repairerProfile';

// Types de campagnes
export type { AdCampaign as Campaign, CampaignStats } from './campaigns';

// Types de créatifs
export type { Creative } from './creatives';
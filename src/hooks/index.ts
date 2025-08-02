/**
 * Index central pour tous les hooks personnalisés
 */

// Hooks d'authentification
export { useAuth } from './useAuth';
export { useAuthActions } from './auth/useAuthActions';
export { useAuthSession } from './auth/useAuthSession';

// Hooks de données
export { useRepairers } from './useRepairers';
export { useRepairersOptimized } from './useRepairersOptimized';
export { usePriorityRepairersOptimized } from './usePriorityRepairersOptimized';
export { useRepairersData } from './useRepairersData';

// Hooks de recherche
export { useRepairerSearch } from './useRepairerSearch';

// Hooks d'interface
export { useToast } from './use-toast';
export { useIsMobile } from './use-mobile';
export { useFeatureFlags } from './useFeatureFlags';


// Hooks de géolocalisation
export { useGeolocation } from './useGeolocation';
export { useAddressAutocomplete } from './useAddressAutocomplete';

// Hooks de catalogue
export { useCatalog } from './useCatalog';
export { useBrands } from './catalog/useBrands';
export { useDeviceModels } from './catalog/useDeviceModels';
export { useDeviceTypes } from './catalog/useDeviceTypes';
export { useRepairTypes } from './catalog/useRepairTypes';

// Hooks de notification
export { useNotifications } from './useNotifications';

// Hooks de scraping
export { useScrapingResults } from './useScrapingResults';
export { useScrapingAuth } from './scraping/useScrapingAuth';
export { useScrapingOperations } from './scraping/useScrapingOperations';

// Hooks de blog
export { useBlog } from './useBlog';
export { useBlogPosts } from './blog/useBlogPosts';
export { useBlogCategories } from './blog/useBlogCategories';

// Hooks de publicité
export { useAdvertising } from './useAdvertising';
export { useEnhancedAdvertising } from './useEnhancedAdvertising';
export { useCreatives } from './useCreatives';

// Hooks d'analytiques
export { useAnalyticsEvents } from './useAnalyticsEvents';

// Hooks de devis et rendez-vous
export { useQuoteAndAppointment } from './useQuoteAndAppointment';
export { useQuoteForm } from './useQuoteForm';
export { useTimeSlots } from './useTimeSlots';

// Hooks d'audit
export { useAdminAudit } from './useAdminAudit';
export { useHistoryCleanup } from './useHistoryCleanup';

// Hooks de documentation
export { useDocumentationPDF } from './useDocumentationPDF';
export { useDocumentationManager } from './useDocumentationManager';

// Hooks de chat
export { useAIPreDiagChat } from './useAIPreDiagChat';
export { useChatbot } from './useChatbot';

// Hooks d'optimisation système
export { useSystemOptimization } from './useSystemOptimization';

// Hooks de profil réparateur
export { useRepairerProfileSave } from './useRepairerProfileSave';
export { useRepairerSubscriptions } from './useRepairerSubscriptions';

// Hooks de référencement
export { useReferrals } from './useReferrals';

// Hooks d'upgrade
export { useUpgradeModal } from './useUpgradeModal';

// Hooks de validation
export { usePendingAction } from './usePendingAction';
export { usePendingQuoteAction } from './usePendingQuoteAction';
export { usePostalCodeValidation } from './usePostalCodeValidation';

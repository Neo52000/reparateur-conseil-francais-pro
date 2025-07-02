/**
 * Index central pour tous les utilitaires
 */

// Utilitaires de base
export { cn } from '../lib/utils';
export { logger } from './logger';

// Utilitaires de validation
export {
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateCoordinates,
  validateRepairerData,
  validateSearchFilters,
  sanitizeString,
  validateWithRules,
  type ValidationResult,
  type ValidationRule,
  type RepairerData,
} from './validation';

// Utilitaires de gestion d'erreurs
export {
  ErrorHandler,
  CustomError,
  ErrorCodes,
  withErrorHandling,
  useErrorHandling,
  type AppError,
} from './errorHandling';

// Utilitaires de performance
export {
  measurePerformance,
  debounce,
  throttle,
  TTLCache,
  ComponentPerformanceAnalyzer,
  MemoryLeakDetector,
  deepEqual,
  usePerformanceMeasurement,
} from './performance';

// Utilitaires de géolocalisation
export { DistanceCalculator } from './geolocation/distanceCalculator';
export { GeocodingService } from './GeocodingService';

// Utilitaires de géocodage
export { FirecrawlService } from './FirecrawlService';

// Utilitaires de subscription
// export { subscriptionDisplay } from './subscriptionDisplay';
// export { subscriptionTiers } from './subscriptionTiers';

// Utilitaires SEO
// export { seoDescriptionGenerator } from './seoDescriptionGenerator';
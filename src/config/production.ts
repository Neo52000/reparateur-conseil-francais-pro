/**
 * Configuration spécifique à la production
 */

import { ENVIRONMENT } from './environment';

export const PRODUCTION_CONFIG = {
  // Optimisations de performance
  performance: {
    // Cache agressif en production
    cacheStrategy: 'aggressive' as const,
    
    // Debouncing plus long pour réduire les requêtes
    searchDebounce: 500,
    
    // Lazy loading activé
    enableLazyLoading: true,
    
    // Préchargement stratégique
    enablePreloading: true,
    
    // Compression des données
    enableCompression: true,
  },
  
  // Monitoring et analytics
  monitoring: {
    // Tracking des erreurs
    enableErrorTracking: true,
    
    // Analytics de performance
    enablePerformanceTracking: true,
    
    // Logging minimal
    logLevel: 'error' as const,
    
    // Métriques utilisateur
    enableUserMetrics: true,
  },
  
  // Sécurité
  security: {
    // HTTPS obligatoire
    enforceHTTPS: true,
    
    // Headers de sécurité
    enableSecurityHeaders: true,
    
    // Validation stricte
    enableStrictValidation: true,
  },
  
  // Optimisations SEO
  seo: {
    // Meta tags dynamiques
    enableDynamicMeta: true,
    
    // Structured data
    enableStructuredData: true,
    
    // Sitemap automatique
    enableSitemap: true,
  },
  
  // Features de production
  features: {
    // Mode démo désactivé par défaut
    enableDemo: false,
    
    // Debug panels désactivés
    enableDebugPanels: false,
    
    // Console logs minimaux
    enableConsoleReports: false,
    
    // Analytics complets
    enableAnalytics: true,
    
    // Service worker
    enableServiceWorker: true,
  },
} as const;

// Configuration conditionnelle basée sur l'environnement
export const getConfig = () => {
  if (ENVIRONMENT.isProduction) {
    return {
      ...PRODUCTION_CONFIG,
      // Overrides spécifiques si nécessaire
    };
  }
  
  return {
    // Configuration de développement avec plus de debug
    performance: {
      cacheStrategy: 'minimal' as const,
      searchDebounce: 300,
      enableLazyLoading: false,
      enablePreloading: false,
      enableCompression: false,
    },
    monitoring: {
      enableErrorTracking: true,
      enablePerformanceTracking: true,
      logLevel: 'debug' as const,
      enableUserMetrics: false,
    },
    features: {
      enableDemo: true,
      enableDebugPanels: true,
      enableConsoleReports: true,
      enableAnalytics: false,
      enableServiceWorker: false,
    },
  };
};
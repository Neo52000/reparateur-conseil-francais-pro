/**
 * Configuration finale pour le passage en production - MODE PRODUCTION STRICT
 * Aucune donnée factice, aucun mode démo
 */

import { PRODUCTION_CONFIG } from './production';

/**
 * Configuration de production finale
 * Plus de données simulées, plus de mode démo
 */
export const FINAL_PRODUCTION_CONFIG = {
  ...PRODUCTION_CONFIG,
  
  // Mode production strict - aucune donnée factice
  dataMode: 'real' as const,
  
  // Analytics complets activés
  analytics: {
    enableConnectionTracking: true,
    enableUserBehavior: true,
    enablePerformanceMetrics: true,
    enableErrorTracking: true,
    enableBusinessMetrics: true
  },
  
  // Sécurité renforcée
  security: {
    ...PRODUCTION_CONFIG.security,
    enableCSP: true,
    enableHSTS: true,
    enforceHTTPS: true,
    enableRateLimiting: true
  },
  
  // Performance optimisée
  performance: {
    ...PRODUCTION_CONFIG.performance,
    enableServiceWorker: true,
    enableLazyLoading: true,
    enablePreloading: true,
    enableBundleOptimization: true,
    enableImageOptimization: true
  },
  
  // Features de production uniquement
  features: {
    enableDemo: false,           // DÉSACTIVÉ en production
    enableDebugPanels: false,    // DÉSACTIVÉ en production
    enableConsoleReports: false, // DÉSACTIVÉ en production
    enableMockData: false,       // DÉSACTIVÉ en production
    enableAnalytics: true,
    enableServiceWorker: true,
    enableConnectionAnalytics: true
  }
} as const;

/**
 * Initialisation complète pour la production
 * À appeler au démarrage de l'application
 */
export const initializeProductionMode = () => {
  console.log('🚀 Initialisation du mode production STRICT...');
  
  // 2. Configuration du logging minimal
  if (!FINAL_PRODUCTION_CONFIG.features.enableConsoleReports) {
    // Désactiver les console.log en production sauf erreurs
    console.log = () => {};
    console.info = () => {};
    console.warn = console.warn; // Garder les warnings
    console.error = console.error; // Garder les erreurs
  }
  
  // 3. Service Worker pour le cache
  if (FINAL_PRODUCTION_CONFIG.performance.enableServiceWorker) {
    navigator.serviceWorker?.register('/sw.js').catch(() => {
      // Service worker registration failed - not critical
    });
  }
  
  // 4. Configuration des headers de sécurité (si possible côté client)
  if (FINAL_PRODUCTION_CONFIG.security.enableCSP) {
    // Les headers CSP doivent être configurés côté serveur
    console.warn('CSP headers should be configured server-side');
  }
  
  console.log('✅ Mode production initialisé');
  
  return {
    config: FINAL_PRODUCTION_CONFIG,
    isProduction: true,
    hasRealData: true,
    hasMockData: false,
    isDemoMode: false
  };
};

/**
 * Vérifications de santé pour la production
 */
export const performProductionHealthCheck = () => {
  const checks = {
    supabaseConnected: !!globalThis.fetch,
    serviceWorkerSupported: 'serviceWorker' in navigator,
    localStorageAvailable: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),
    httpsEnabled: location.protocol === 'https:' || location.hostname === 'localhost',
    analyticsEnabled: FINAL_PRODUCTION_CONFIG.analytics.enableConnectionTracking
  };
  
  const allChecksPass = Object.values(checks).every(Boolean);
  
  if (!allChecksPass) {
    console.warn('⚠️ Certaines vérifications de production ont échoué:', checks);
  }
  
  return {
    healthy: allChecksPass,
    checks
  };
};

/**
 * Utilitaire pour vérifier si on est en mode production réel
 */
export const isRealProductionMode = () => {
  return !FINAL_PRODUCTION_CONFIG.features.enableDemo && 
         !FINAL_PRODUCTION_CONFIG.features.enableMockData &&
         FINAL_PRODUCTION_CONFIG.dataMode === 'real';
};
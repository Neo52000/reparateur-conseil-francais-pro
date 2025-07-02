/**
 * Configuration d'environnement pour optimisation production
 */

export const ENVIRONMENT = {
  // Mode de développement
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Configuration de logging optimisée
  logging: {
    enableConsole: import.meta.env.DEV,
    enableRemote: import.meta.env.PROD,
    level: import.meta.env.DEV ? 'debug' : 'error',
  },
  
  // Configuration de cache optimisée pour production
  cache: {
    defaultTTL: import.meta.env.PROD ? 10 * 60 * 1000 : 5 * 60 * 1000, // 10min prod, 5min dev
    maxSize: import.meta.env.PROD ? 200 : 50,
    enablePersistence: import.meta.env.PROD,
  },
  
  // Configuration de performance
  performance: {
    enableMeasurements: import.meta.env.DEV,
    enableAnalytics: import.meta.env.PROD,
    debounceDelay: import.meta.env.PROD ? 500 : 300,
  },
  
  // Configuration des features
  features: {
    enableDebugPanels: import.meta.env.DEV,
    enableConsoleReports: import.meta.env.DEV,
    enableErrorReporting: import.meta.env.PROD,
  },
} as const;
/**
 * Configuration centralisée de l'application
 */

export const APP_CONFIG = {
  // Configuration de l'application
  name: 'ReparMobile',
  version: '1.0.0',
  description: 'Plateforme de mise en relation clients/réparateurs',
  
  // URLs et endpoints (loaded from environment variables)
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  
  // Configuration de performance
  cache: {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
  },
  
  // Configuration de recherche
  search: {
    debounceDelay: 300,
    maxResults: 200,
    defaultRadius: 10,
  },
  
  // Configuration de l'interface
  ui: {
    animations: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    breakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  
  // Features flags par défaut - MODE PRODUCTION
  features: {
    enableAdvancedSearch: true,
    enableNotifications: true,
    enableAnalytics: true,
    enableDemo: false, // DÉSACTIVÉ DÉFINITIVEMENT POUR LA PRODUCTION
  },
  
  // Configuration de logging
  logging: {
    level: 'info',
    enableConsole: true,
    enableRemote: false,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
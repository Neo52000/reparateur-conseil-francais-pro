/**
 * Configuration centralisée de l'application
 */

export const APP_CONFIG = {
  // Configuration de l'application
  name: 'ReparMobile',
  version: '1.0.0',
  description: 'Plateforme de mise en relation clients/réparateurs',
  
  // URLs et endpoints
  supabaseUrl: 'https://nbugpbakfkyvvjzgfjmw.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idWdwYmFrZmt5dnZqemdmam13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTgyMjQsImV4cCI6MjA2NTQ3NDIyNH0.3D_IxWcSNpA2Xk5PtsJVyfjAk9kC1KbMG2n1FJ32tWc',
  
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
  
  // Features flags par défaut
  features: {
    enableAdvancedSearch: true,
    enableNotifications: true,
    enableAnalytics: true,
    enableDemo: true,
  },
  
  // Configuration de logging
  logging: {
    level: 'info',
    enableConsole: true,
    enableRemote: false,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
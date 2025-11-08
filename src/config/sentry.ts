import * as Sentry from "@sentry/react";
import { ENVIRONMENT } from "./environment";

/**
 * Configuration et initialisation de Sentry pour le monitoring d'erreurs
 */
export const initializeSentry = () => {
  // Ne pas initialiser Sentry en développement
  if (!ENVIRONMENT.isProduction) {
    console.log('🔧 Sentry désactivé en mode développement');
    return;
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('⚠️ VITE_SENTRY_DSN non configuré - Monitoring Sentry désactivé');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% des transactions en production
    
    // Session Replay pour comprendre les erreurs utilisateurs
    replaysSessionSampleRate: 0.1, // 10% des sessions normales
    replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreur
    
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Filtrer les erreurs non pertinentes
    beforeSend(event, hint) {
      // Ignorer les erreurs d'extensions de navigateur
      if (event.exception?.values?.[0]?.value?.includes('extension://')) {
        return null;
      }
      
      // Ignorer les erreurs de réseau
      if (event.exception?.values?.[0]?.type === 'NetworkError') {
        return null;
      }
      
      return event;
    },
    
    // Configuration de la confidentialité
    beforeBreadcrumb(breadcrumb) {
      // Ne pas enregistrer les données sensibles dans les breadcrumbs
      if (breadcrumb.category === 'console') {
        return null;
      }
      return breadcrumb;
    },
  });

  console.log('✅ Sentry initialisé avec succès');
};

/**
 * Capturer manuellement une erreur dans Sentry
 */
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (!ENVIRONMENT.isProduction) {
    console.error('🔧 [Dev] Error captured:', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Ajouter un breadcrumb personnalisé
 */
export const addBreadcrumb = (message: string, data?: Record<string, any>) => {
  if (!ENVIRONMENT.isProduction) return;
  
  Sentry.addBreadcrumb({
    message,
    level: 'info',
    data,
  });
};

/**
 * Définir le contexte utilisateur pour Sentry
 */
export const setUserContext = (userId: string, email?: string) => {
  if (!ENVIRONMENT.isProduction) return;
  
  Sentry.setUser({
    id: userId,
    email,
  });
};

/**
 * Effacer le contexte utilisateur (lors de la déconnexion)
 */
export const clearUserContext = () => {
  if (!ENVIRONMENT.isProduction) return;
  
  Sentry.setUser(null);
};

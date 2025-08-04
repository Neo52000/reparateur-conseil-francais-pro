/**
 * Service global de gestion d'erreurs
 * Centralise et normalise la gestion des erreurs dans l'application
 */

import { toast } from '@/hooks/use-toast';

export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface NormalizedError {
  message: string;
  code?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  userMessage: string;
  context: ErrorContext;
  timestamp: Date;
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorHistory: NormalizedError[] = [];

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Normalise une erreur selon le format standard
   */
  normalizeError(error: any, context: ErrorContext): NormalizedError {
    console.error('🚨 Error caught:', { error, context });

    let message = 'Une erreur inattendue s\'est produite';
    let code = 'UNKNOWN_ERROR';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let actionable = false;
    let userMessage = message;

    // Gestion des erreurs Supabase
    if (error?.message) {
      message = error.message;
      code = error.code || 'SUPABASE_ERROR';
      
      if (error.message.includes('not found')) {
        userMessage = 'Ressource non trouvée';
        severity = 'low';
        actionable = true;
      } else if (error.message.includes('permission') || error.message.includes('forbidden')) {
        userMessage = 'Permissions insuffisantes';
        severity = 'high';
        actionable = true;
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        userMessage = 'Problème de connexion. Vérifiez votre réseau.';
        severity = 'medium';
        actionable = true;
      } else if (error.message.includes('auth')) {
        userMessage = 'Problème d\'authentification. Veuillez vous reconnecter.';
        severity = 'high';
        actionable = true;
      }
    }

    // Gestion des erreurs JavaScript standard
    if (error instanceof Error) {
      message = error.message;
      if (error.name === 'TypeError') {
        severity = 'medium';
        userMessage = 'Erreur de données. Veuillez recharger la page.';
        actionable = true;
      }
    }

    // Erreurs de type string
    if (typeof error === 'string') {
      message = error;
      userMessage = error;
    }

    const normalizedError: NormalizedError = {
      message,
      code,
      severity,
      actionable,
      userMessage,
      context,
      timestamp: new Date()
    };

    // Stocker dans l'historique
    this.errorHistory.push(normalizedError);
    
    // Garder seulement les 100 dernières erreurs
    if (this.errorHistory.length > 100) {
      this.errorHistory = this.errorHistory.slice(-100);
    }

    return normalizedError;
  }

  /**
   * Gère une erreur et affiche un toast approprié
   */
  handleError(error: any, context: ErrorContext): NormalizedError {
    const normalizedError = this.normalizeError(error, context);

    // Afficher le toast selon la sévérité
    if (normalizedError.severity === 'critical') {
      toast({
        title: "Erreur critique",
        description: normalizedError.userMessage,
        variant: "destructive"
      });
    } else if (normalizedError.severity === 'high') {
      toast({
        title: "Attention",
        description: normalizedError.userMessage,
        variant: "destructive"
      });
    } else if (normalizedError.severity === 'medium') {
      toast({
        title: "Information",
        description: normalizedError.userMessage,
        variant: "default"
      });
    }

    return normalizedError;
  }

  /**
   * Intercepteur global pour les erreurs Supabase
   */
  setupSupabaseErrorInterceptor() {
    // Cette méthode peut être étendue pour intercepter automatiquement les erreurs Supabase
    console.log('🔧 Supabase error interceptor configured');
  }

  /**
   * Récupère l'historique des erreurs
   */
  getErrorHistory(): NormalizedError[] {
    return [...this.errorHistory];
  }

  /**
   * Nettoie l'historique des erreurs
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Méthode utilitaire pour les erreurs d'authentification
   */
  handleAuthError(error: any, component: string): NormalizedError {
    return this.handleError(error, {
      component,
      action: 'authentication',
      metadata: { errorType: 'auth' }
    });
  }

  /**
   * Méthode utilitaire pour les erreurs de données
   */
  handleDataError(error: any, component: string, action: string): NormalizedError {
    return this.handleError(error, {
      component,
      action,
      metadata: { errorType: 'data' }
    });
  }

  /**
   * Méthode utilitaire pour les erreurs d'interface
   */
  handleUIError(error: any, component: string): NormalizedError {
    return this.handleError(error, {
      component,
      action: 'ui_interaction',
      metadata: { errorType: 'ui' }
    });
  }
}

export const errorHandler = ErrorHandlingService.getInstance();

// Export des méthodes utilitaires pour un usage direct
export const handleError = (error: any, context: ErrorContext) => errorHandler.handleError(error, context);
export const handleAuthError = (error: any, component: string) => errorHandler.handleAuthError(error, component);
export const handleDataError = (error: any, component: string, action: string) => errorHandler.handleDataError(error, component, action);
export const handleUIError = (error: any, component: string) => errorHandler.handleUIError(error, component);
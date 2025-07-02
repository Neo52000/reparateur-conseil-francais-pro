/**
 * Système de gestion d'erreurs centralisé
 */

import { logger } from './logger';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class CustomError extends Error {
  public code: string;
  public severity: 'low' | 'medium' | 'high' | 'critical';
  public details?: any;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    details?: any
  ) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.severity = severity;
    this.details = details;
  }
}

/**
 * Types d'erreurs communes
 */
export const ErrorCodes = {
  // Erreurs réseau
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // Erreurs d'authentification
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Erreurs de données
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  DUPLICATE_DATA: 'DUPLICATE_DATA',
  INVALID_DATA_FORMAT: 'INVALID_DATA_FORMAT',
  
  // Erreurs de géolocalisation
  GEOLOCATION_ERROR: 'GEOLOCATION_ERROR',
  GEOLOCATION_PERMISSION_DENIED: 'GEOLOCATION_PERMISSION_DENIED',
  GEOLOCATION_UNAVAILABLE: 'GEOLOCATION_UNAVAILABLE',
  
  // Erreurs de service
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
} as const;

/**
 * Gestionnaire d'erreurs centralisé
 */
export class ErrorHandler {
  /**
   * Traite une erreur et retourne un message utilisateur approprié
   */
  static handle(error: unknown): AppError {
    logger.error('Erreur capturée par ErrorHandler:', error);

    // Erreur personnalisée
    if (error instanceof CustomError) {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
        severity: error.severity,
      };
    }

    // Erreur JavaScript standard
    if (error instanceof Error) {
      return this.handleStandardError(error);
    }

    // Erreur Supabase
    if (this.isSupabaseError(error)) {
      return this.handleSupabaseError(error as any);
    }

    // Erreur de géolocalisation
    if (this.isGeolocationError(error)) {
      return this.handleGeolocationError(error as GeolocationPositionError);
    }

    // Erreur inconnue
    return {
      code: ErrorCodes.NETWORK_ERROR,
      message: 'Une erreur inattendue s\'est produite',
      details: error,
      severity: 'medium',
    };
  }

  /**
   * Gestion des erreurs JavaScript standard
   */
  private static handleStandardError(error: Error): AppError {
    // Erreurs réseau
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        code: ErrorCodes.NETWORK_ERROR,
        message: 'Problème de connexion réseau',
        details: error.message,
        severity: 'medium',
      };
    }

    // Erreurs de timeout
    if (error.message.includes('timeout')) {
      return {
        code: ErrorCodes.TIMEOUT_ERROR,
        message: 'La requête a pris trop de temps',
        details: error.message,
        severity: 'medium',
      };
    }

    return {
      code: 'JAVASCRIPT_ERROR',
      message: error.message || 'Erreur JavaScript',
      details: error.stack,
      severity: 'medium',
    };
  }

  /**
   * Gestion des erreurs Supabase
   */
  private static handleSupabaseError(error: any): AppError {
    const message = error.message || 'Erreur de base de données';
    
    // Erreurs d'authentification
    if (message.includes('Invalid login credentials')) {
      return {
        code: ErrorCodes.INVALID_CREDENTIALS,
        message: 'Email ou mot de passe incorrect',
        severity: 'low',
      };
    }

    if (message.includes('Email not confirmed')) {
      return {
        code: ErrorCodes.AUTH_REQUIRED,
        message: 'Veuillez confirmer votre email',
        severity: 'medium',
      };
    }

    // Erreurs de permissions
    if (message.includes('Row Level Security')) {
      return {
        code: ErrorCodes.INSUFFICIENT_PERMISSIONS,
        message: 'Permissions insuffisantes',
        severity: 'medium',
      };
    }

    return {
      code: 'SUPABASE_ERROR',
      message: 'Erreur de base de données',
      details: error,
      severity: 'medium',
    };
  }

  /**
   * Gestion des erreurs de géolocalisation
   */
  private static handleGeolocationError(error: GeolocationPositionError): AppError {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return {
          code: ErrorCodes.GEOLOCATION_PERMISSION_DENIED,
          message: 'Accès à la localisation refusé',
          severity: 'low',
        };
      case error.POSITION_UNAVAILABLE:
        return {
          code: ErrorCodes.GEOLOCATION_UNAVAILABLE,
          message: 'Position indisponible',
          severity: 'medium',
        };
      case error.TIMEOUT:
        return {
          code: ErrorCodes.TIMEOUT_ERROR,
          message: 'Timeout de géolocalisation',
          severity: 'medium',
        };
      default:
        return {
          code: ErrorCodes.GEOLOCATION_ERROR,
          message: 'Erreur de géolocalisation',
          severity: 'medium',
        };
    }
  }

  /**
   * Vérifie si c'est une erreur Supabase
   */
  private static isSupabaseError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      ('code' in error || 'hint' in error || 'details' in error)
    );
  }

  /**
   * Vérifie si c'est une erreur de géolocalisation
   */
  private static isGeolocationError(error: unknown): boolean {
    return error instanceof GeolocationPositionError;
  }

  /**
   * Convertit une erreur en message utilisateur convivial
   */
  static getDisplayMessage(error: AppError): string {
    const messages: Record<string, string> = {
      [ErrorCodes.NETWORK_ERROR]: 'Vérifiez votre connexion internet',
      [ErrorCodes.TIMEOUT_ERROR]: 'La requête a pris trop de temps, veuillez réessayer',
      [ErrorCodes.AUTH_REQUIRED]: 'Vous devez être connecté pour effectuer cette action',
      [ErrorCodes.INVALID_CREDENTIALS]: 'Email ou mot de passe incorrect',
      [ErrorCodes.DATA_NOT_FOUND]: 'Aucune donnée trouvée',
      [ErrorCodes.GEOLOCATION_PERMISSION_DENIED]: 'Autorisez la géolocalisation pour une meilleure expérience',
      [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service temporairement indisponible',
    };

    return messages[error.code] || error.message;
  }
}

/**
 * Wrapper pour les fonctions async avec gestion d'erreur
 */
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<{ data?: R; error?: AppError }> => {
    try {
      const data = await fn(...args);
      return { data };
    } catch (error) {
      const appError = ErrorHandler.handle(error);
      return { error: appError };
    }
  };
};

/**
 * Hook pour la gestion d'erreurs dans les composants React
 */
export const useErrorHandling = () => {
  const handleError = (error: unknown) => {
    const appError = ErrorHandler.handle(error);
    logger.error('Erreur traitée:', appError);
    return appError;
  };

  const getDisplayMessage = (error: AppError) => {
    return ErrorHandler.getDisplayMessage(error);
  };

  return {
    handleError,
    getDisplayMessage,
  };
};
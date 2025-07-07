/**
 * Gestionnaire d'erreurs centralisé pour les Edge Functions
 */

export interface EdgeFunctionError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  functionName?: string;
  requestId?: string;
}

export class EdgeErrorHandler {
  private static functionName: string = 'unknown';
  
  static setFunctionName(name: string) {
    this.functionName = name;
  }

  /**
   * Traite une erreur et retourne une réponse HTTP appropriée
   */
  static handleError(error: unknown, requestId?: string): Response {
    const processedError = this.processError(error, requestId);
    
    console.error(`❌ [${this.functionName}] Erreur:`, {
      ...processedError,
      originalError: error
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: processedError,
        timestamp: new Date().toISOString()
      }),
      {
        status: this.getHttpStatus(processedError.code),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      }
    );
  }

  /**
   * Traite l'erreur brute et la convertit en EdgeFunctionError
   */
  private static processError(error: unknown, requestId?: string): EdgeFunctionError {
    const timestamp = new Date().toISOString();
    const baseError: EdgeFunctionError = {
      code: 'UNKNOWN_ERROR',
      message: 'Une erreur inconnue s\'est produite',
      timestamp,
      functionName: this.functionName,
      requestId
    };

    // Erreur string simple
    if (typeof error === 'string') {
      return {
        ...baseError,
        code: 'STRING_ERROR',
        message: error
      };
    }

    // Erreur JavaScript standard
    if (error instanceof Error) {
      return {
        ...baseError,
        code: this.categorizeError(error.message),
        message: error.message,
        details: {
          name: error.name,
          stack: error.stack
        }
      };
    }

    // Erreur avec structure personnalisée
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as any;
      return {
        ...baseError,
        code: errorObj.code || this.categorizeError(errorObj.message || ''),
        message: errorObj.message || 'Erreur d\'objet',
        details: errorObj
      };
    }

    return baseError;
  }

  /**
   * Catégorise l'erreur selon son message
   */
  private static categorizeError(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('api') && lowerMessage.includes('key')) {
      return 'API_KEY_ERROR';
    }
    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      return 'TIMEOUT_ERROR';
    }
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized')) {
      return 'AUTH_ERROR';
    }
    if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
      return 'NOT_FOUND_ERROR';
    }
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }
    if (lowerMessage.includes('database') || lowerMessage.includes('supabase')) {
      return 'DATABASE_ERROR';
    }
    
    return 'PROCESSING_ERROR';
  }

  /**
   * Détermine le status HTTP selon le code d'erreur
   */
  private static getHttpStatus(code: string): number {
    switch (code) {
      case 'API_KEY_ERROR':
      case 'AUTH_ERROR':
        return 401;
      case 'NOT_FOUND_ERROR':
        return 404;
      case 'VALIDATION_ERROR':
        return 400;
      case 'TIMEOUT_ERROR':
        return 408;
      case 'NETWORK_ERROR':
        return 503;
      default:
        return 500;
    }
  }

  /**
   * Log de debug avec contexte
   */
  static logDebug(message: string, data?: any) {
    console.log(`🔍 [${this.functionName}] ${message}`, data || '');
  }

  /**
   * Log d'information
   */
  static logInfo(message: string, data?: any) {
    console.log(`ℹ️ [${this.functionName}] ${message}`, data || '');
  }

  /**
   * Log d'avertissement
   */
  static logWarning(message: string, data?: any) {
    console.warn(`⚠️ [${this.functionName}] ${message}`, data || '');
  }

  /**
   * Valide les paramètres requis
   */
  static validateRequiredParams(params: Record<string, any>, required: string[]): void {
    const missing = required.filter(key => 
      params[key] === undefined || params[key] === null || params[key] === ''
    );
    
    if (missing.length > 0) {
      throw new Error(`Paramètres requis manquants: ${missing.join(', ')}`);
    }
  }

  /**
   * Valide une clé API
   */
  static validateApiKey(apiKey: string | undefined, serviceName: string): void {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error(`Clé API ${serviceName} manquante ou invalide`);
    }
  }

  /**
   * Crée une réponse de succès standardisée
   */
  static successResponse(data: any, message?: string): Response {
    return new Response(
      JSON.stringify({
        success: true,
        data,
        message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      }
    );
  }
}

/**
 * Wrapper pour automatiser la gestion d'erreurs dans les Edge Functions
 */
export function withErrorHandling(
  functionName: string,
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    EdgeErrorHandler.setFunctionName(functionName);
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
    
    try {
      EdgeErrorHandler.logInfo('Début de traitement', {
        method: req.method,
        url: req.url,
        requestId
      });
      
      const response = await handler(req);
      
      EdgeErrorHandler.logInfo('Traitement terminé avec succès', {
        status: response.status,
        requestId
      });
      
      return response;
    } catch (error) {
      return EdgeErrorHandler.handleError(error, requestId);
    }
  };
}
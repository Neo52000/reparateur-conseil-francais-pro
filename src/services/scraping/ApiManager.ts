import { logger } from '@/utils/logger';

export interface ApiConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priority: number;
  enabled: boolean;
  inQuarantine: boolean;
  quarantineUntil?: Date;
  lastError?: string;
  lastSuccess?: Date;
  failureCount: number;
  successCount: number;
  averageResponseTime: number;
  maxRetries: number;
  timeout: number;
}

export interface ApiCallResult {
  success: boolean;
  data?: any;
  error?: string;
  responseTime: number;
  apiUsed: string;
}

export interface FallbackOptions {
  enableAutoFallback: boolean;
  maxFailuresBeforeQuarantine: number;
  quarantineDuration: number; // en minutes
  enableNotifications: boolean;
}

/**
 * Service de gestion des APIs avec fallback automatique et contrôle manuel
 */
export class ApiManager {
  private static instance: ApiManager;
  private apis: Map<string, ApiConfig> = new Map();
  private fallbackOptions: FallbackOptions;
  private listeners: ((apis: ApiConfig[]) => void)[] = [];

  private constructor() {
    this.fallbackOptions = {
      enableAutoFallback: true,
      maxFailuresBeforeQuarantine: 3,
      quarantineDuration: 30, // 30 minutes
      enableNotifications: true
    };
    
    this.initializeApis();
    this.loadFromStorage();
    this.startRecoveryTimer();
  }

  public static getInstance(): ApiManager {
    if (!ApiManager.instance) {
      ApiManager.instance = new ApiManager();
    }
    return ApiManager.instance;
  }

  private initializeApis() {
    const defaultApis: Omit<ApiConfig, 'enabled' | 'inQuarantine' | 'failureCount' | 'successCount' | 'averageResponseTime' | 'lastSuccess'>[] = [
      {
        id: 'apify-scraping',
        name: 'apify-scraping',
        displayName: 'Apify Premium',
        description: 'Service de scraping premium avec Apify',
        priority: 1,
        maxRetries: 2,
        timeout: 30000
      },
      {
        id: 'multi-ai-pipeline',
        name: 'multi-ai-pipeline',
        displayName: 'Pipeline Multi-IA',
        description: 'Pipeline de collecte et enrichissement IA',
        priority: 2,
        maxRetries: 2,
        timeout: 60000
      },
      {
        id: 'serper-search',
        name: 'serper-search',
        displayName: 'Serper Search',
        description: 'Recherche avec l\'API Serper',
        priority: 3,
        maxRetries: 1,
        timeout: 15000
      }
    ];

    defaultApis.forEach(api => {
      this.apis.set(api.id, {
        ...api,
        enabled: true,
        inQuarantine: false,
        failureCount: 0,
        successCount: 0,
        averageResponseTime: 0
      });
    });
  }

  /**
   * Obtient la liste des APIs disponibles triées par priorité
   */
  public getAvailableApis(): ApiConfig[] {
    return Array.from(this.apis.values())
      .filter(api => api.enabled && !api.inQuarantine)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Obtient toutes les APIs (même désactivées)
   */
  public getAllApis(): ApiConfig[] {
    return Array.from(this.apis.values())
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Active ou désactive une API
   */
  public setApiEnabled(apiId: string, enabled: boolean): void {
    const api = this.apis.get(apiId);
    if (api) {
      api.enabled = enabled;
      if (enabled) {
        api.inQuarantine = false;
        api.quarantineUntil = undefined;
        api.failureCount = 0;
      }
      this.saveToStorage();
      this.notifyListeners();
      
      logger.info(`API ${apiId} ${enabled ? 'activée' : 'désactivée'}`);
    }
  }

  /**
   * Met une API en quarantaine
   */
  public quarantineApi(apiId: string, reason?: string): void {
    const api = this.apis.get(apiId);
    if (api) {
      api.inQuarantine = true;
      api.quarantineUntil = new Date(Date.now() + this.fallbackOptions.quarantineDuration * 60 * 1000);
      api.lastError = reason;
      this.saveToStorage();
      this.notifyListeners();
      
      logger.warn(`API ${apiId} mise en quarantaine: ${reason}`);
    }
  }

  /**
   * Enregistre le résultat d'un appel API
   */
  public recordApiCall(apiId: string, result: Omit<ApiCallResult, 'apiUsed'>): void {
    const api = this.apis.get(apiId);
    if (!api) return;

    if (result.success) {
      api.successCount++;
      api.lastSuccess = new Date();
      api.failureCount = Math.max(0, api.failureCount - 1); // Réduire le compteur d'échecs
      api.averageResponseTime = (api.averageResponseTime + result.responseTime) / 2;
      
      // Sortir de quarantaine si succès
      if (api.inQuarantine) {
        api.inQuarantine = false;
        api.quarantineUntil = undefined;
        logger.info(`API ${apiId} sortie de quarantaine suite au succès`);
      }
    } else {
      api.failureCount++;
      api.lastError = result.error;
      
      // Mettre en quarantaine automatiquement si trop d'échecs
      if (this.fallbackOptions.enableAutoFallback && 
          api.failureCount >= this.fallbackOptions.maxFailuresBeforeQuarantine) {
        this.quarantineApi(apiId, `Trop d'échecs consécutifs (${api.failureCount})`);
      }
    }

    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Appelle une API avec fallback automatique
   */
  public async callWithFallback<T>(
    apiCall: (apiId: string) => Promise<T>,
    options?: { skipApis?: string[] }
  ): Promise<ApiCallResult & { data?: T }> {
    const availableApis = this.getAvailableApis()
      .filter(api => !options?.skipApis?.includes(api.id));

    if (availableApis.length === 0) {
      return {
        success: false,
        error: 'Aucune API disponible',
        responseTime: 0,
        apiUsed: 'none'
      };
    }

    for (const api of availableApis) {
      const startTime = Date.now();
      
      try {
        logger.info(`Tentative API: ${api.displayName}`);
        
        const data = await Promise.race([
          apiCall(api.id),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), api.timeout)
          )
        ]);

        const responseTime = Date.now() - startTime;
        
        this.recordApiCall(api.id, {
          success: true,
          responseTime
        });

        return {
          success: true,
          data,
          responseTime,
          apiUsed: api.id
        };

      } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        
        this.recordApiCall(api.id, {
          success: false,
          error: errorMessage,
          responseTime
        });

        logger.warn(`Échec API ${api.displayName}: ${errorMessage}`);
        
        // Continuer avec l'API suivante
        continue;
      }
    }

    return {
      success: false,
      error: 'Toutes les APIs ont échoué',
      responseTime: 0,
      apiUsed: 'none'
    };
  }

  /**
   * Récupération automatique des APIs en quarantaine
   */
  private startRecoveryTimer(): void {
    setInterval(() => {
      const now = new Date();
      let hasRecovered = false;

      this.apis.forEach(api => {
        if (api.inQuarantine && api.quarantineUntil && now > api.quarantineUntil) {
          api.inQuarantine = false;
          api.quarantineUntil = undefined;
          api.failureCount = 0;
          hasRecovered = true;
          logger.info(`API ${api.id} récupérée automatiquement`);
        }
      });

      if (hasRecovered) {
        this.saveToStorage();
        this.notifyListeners();
      }
    }, 60000); // Vérifier toutes les minutes
  }

  /**
   * Sauvegarde l'état dans localStorage
   */
  private saveToStorage(): void {
    try {
      const state = {
        apis: Array.from(this.apis.entries()),
        fallbackOptions: this.fallbackOptions,
        timestamp: Date.now()
      };
      localStorage.setItem('apiManager', JSON.stringify(state));
    } catch (error) {
      logger.error('Erreur sauvegarde ApiManager:', error);
    }
  }

  /**
   * Charge l'état depuis localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('apiManager');
      if (stored) {
        const state = JSON.parse(stored);
        
        // Restaurer les APIs
        if (state.apis) {
          state.apis.forEach(([id, config]: [string, ApiConfig]) => {
            const existing = this.apis.get(id);
            if (existing) {
              // Convertir les dates
              if (config.quarantineUntil) {
                config.quarantineUntil = new Date(config.quarantineUntil);
              }
              if (config.lastSuccess) {
                config.lastSuccess = new Date(config.lastSuccess);
              }
              
              this.apis.set(id, { ...existing, ...config });
            }
          });
        }
        
        // Restaurer les options
        if (state.fallbackOptions) {
          this.fallbackOptions = { ...this.fallbackOptions, ...state.fallbackOptions };
        }
      }
    } catch (error) {
      logger.error('Erreur chargement ApiManager:', error);
    }
  }

  /**
   * Ajoute un listener pour les changements d'état
   */
  public addListener(listener: (apis: ApiConfig[]) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Supprime un listener
   */
  public removeListener(listener: (apis: ApiConfig[]) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notifie tous les listeners
   */
  private notifyListeners(): void {
    const apis = this.getAllApis();
    this.listeners.forEach(listener => listener(apis));
  }

  /**
   * Configure les options de fallback
   */
  public setFallbackOptions(options: Partial<FallbackOptions>): void {
    this.fallbackOptions = { ...this.fallbackOptions, ...options };
    this.saveToStorage();
  }

  /**
   * Obtient les options de fallback
   */
  public getFallbackOptions(): FallbackOptions {
    return { ...this.fallbackOptions };
  }

  /**
   * Réinitialise les statistiques d'une API
   */
  public resetApiStats(apiId: string): void {
    const api = this.apis.get(apiId);
    if (api) {
      api.failureCount = 0;
      api.successCount = 0;
      api.averageResponseTime = 0;
      api.lastError = undefined;
      api.inQuarantine = false;
      api.quarantineUntil = undefined;
      this.saveToStorage();
      this.notifyListeners();
    }
  }
}

export const apiManager = ApiManager.getInstance();
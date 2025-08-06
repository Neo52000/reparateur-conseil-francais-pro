/**
 * Utilitaires de performance et monitoring
 */

import { logger } from './logger';

/**
 * Mesure de performance pour les fonctions
 */
export const measurePerformance = <T extends any[], R>(
  name: string,
  fn: (...args: T) => R | Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    
    try {
      const result = await fn(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      logger.debug(`Performance - ${name}:`, {
        duration: `${duration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
      
      // Alert si la fonction prend plus de 2 secondes
      if (duration > 2000) {
        logger.warn(`Performance lente détectée - ${name}:`, {
          duration: `${duration.toFixed(2)}ms`,
          args: args.length > 0 ? 'avec arguments' : 'sans arguments'
        });
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      logger.error(`Erreur dans ${name} après ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  };
};

/**
 * Debounce fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): T {
  let timeout: NodeJS.Timeout | null;
  
  return (function executedFunction(...args: any[]) {
    const later = function () {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  }) as T;
}

/**
 * Throttle fonction
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  
  return (function (...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}

/**
 * Cache avec TTL (Time To Live)
 */
export class TTLCache<K, V> {
  private cache = new Map<K, { value: V; expiry: number }>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 300000) { // 5 minutes par défaut
    this.defaultTTL = defaultTTL;
  }

  set(key: K, value: V, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiry });
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    
    if (!item) return undefined;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  has(key: K): boolean {
    const item = this.cache.get(key);
    
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Analyseur de performance pour les composants React
 */
export class ComponentPerformanceAnalyzer {
  private static measurements = new Map<string, number[]>();
  
  static startMeasurement(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.measurements.has(componentName)) {
        this.measurements.set(componentName, []);
      }
      
      const durations = this.measurements.get(componentName)!;
      durations.push(duration);
      
      // Garde seulement les 100 dernières mesures
      if (durations.length > 100) {
        durations.shift();
      }
      
      logger.debug(`Rendu ${componentName}:`, {
        duration: `${duration.toFixed(2)}ms`,
        average: `${this.getAverageDuration(componentName).toFixed(2)}ms`
      });
    };
  }
  
  static getAverageDuration(componentName: string): number {
    const durations = this.measurements.get(componentName);
    if (!durations || durations.length === 0) return 0;
    
    const sum = durations.reduce((acc, duration) => acc + duration, 0);
    return sum / durations.length;
  }
  
  static getPerformanceReport(): Record<string, { average: number; count: number }> {
    const report: Record<string, { average: number; count: number }> = {};
    
    for (const [componentName, durations] of this.measurements.entries()) {
      report[componentName] = {
        average: this.getAverageDuration(componentName),
        count: durations.length
      };
    }
    
    return report;
  }
}

/**
 * Utilitaire pour mesurer les performances de rendu React
 */
export const usePerformanceMeasurement = (componentName: string) => {
  const startMeasurement = () => {
    return ComponentPerformanceAnalyzer.startMeasurement(componentName);
  };
  
  return { startMeasurement };
};

/**
 * Détecteur de fuites mémoire
 */
export class MemoryLeakDetector {
  private static listeners = new Map<string, number>();
  
  static trackEventListener(eventName: string): void {
    const current = this.listeners.get(eventName) || 0;
    this.listeners.set(eventName, current + 1);
    
    if (current > 50) {
      logger.warn(`Possible fuite mémoire détectée pour l'événement ${eventName}:`, {
        count: current + 1
      });
    }
  }
  
  static untrackEventListener(eventName: string): void {
    const current = this.listeners.get(eventName) || 0;
    if (current > 0) {
      this.listeners.set(eventName, current - 1);
    }
  }
  
  static getListenerReport(): Record<string, number> {
    return Object.fromEntries(this.listeners.entries());
  }
}

/**
 * Optimisation des re-renders avec comparaison profonde
 */
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => deepEqual(a[key], b[key]));
  }
  
  return false;
};
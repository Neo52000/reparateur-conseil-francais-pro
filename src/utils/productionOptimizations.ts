/**
 * Optimisations spécifiques à la production
 */

import { ENVIRONMENT } from '@/config/environment';
import { TTLCache } from './performance';

// Cache global optimisé pour la production
export const ProductionCache = new TTLCache<string, any>(ENVIRONMENT.cache.defaultTTL);

// Optimisation des requêtes réseau
export class NetworkOptimizer {
  private static requestQueue = new Map<string, Promise<any>>();
  
  // Déduplication des requêtes identiques
  static async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key)!;
    }
    
    const promise = requestFn().finally(() => {
      this.requestQueue.delete(key);
    });
    
    this.requestQueue.set(key, promise);
    return promise;
  }
  
  // Batch processing pour les requêtes multiples
  static async batchRequests<T>(
    requests: Array<() => Promise<T>>,
    batchSize: number = 5
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(req => req()));
      results.push(...batchResults);
    }
    
    return results;
  }
}

// Optimisation des re-renders
export class RenderOptimizer {
  private static renderCount = new Map<string, number>();
  
  static trackRender(componentName: string) {
    if (!ENVIRONMENT.isDevelopment) return;
    
    const count = this.renderCount.get(componentName) || 0;
    this.renderCount.set(componentName, count + 1);
    
    if (count > 10) {
      console.warn(`⚠️ Component ${componentName} has rendered ${count + 1} times`);
    }
  }
  
  static getReport() {
    if (!ENVIRONMENT.isDevelopment) return {};
    
    return Object.fromEntries(this.renderCount.entries());
  }
}

// Optimisation mémoire
export class MemoryOptimizer {
  private static intervalId: NodeJS.Timeout | null = null;
  
  static startMemoryMonitoring() {
    if (!ENVIRONMENT.isDevelopment) return;
    
    this.intervalId = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('🧠 Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        });
      }
    }, 30000); // Toutes les 30 secondes
  }
  
  static stopMemoryMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  static forceGarbageCollection() {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }
}

// Optimisation des images
export class ImageOptimizer {
  // Lazy loading des images avec intersection observer
  static setupLazyLoading() {
    if (!('IntersectionObserver' in window)) return;
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        }
      });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
  
  // Préchargement d'images critiques
  static preloadCriticalImages(imageUrls: string[]) {
    imageUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }
}

// Service Worker pour le cache
export class ServiceWorkerManager {
  static async register() {
    if (!('serviceWorker' in navigator)) {
      return;
    }
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker enregistré:', registration);
      
      registration.addEventListener('updatefound', () => {
        console.log('🔄 Nouvelle version disponible');
      });
    } catch (error) {
      console.error('❌ Erreur Service Worker:', error);
    }
  }
  
  static async unregister() {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
  }
}

// Lazy loading pour les modules POS/E-commerce
export class ModuleLoader {
  private static loadedModules = new Set<string>();
  
  static async loadPOSModule() {
    if (this.loadedModules.has('pos')) return;
    
    console.log('📦 Chargement du module POS...');
    // Charger les composants POS de manière asynchrone
    const { POSInterface } = await import('@/components/pos/POSInterface');
    this.loadedModules.add('pos');
    console.log('✅ Module POS chargé');
    return { POSInterface };
  }
  
  static async loadEcommerceModule() {
    if (this.loadedModules.has('ecommerce')) return;
    
    console.log('📦 Chargement du module E-commerce...');
    // Charger les composants E-commerce de manière asynchrone
    const { EcommerceInterface } = await import('@/components/ecommerce/EcommerceInterface');
    this.loadedModules.add('ecommerce');
    console.log('✅ Module E-commerce chargé');
    return { EcommerceInterface };
  }
}

// Cache intelligent avec invalidation
export class IntelligentCache {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  static set(key: string, data: any, ttl: number = 300000) { // 5 minutes par défaut
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  static get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  static invalidate(pattern: string) {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }
  
  static clear() {
    this.cache.clear();
  }
}

// Initialisation des optimisations
export const initProductionOptimizations = () => {
  // Enregistrer le service worker (en développement et production)
  ServiceWorkerManager.register();
  
  // Setup lazy loading des images
  ImageOptimizer.setupLazyLoading();
  
  // Précharger les images critiques
  ImageOptimizer.preloadCriticalImages([
    '/logo-icon.svg',
    // Ajouter d'autres images critiques
  ]);
  
  if (ENVIRONMENT.isDevelopment) {
    // Monitoring en développement
    MemoryOptimizer.startMemoryMonitoring();
    
    // Rapport de performance
    setTimeout(() => {
      console.log('📊 Render Report:', RenderOptimizer.getReport());
    }, 5000);
  }
  
  // Nettoyer le cache périodiquement
  setInterval(() => {
    IntelligentCache.clear();
    console.log('🧹 Cache nettoyé');
  }, 600000); // 10 minutes
};
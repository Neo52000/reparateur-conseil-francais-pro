/**
 * Service de gestion du cache
 * Optimisation cache navigateur et Service Worker
 */

export type CacheStrategy = 'aggressive' | 'balanced' | 'conservative';

export class CacheManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private strategy: CacheStrategy = 'balanced';

  async initialize(strategy: CacheStrategy = 'balanced'): Promise<void> {
    this.strategy = strategy;
    
    await this.setupServiceWorker();
    this.optimizeCacheHeaders();
    this.setupPerformanceObserver();
  }

  private async setupServiceWorker(): Promise<void> {
    // Ne pas enregistrer de SW en développement pour éviter les conflits
    if (import.meta.env.DEV) {
      return;
    }
    
    if ('serviceWorker' in navigator) {
      try {
        // Créer le Service Worker dynamiquement
        const swCode = this.generateServiceWorkerCode();
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);

        this.swRegistration = await navigator.serviceWorker.register(swUrl);
        console.log('Service Worker enregistré avec succès');

        // Nettoyer l'URL blob
        URL.revokeObjectURL(swUrl);
      } catch (error) {
        console.error('Erreur enregistrement Service Worker:', error);
      }
    }
  }

  private generateServiceWorkerCode(): string {
    const cacheConfig = this.getCacheConfig();
    
    return `
      const CACHE_NAME = 'performance-cache-v1';
      const STATIC_CACHE_DURATION = ${cacheConfig.staticDuration};
      const API_CACHE_DURATION = ${cacheConfig.apiDuration};
      
      const STATIC_RESOURCES = [
        '/',
        '/manifest.json',
        '/offline.html'
      ];
      
      // Installation du SW
      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_RESOURCES);
          })
        );
        self.skipWaiting();
      });
      
      // Activation du SW
      self.addEventListener('activate', (event) => {
        event.waitUntil(
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => {
                if (cacheName !== CACHE_NAME) {
                  return caches.delete(cacheName);
                }
              })
            );
          })
        );
        self.clients.claim();
      });
      
      // Stratégie de cache
      self.addEventListener('fetch', (event) => {
        const url = new URL(event.request.url);
        
        // Images - Cache First avec fallback
        if (event.request.destination === 'image') {
          event.respondWith(
            caches.match(event.request).then((response) => {
              if (response) {
                return response;
              }
              
              return fetch(event.request).then((response) => {
                if (response.status === 200) {
                  const responseClone = response.clone();
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                  });
                }
                return response;
              });
            })
          );
        }
        
        // CSS/JS - Stale While Revalidate
        else if (event.request.destination === 'style' || event.request.destination === 'script') {
          event.respondWith(
            caches.match(event.request).then((response) => {
              const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse.status === 200) {
                  const responseClone = networkResponse.clone();
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                  });
                }
                return networkResponse;
              });
              
              return response || fetchPromise;
            })
          );
        }
        
        // API - Network First avec cache fallback
        else if (url.pathname.startsWith('/api/')) {
          event.respondWith(
            fetch(event.request).then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            }).catch(() => {
              return caches.match(event.request);
            })
          );
        }
        
        // Autres ressources - Network First
        else {
          event.respondWith(
            fetch(event.request).catch(() => {
              return caches.match(event.request);
            })
          );
        }
      });
    `;
  }

  private getCacheConfig() {
    switch (this.strategy) {
      case 'aggressive':
        return {
          staticDuration: 2592000000, // 30 jours
          apiDuration: 300000, // 5 minutes
        };
      case 'conservative':
        return {
          staticDuration: 86400000, // 1 jour
          apiDuration: 60000, // 1 minute
        };
      default: // balanced
        return {
          staticDuration: 604800000, // 7 jours  
          apiDuration: 180000, // 3 minutes
        };
    }
  }

  private optimizeCacheHeaders(): void {
    // Injecter les headers de cache via meta tags
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Cache-Control';
    meta.content = 'public, max-age=31536000, immutable'; // 1 an pour assets statiques
    document.head.appendChild(meta);

    // Préconnexion aux domaines externes
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.github.com'
    ];

    preconnectDomains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      // Observer les entrées de navigation
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.analyzeNavigationTiming(navEntry);
          }
        });
      });

      navObserver.observe({ entryTypes: ['navigation'] });

      // Observer les ressources
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.analyzeResourceTiming(entry as PerformanceResourceTiming);
          }
        });
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  private analyzeNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.connectEnd - entry.secureConnectionStart,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      domParsing: entry.domContentLoadedEventStart - entry.responseEnd,
      resourceLoading: entry.loadEventStart - entry.domContentLoadedEventEnd
    };

    console.log('Navigation Timing:', metrics);

    // Recommandations basées sur les métriques
    if (metrics.dns > 100) {
      console.warn('DNS lent détecté - considérer un préchargement DNS');
    }

    if (metrics.ttfb > 500) {
      console.warn('TTFB lent détecté - optimiser le serveur backend');
    }
  }

  private analyzeResourceTiming(entry: PerformanceResourceTiming): void {
    const duration = entry.responseEnd - entry.startTime;
    const size = entry.transferSize || 0;

    // Détecter les ressources lentes
    if (duration > 1000) {
      console.warn(`Ressource lente détectée: ${entry.name} (${duration}ms)`);
    }

    // Détecter les grosses ressources
    if (size > 1024 * 1024) { // > 1MB
      console.warn(`Grosse ressource détectée: ${entry.name} (${(size / 1024 / 1024).toFixed(2)}MB)`);
    }
  }

  /**
   * Vider le cache
   */
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }
  }

  /**
   * Précharger des ressources critiques
   */
  preloadCriticalResources(urls: string[]): void {
    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      // Déterminer le type de ressource
      if (url.match(/\.(css)$/)) {
        link.as = 'style';
      } else if (url.match(/\.(js)$/)) {
        link.as = 'script';
      } else if (url.match(/\.(woff2|woff)$/)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      } else if (url.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = 'image';
      }
      
      document.head.appendChild(link);
    });
  }

  destroy(): void {
    if (this.swRegistration) {
      this.swRegistration.unregister();
    }
  }
}
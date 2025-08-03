import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy loading des modules POS
const LazyReportsAnalytics = lazy(() => import('./modules/ReportsAnalytics'));
const LazyHardwareIntegration = lazy(() => import('./modules/HardwareIntegration'));
const LazyOfflineManager = lazy(() => import('./modules/OfflineManager'));

// Composants de fallback pour le loading
const ModuleLoader = ({ title }: { title: string }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Skeleton className="h-5 w-5" />
      <Skeleton className="h-6 w-48" />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-16 w-full" />
    </div>
  </div>
);

// HOC pour optimisation des performances
export const withPerformanceOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
) => {
  const OptimizedComponent = React.memo((props: P) => {
    return (
      <Suspense fallback={<ModuleLoader title={displayName || 'Module'} />}>
        <Component {...props} />
      </Suspense>
    );
  });

  OptimizedComponent.displayName = `withPerformanceOptimization(${displayName || Component.displayName || 'Component'})`;
  
  return OptimizedComponent;
};

// Composants optimisés
export const OptimizedReportsAnalytics = withPerformanceOptimization(LazyReportsAnalytics, 'Reports & Analytics');
export const OptimizedHardwareIntegration = withPerformanceOptimization(LazyHardwareIntegration, 'Hardware Integration');
export const OptimizedOfflineManager = withPerformanceOptimization(LazyOfflineManager, 'Offline Manager');

// Hook pour préchargement conditionnel
export const usePrefetchModules = () => {
  React.useEffect(() => {
    // Précharger les modules après un délai pour ne pas impacter le chargement initial
    const prefetchTimer = setTimeout(() => {
      // Précharger seulement si l'utilisateur semble actif
      if (document.hasFocus()) {
        import('./modules/ReportsAnalytics');
        import('./modules/HardwareIntegration');
        import('./modules/OfflineManager');
      }
    }, 3000);

    return () => clearTimeout(prefetchTimer);
  }, []);
};

// Service de cache intelligent
class PerformanceCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 100;

  set(key: string, data: any, ttl = 5 * 60 * 1000) { // 5 minutes par défaut
    // Nettoyage du cache si trop plein
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Vérifier l'expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  // Nettoyage automatique des entrées expirées
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const performanceCache = new PerformanceCache();

// Nettoyage automatique du cache toutes les 5 minutes
setInterval(() => {
  performanceCache.cleanup();
}, 5 * 60 * 1000);

// Hook pour optimisation des requêtes avec cache
export function useOptimizedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: { ttl?: number; enabled?: boolean } = {}
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const { ttl = 5 * 60 * 1000, enabled = true } = options;

  React.useEffect(() => {
    if (!enabled) return;

    const cachedData = performanceCache.get(key);
    if (cachedData) {
      setData(cachedData);
      return;
    }

    setLoading(true);
    setError(null);

    queryFn()
      .then(result => {
        setData(result);
        performanceCache.set(key, result, ttl);
      })
      .catch(err => {
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, enabled, ttl]);

  return { data, loading, error };
}

// Débounce pour optimiser les saisies
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook pour optimisation des listes longues (virtualisation)
export const useVirtualizedList = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};
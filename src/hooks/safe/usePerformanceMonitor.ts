// Hook de performance pour monitorer les performances de l'application
import { useCallback, useEffect, useRef } from 'react';
import { useLogger } from './useLogger';

export const usePerformanceMonitor = (componentName: string) => {
  const { logInfo, logWarn } = useLogger(componentName);
  const renderStartTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);

  // Surveillance des re-renders
  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - renderStartTime.current;
    
    if (renderCount.current > 1 && renderTime > 100) {
      logWarn(`Render potentiellement lent`, { 
        renderTime: `${renderTime}ms`,
        renderCount: renderCount.current
      });
    }
    
    renderStartTime.current = Date.now();
  });

  // Mesure du temps de montage du composant
  const measureMountTime = useCallback((startTime: number) => {
    const mountTime = Date.now() - startTime;
    logInfo(`Composant monté`, { mountTime: `${mountTime}ms` });
    
    if (mountTime > 1000) {
      logWarn(`Temps de montage élevé`, { mountTime: `${mountTime}ms` });
    }
  }, [logInfo, logWarn]);

  // Hook pour mesurer les performances d'une fonction
  const measureFunction = useCallback(<T extends any[], R>(
    fn: (...args: T) => R,
    functionName: string
  ) => {
    return (...args: T): R => {
      const startTime = Date.now();
      const result = fn(...args);
      const executionTime = Date.now() - startTime;
      
      if (executionTime > 50) {
        logWarn(`Fonction lente détectée`, {
          function: functionName,
          executionTime: `${executionTime}ms`
        });
      }
      
      return result;
    };
  }, [logWarn]);

  return {
    measureMountTime,
    measureFunction,
    renderCount: renderCount.current
  };
};
// Hook pour monitorer et nettoyer les ressources
import { useEffect, useRef } from 'react';
import { useLogger } from './useLogger';

export const useResourceMonitor = () => {
  const { logInfo, logWarn, logError } = useLogger('ResourceMonitor');
  const timeouts = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervals = useRef<Set<NodeJS.Timeout>>(new Set());
  const eventListeners = useRef<Array<{ element: EventTarget; event: string; handler: EventListener }>>([]); 

  // Wrapper pour setTimeout avec nettoyage automatique
  const safeSetTimeout = (callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      timeouts.current.delete(timeout);
      callback();
    }, delay);
    
    timeouts.current.add(timeout);
    return timeout;
  };

  // Wrapper pour setInterval avec nettoyage automatique  
  const safeSetInterval = (callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay);
    intervals.current.add(interval);
    return interval;
  };

  // Wrapper pour addEventListener avec nettoyage automatique
  const safeAddEventListener = (
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    eventListeners.current.push({ element, event, handler });
  };

  // Nettoyage automatique lors du démontage
  useEffect(() => {
    return () => {
      // Nettoyer les timeouts
      timeouts.current.forEach(timeout => {
        clearTimeout(timeout);
      });
      timeouts.current.clear();

      // Nettoyer les intervals
      intervals.current.forEach(interval => {
        clearInterval(interval);
      });
      intervals.current.clear();

      // Nettoyer les event listeners
      eventListeners.current.forEach(({ element, event, handler }) => {
        try {
          element.removeEventListener(event, handler);
        } catch (error) {
          logError('Erreur lors du nettoyage d\'un event listener', error);
        }
      });
      eventListeners.current = [];

      logInfo('Ressources nettoyées automatiquement');
    };
  }, [logInfo, logError]);

  // Fonction pour obtenir des statistiques sur les ressources
  const getResourceStats = () => ({
    activeTimeouts: timeouts.current.size,
    activeIntervals: intervals.current.size,
    activeEventListeners: eventListeners.current.length
  });

  // Alertes si trop de ressources actives
  useEffect(() => {
    const checkResources = () => {
      const stats = getResourceStats();
      
      if (stats.activeTimeouts > 10) {
        logWarn('Nombre élevé de timeouts actifs', stats);
      }
      
      if (stats.activeEventListeners > 20) {
        logWarn('Nombre élevé d\'event listeners actifs', stats);
      }
    };

    const monitor = setInterval(checkResources, 30000); // Vérifier toutes les 30s
    
    return () => clearInterval(monitor);
  }, [logWarn]);

  return {
    safeSetTimeout,
    safeSetInterval,
    safeAddEventListener,
    getResourceStats
  };
};
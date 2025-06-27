
import { useState } from 'react';
import { useScrapingLogs } from './useScrapingLogs';
import { useScrapingOperations } from './useScrapingOperations';

export const useScrapingStatus = () => {
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  
  const {
    logs,
    loading,
    isScrapingRunning,
    refetch
  } = useScrapingLogs(autoRefreshEnabled);

  const {
    startScraping: originalStartScraping,
    stopScraping: originalStopScraping
  } = useScrapingOperations();

  // Récupérer le dernier log
  const latestLog = logs.length > 0 ? logs[0] : undefined;

  const handleStartScraping = async (source: string, testMode: boolean = false, departmentCode: string | null = null) => {
    try {
      const result = await originalStartScraping(source, testMode, departmentCode);
      // Forcer un refresh immédiat pour détecter le nouveau scraping
      setTimeout(() => {
        console.log('🔄 Refresh automatique après démarrage du scraping');
        refetch();
      }, 2000);
      return result;
    } catch (error) {
      // Le refresh se fera automatiquement même en cas d'erreur
      setTimeout(refetch, 1000);
      throw error;
    }
  };

  const handleStopScraping = async () => {
    try {
      const result = await originalStopScraping();
      // Forcer un refresh immédiat pour mettre à jour le statut
      setTimeout(() => {
        console.log('🔄 Refresh automatique après arrêt du scraping');
        refetch();
      }, 1000);
      return result;
    } catch (error) {
      // Refresh même en cas d'erreur pour voir les changements
      setTimeout(refetch, 1000);
      throw error;
    }
  };

  return {
    logs,
    loading,
    isScrapingRunning,
    latestLog,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    startScraping: handleStartScraping,
    stopScraping: handleStopScraping,
    refetch
  };
};

export type { ScrapingLog } from './useScrapingStatusTypes';

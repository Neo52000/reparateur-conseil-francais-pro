
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
    startScraping,
    stopScraping
  } = useScrapingOperations();

  const handleStartScraping = async (source: string, testMode: boolean = false, departmentCode: string | null = null) => {
    const result = await startScraping(source, testMode, departmentCode);
    setTimeout(refetch, 2000);
    return result;
  };

  const handleStopScraping = async () => {
    const result = await stopScraping();
    setTimeout(refetch, 1000);
    return result;
  };

  return {
    logs,
    loading,
    isScrapingRunning,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    startScraping: handleStartScraping,
    stopScraping: handleStopScraping,
    refetch
  };
};

export type { ScrapingLog } from './useScrapingStatusTypes';

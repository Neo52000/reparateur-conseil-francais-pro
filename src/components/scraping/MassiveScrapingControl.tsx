
import React, { useState } from 'react';
import { useScrapingStatus } from '@/hooks/useScrapingStatus';
import { useToast } from '@/hooks/use-toast';
import MassiveScrapingStats from './MassiveScrapingStats';
import MassiveScrapingInterface from './MassiveScrapingInterface';

const MassiveScrapingControl = () => {
  const { startScraping, stopScraping, isScrapingRunning, logs } = useScrapingStatus();
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const handleMassiveScraping = async (source: string, test: boolean = false) => {
    try {
      const departmentCode = selectedDepartment === 'all' ? null : selectedDepartment;
      
      await startScraping(source, test, departmentCode);
      
      if (!test) {
        toast({
          title: "🚀 Scraping Massif Démarré",
          description: `Extraction en cours ${departmentCode ? `pour le département ${departmentCode}` : 'pour toute la France'}. Cela peut prendre plusieurs heures.`,
        });
      }
    } catch (error) {
      console.error('Erreur scraping massif:', error);
      toast({
        title: "Erreur de scraping",
        description: "Impossible de démarrer le scraping massif. Vérifiez les logs.",
        variant: "destructive"
      });
    }
  };

  const handleStopScraping = async () => {
    try {
      await stopScraping();
    } catch (error) {
      console.error('Erreur arrêt scraping:', error);
    }
  };

  const latestLog = logs[0];
  const getProgress = () => {
    if (!latestLog) return 0;
    if (latestLog.status === 'completed') return 100;
    if (latestLog.status === 'running') return 50;
    return 0;
  };

  const getTotalStats = () => {
    const completedLogs = logs.filter(log => log.status === 'completed');
    const totalAdded = completedLogs.reduce((sum, log) => sum + (log.items_added || 0), 0);
    const totalUpdated = completedLogs.reduce((sum, log) => sum + (log.items_updated || 0), 0);
    return { totalAdded, totalUpdated, totalProcessed: totalAdded + totalUpdated };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      <MassiveScrapingStats
        totalAdded={stats.totalAdded}
        totalUpdated={stats.totalUpdated}
        totalProcessed={stats.totalProcessed}
      />

      <MassiveScrapingInterface
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        isScrapingRunning={isScrapingRunning}
        latestLog={latestLog}
        onMassiveScraping={handleMassiveScraping}
        onStopScraping={handleStopScraping}
        getProgress={getProgress}
      />
    </div>
  );
};

export default MassiveScrapingControl;

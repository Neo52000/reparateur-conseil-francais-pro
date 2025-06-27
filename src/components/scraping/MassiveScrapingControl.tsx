
import React, { useState } from 'react';
import { useScrapingAuth } from '@/hooks/scraping/useScrapingAuth';
import { useScrapingStatus } from '@/hooks/scraping/useScrapingStatus';
import AuthenticationStatus from './AuthenticationStatus';
import MassiveScrapingInterface from './MassiveScrapingInterface';

const MassiveScrapingControl = () => {
  const { user, isAdmin, checkAuthAndPermissions } = useScrapingAuth();
  const { 
    isScrapingRunning, 
    latestLog, 
    startScraping, 
    stopScraping, 
    loading: authLoading 
  } = useScrapingStatus();
  
  const [selectedDepartment, setSelectedDepartment] = useState("75"); // Default to Paris

  if (!checkAuthAndPermissions()) {
    return (
      <AuthenticationStatus
        authLoading={authLoading}
        user={user}
        isAdmin={isAdmin}
        profile={user}
      />
    );
  }

  const handleMassiveScraping = async (source: string, isTest: boolean) => {
    console.log('🚀 Starting massive scraping:', { source, isTest, selectedDepartment });
    // Corriger l'ordre des paramètres: source, testMode, departmentCode
    await startScraping(source, isTest, selectedDepartment);
  };

  const handleStopScraping = async () => {
    console.log('🛑 Stopping scraping from MassiveScrapingControl');
    await stopScraping();
  };

  const getProgress = () => {
    if (!latestLog || latestLog.status !== 'running') return 0;
    
    const total = (latestLog.items_added || 0) + (latestLog.items_updated || 0) + (latestLog.items_scraped || 0);
    return Math.min(total * 2, 100); // Simple progress estimation
  };

  return (
    <MassiveScrapingInterface
      selectedDepartment={selectedDepartment}
      onDepartmentChange={setSelectedDepartment}
      isScrapingRunning={isScrapingRunning}
      latestLog={latestLog}
      onMassiveScraping={handleMassiveScraping}
      onStopScraping={handleStopScraping}
      getProgress={getProgress}
    />
  );
};

export default MassiveScrapingControl;

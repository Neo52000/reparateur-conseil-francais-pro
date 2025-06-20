import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Square, AlertTriangle } from 'lucide-react';
import DepartmentSelector from './DepartmentSelector';
import ScrapingSourceCard from './ScrapingSourceCard';
import ScrapingStatusIndicator from './ScrapingStatusIndicator';
import ScrapingInfoPanel from './ScrapingInfoPanel';
import { ScrapingLog } from '@/hooks/scraping/useScrapingStatus';

interface MassiveScrapingInterfaceProps {
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  isScrapingRunning: boolean;
  latestLog: ScrapingLog | undefined;
  onMassiveScraping: (source: string, test: boolean) => void;
  onStopScraping: () => void;
  getProgress: () => number;
}

const MassiveScrapingInterface = ({
  selectedDepartment,
  onDepartmentChange,
  isScrapingRunning,
  latestLog,
  onMassiveScraping,
  onStopScraping,
  getProgress,
}: MassiveScrapingInterfaceProps) => {
  
  console.log('🔍 MassiveScrapingInterface render:', {
    isScrapingRunning,
    latestLog: latestLog ? {
      id: latestLog.id,
      status: latestLog.status,
      source: latestLog.source,
      completed_at: latestLog.completed_at
    } : null
  });

  // Déterminer si un scraping est vraiment en cours
  const isActuallyRunning = isScrapingRunning && latestLog?.status === 'running' && !latestLog?.completed_at;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-red-600" />
            Scraping Massif - Tous les Réparateurs de France
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isActuallyRunning 
                ? 'bg-red-100 text-red-800 animate-pulse' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isActuallyRunning ? '🔴 SCRAPING ACTIF' : '⚪ INACTIF'}
            </div>
            
            {isActuallyRunning && (
              <Button 
                onClick={() => {
                  console.log('🛑 Clic sur le bouton STOP');
                  console.log('🛑 État au moment du clic:', { isScrapingRunning, latestLog });
                  onStopScraping();
                }}
                variant="destructive"
                size="sm"
                className="animate-pulse bg-red-600 hover:bg-red-700 text-white font-bold border-2 border-red-700"
              >
                <Square className="h-4 w-4 mr-2" />
                ARRÊTER MAINTENANT
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alerte de debug améliorée */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">État Scraping Debug</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 space-y-1">
            <p><strong>isScrapingRunning:</strong> {isScrapingRunning ? 'TRUE ✅' : 'FALSE ❌'}</p>
            <p><strong>isActuallyRunning:</strong> {isActuallyRunning ? 'TRUE ✅' : 'FALSE ❌'}</p>
            <p><strong>latestLog status:</strong> {latestLog?.status || 'NONE'}</p>
            <p><strong>latestLog source:</strong> {latestLog?.source || 'NONE'}</p>
            <p><strong>latestLog completed_at:</strong> {latestLog?.completed_at ? 'OUI' : 'NON'}</p>
            <p><strong>Bouton STOP visible:</strong> {isActuallyRunning ? 'OUI ✅' : 'NON ❌'}</p>
          </div>
        </div>

        <DepartmentSelector
          selectedDepartment={selectedDepartment}
          onDepartmentChange={onDepartmentChange}
        />

        <ScrapingStatusIndicator
          isScrapingRunning={isScrapingRunning}
          latestLog={latestLog}
          getProgress={getProgress}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScrapingSourceCard
            title="Pages Jaunes"
            estimatedCount="~25 réparateurs"
            description="Scraping avec géolocalisation précise des grandes villes françaises"
            source="pages_jaunes"
            isScrapingRunning={isScrapingRunning}
            onTest={() => onMassiveScraping('pages_jaunes', true)}
            onMassiveScraping={() => onMassiveScraping('pages_jaunes', false)}
          />

          <ScrapingSourceCard
            title="Google Places"
            estimatedCount="~8 réparateurs"
            description="Extraction géolocalisée par communes françaises"
            source="google_places"
            isScrapingRunning={isScrapingRunning}
            onTest={() => onMassiveScraping('google_places', true)}
            onMassiveScraping={() => onMassiveScraping('google_places', false)}
          />
        </div>

        <ScrapingInfoPanel />
      </CardContent>
    </Card>
  );
};

export default MassiveScrapingInterface;

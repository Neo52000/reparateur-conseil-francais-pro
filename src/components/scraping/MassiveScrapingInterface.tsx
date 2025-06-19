
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
  
  // Debug log pour voir l'état du bouton
  console.log('🔍 MassiveScrapingInterface render:', {
    isScrapingRunning,
    latestLog: latestLog ? {
      id: latestLog.id,
      status: latestLog.status,
      source: latestLog.source
    } : null
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-red-600" />
            Scraping Massif - Tous les Réparateurs de France
          </div>
          
          {/* Bouton STOP toujours visible pour debug - avec état forcé */}
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded text-xs ${
              isScrapingRunning 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isScrapingRunning ? 'SCRAPING ACTIF' : 'INACTIF'}
            </div>
            
            {/* Bouton STOP maintenant visible même quand inactif pour test */}
            <Button 
              onClick={() => {
                console.log('🛑 Clic sur le bouton STOP');
                console.log('🛑 État au moment du clic:', { isScrapingRunning, latestLog });
                onStopScraping();
              }}
              variant={isScrapingRunning ? "destructive" : "outline"}
              size="sm"
              className={isScrapingRunning 
                ? "animate-pulse bg-red-600 hover:bg-red-700 text-white font-bold" 
                : "bg-gray-300 text-gray-600"
              }
            >
              <Square className="h-4 w-4 mr-2" />
              {isScrapingRunning ? 'ARRÊTER MAINTENANT' : 'AUCUN SCRAPING'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alerte de debug permanente pour voir l'état */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">État Scraping Debug</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 space-y-1">
            <p><strong>isScrapingRunning:</strong> {isScrapingRunning ? 'TRUE ✅' : 'FALSE ❌'}</p>
            <p><strong>latestLog status:</strong> {latestLog?.status || 'NONE'}</p>
            <p><strong>latestLog source:</strong> {latestLog?.source || 'NONE'}</p>
            <p><strong>Bouton STOP visible:</strong> {isScrapingRunning ? 'OUI ✅' : 'NON ❌'}</p>
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
            estimatedCount="~15,000 réparateurs"
            description="Scraping massif par département avec rotation anti-blocage"
            source="pages_jaunes"
            isScrapingRunning={isScrapingRunning}
            onTest={() => onMassiveScraping('pages_jaunes', true)}
            onMassiveScraping={() => onMassiveScraping('pages_jaunes', false)}
          />

          <ScrapingSourceCard
            title="Google Places"
            estimatedCount="~8,000 réparateurs"
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

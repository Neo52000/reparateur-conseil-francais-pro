
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
          
          {/* Bouton STOP plus visible avec conditions de debug */}
          {isScrapingRunning ? (
            <div className="flex items-center space-x-2">
              <div className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                SCRAPING ACTIF
              </div>
              <Button 
                onClick={() => {
                  console.log('🛑 Clic sur le bouton STOP');
                  onStopScraping();
                }}
                variant="destructive"
                size="sm"
                className="animate-pulse bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                <Square className="h-4 w-4 mr-2" />
                ARRÊTER MAINTENANT
              </Button>
            </div>
          ) : (
            <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              INACTIF
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alerte de debug pour voir l'état */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Debug Info</span>
            </div>
            <div className="mt-2 text-xs text-yellow-700">
              <p>isScrapingRunning: {isScrapingRunning ? 'TRUE' : 'FALSE'}</p>
              <p>latestLog status: {latestLog?.status || 'NONE'}</p>
              <p>latestLog source: {latestLog?.source || 'NONE'}</p>
            </div>
          </div>
        )}

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

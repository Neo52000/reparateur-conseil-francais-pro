
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import DepartmentSelector from './DepartmentSelector';
import ScrapingSourceCard from './ScrapingSourceCard';
import ScrapingStatusIndicator from './ScrapingStatusIndicator';
import ScrapingInfoPanel from './ScrapingInfoPanel';
import { ScrapingLog } from '@/hooks/useScrapingStatus';

interface MassiveScrapingInterfaceProps {
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  isScrapingRunning: boolean;
  latestLog: ScrapingLog | undefined;
  onMassiveScraping: (source: string, test: boolean) => void;
  getProgress: () => number;
}

const MassiveScrapingInterface = ({
  selectedDepartment,
  onDepartmentChange,
  isScrapingRunning,
  latestLog,
  onMassiveScraping,
  getProgress,
}: MassiveScrapingInterfaceProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2 text-red-600" />
          Scraping Massif - Tous les Réparateurs de France
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { ScrapingLog } from '@/hooks/scraping/useScrapingStatus';

interface ScrapingStatusIndicatorProps {
  isScrapingRunning: boolean;
  latestLog: ScrapingLog | undefined;
  getProgress: () => number;
}

const ScrapingStatusIndicator = ({ isScrapingRunning, latestLog, getProgress }: ScrapingStatusIndicatorProps) => {
  if (isScrapingRunning && latestLog) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin text-red-600" />
            <span className="font-medium text-red-900">
              Scraping MASSIF en cours: {latestLog.source}
            </span>
          </div>
          <Badge variant="destructive">
            Extraction Illimitée
          </Badge>
        </div>
        <Progress value={getProgress()} className="mb-2" />
        <p className="text-sm text-red-700">
          Scraping éthique avec anti-blocage en cours...
        </p>
      </div>
    );
  }

  if (latestLog && latestLog.status === 'completed') {
    return (
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-900">
            Dernier scraping terminé
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-green-700">Éléments traités</p>
            <p className="font-bold text-green-900">{latestLog.items_scraped}</p>
          </div>
          <div>
            <p className="text-green-700">Ajoutés</p>
            <p className="font-bold text-green-900">{latestLog.items_added}</p>
          </div>
          <div>
            <p className="text-green-700">Mis à jour</p>
            <p className="font-bold text-green-900">{latestLog.items_updated}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ScrapingStatusIndicator;

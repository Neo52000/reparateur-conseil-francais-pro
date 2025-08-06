
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, TestTube } from 'lucide-react';

interface ScrapingActionButtonsProps {
  isRunning: boolean;
  onStartTest: () => void;
  onStartMassive: () => void;
  onStop: () => void;
}

const ScrapingActionButtons: React.FC<ScrapingActionButtonsProps> = ({
  isRunning,
  onStartTest,
  onStartMassive,
  onStop
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={onStartTest}
        disabled={isRunning}
        variant="outline"
        className="flex-1 min-w-0"
      >
        <TestTube className="h-4 w-4 mr-2" />
        Test (10 résultats)
      </Button>
      
      <Button
        onClick={onStartMassive}
        disabled={isRunning}
        className="flex-1 min-w-0"
      >
        <Play className="h-4 w-4 mr-2" />
        Scraping Massif
      </Button>
      
      <Button
        onClick={onStop}
        disabled={!isRunning}
        variant="destructive"
        className="flex-1 min-w-0"
      >
        <Square className="h-4 w-4 mr-2" />
        Arrêter
      </Button>
    </div>
  );
};

export default ScrapingActionButtons;

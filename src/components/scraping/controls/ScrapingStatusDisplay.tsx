
import React from 'react';

interface ScrapingStatusDisplayProps {
  isRunning: boolean;
}

const ScrapingStatusDisplay: React.FC<ScrapingStatusDisplayProps> = ({ isRunning }) => {
  if (!isRunning) return null;

  return (
    <div className="p-3 bg-green-50 rounded-lg">
      <div className="flex items-center">
        <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full mr-2"></div>
        <span className="text-green-800 font-medium">Scraping en cours...</span>
      </div>
      <p className="text-sm text-green-700 mt-1">
        Le scraping est en cours d'exécution. Les résultats apparaîtront automatiquement.
      </p>
    </div>
  );
};

export default ScrapingStatusDisplay;


import React from 'react';
import { ScrapingLog } from '@/hooks/useScrapingStatus';

interface HistoryStatsProps {
  logs: ScrapingLog[];
}

const HistoryStats: React.FC<HistoryStatsProps> = ({ logs }) => {
  return (
    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
      <div className="text-center">
        <div className="text-lg font-semibold text-green-600">
          {logs.filter(l => l.status === 'completed').length}
        </div>
        <div className="text-xs text-gray-500">Succès</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-red-600">
          {logs.filter(l => l.status === 'failed').length}
        </div>
        <div className="text-xs text-gray-500">Échecs</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-blue-600">
          {logs.filter(l => l.status === 'running').length}
        </div>
        <div className="text-xs text-gray-500">En cours</div>
      </div>
    </div>
  );
};

export default HistoryStats;

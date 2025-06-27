
import React from 'react';

interface MapResultsCounterProps {
  count: number;
}

const MapResultsCounter: React.FC<MapResultsCounterProps> = ({ count }) => {
  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 z-10">
      <span className="text-sm font-medium text-gray-900">
        {count} réparateur{count !== 1 ? 's' : ''} trouvé{count !== 1 ? 's' : ''}
      </span>
    </div>
  );
};

export default MapResultsCounter;

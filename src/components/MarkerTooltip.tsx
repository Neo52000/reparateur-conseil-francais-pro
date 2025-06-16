
import React from 'react';
import { RepairerDB } from '@/hooks/useRepairers';

interface MarkerTooltipProps {
  repairer: RepairerDB;
  visible: boolean;
  position: { x: number; y: number };
}

const MarkerTooltip: React.FC<MarkerTooltipProps> = ({ repairer, visible, position }) => {
  if (!visible) return null;

  return (
    <div 
      className="fixed z-[10000] bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
      style={{
        left: `${position.x + 10}px`,
        top: `${position.y - 60}px`,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="text-sm">
        <p className="font-semibold text-gray-900">{repairer.name}</p>
        {repairer.phone && (
          <p className="text-gray-600">📞 {repairer.phone}</p>
        )}
      </div>
      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
    </div>
  );
};

export default MarkerTooltip;

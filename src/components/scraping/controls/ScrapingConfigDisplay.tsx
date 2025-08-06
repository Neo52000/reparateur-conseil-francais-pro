
import React from 'react';
import { Database, MapPin, Zap } from 'lucide-react';
import { SOURCES } from './scrapingConstants';

interface ScrapingConfigDisplayProps {
  selectedSource: string;
  selectedDepartment: string;
  selectedAI: string;
}

const ScrapingConfigDisplay: React.FC<ScrapingConfigDisplayProps> = ({
  selectedSource,
  selectedDepartment,
  selectedAI
}) => {
  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h4 className="font-semibold text-blue-900 mb-2">Configuration actuelle</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="flex items-center">
          <Database className="h-4 w-4 mr-2 text-blue-600" />
          <span><strong>Source:</strong> {SOURCES.find(s => s.id === selectedSource)?.name}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-blue-600" />
          <span><strong>Zone:</strong> {selectedDepartment === 'all' ? 'Toute la France' : `Département ${selectedDepartment}`}</span>
        </div>
        <div className="flex items-center">
          <Zap className="h-4 w-4 mr-2 text-blue-600" />
          <span><strong>IA:</strong> {selectedAI}</span>
        </div>
      </div>
    </div>
  );
};

export default ScrapingConfigDisplay;

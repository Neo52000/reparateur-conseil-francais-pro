
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AIOption } from './types';
import StatusBadge from './StatusBadge';

interface AIOptionCardProps {
  ai: AIOption;
  isSelected: boolean;
  onSelect: (aiId: string) => void;
}

const AIOptionCard: React.FC<AIOptionCardProps> = ({ ai, isSelected, onSelect }) => {
  const Icon = ai.icon;
  
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      onClick={() => onSelect(ai.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Icon className="h-5 w-5 mr-2 text-blue-600" />
          <h3 className="font-semibold">{ai.name}</h3>
        </div>
        <StatusBadge status={ai.status} />
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{ai.description}</p>
      
      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-gray-500">Capacités:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {ai.capabilities.map((cap, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {cap}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <p className="text-xs font-medium text-gray-500">Tarif:</p>
          <p className="text-xs text-gray-600">{ai.pricing}</p>
        </div>
      </div>
    </div>
  );
};

export default AIOptionCard;

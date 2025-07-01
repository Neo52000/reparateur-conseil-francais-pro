
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface PlanToggleProps {
  isYearly: boolean;
  onToggle: (checked: boolean) => void;
}

const PlanToggle: React.FC<PlanToggleProps> = ({ isYearly, onToggle }) => {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
        Mensuel
      </span>
      <Switch
        checked={isYearly}
        onCheckedChange={onToggle}
      />
      <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
        Annuel
      </span>
      {isYearly && (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          -10% de réduction
        </Badge>
      )}
    </div>
  );
};

export default PlanToggle;

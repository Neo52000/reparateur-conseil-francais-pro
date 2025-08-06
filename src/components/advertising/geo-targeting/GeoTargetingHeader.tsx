
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Plus } from 'lucide-react';

interface GeoTargetingHeaderProps {
  onCreateZone: () => void;
}

const GeoTargetingHeader: React.FC<GeoTargetingHeaderProps> = ({ onCreateZone }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-blue-500" />
          Géofencing & Ciblage Géographique
        </h2>
        <p className="text-gray-600">Zones de ciblage géographique avancées</p>
      </div>
      <Button onClick={onCreateZone}>
        <Plus className="h-4 w-4 mr-2" />
        Nouvelle zone
      </Button>
    </div>
  );
};

export default GeoTargetingHeader;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';

interface MapControlsProps {
  onGetLocation: () => void;
  isLocating: boolean;
  hasMap: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({
  onGetLocation,
  isLocating,
  hasMap
}) => {
  return (
    <div className="flex space-x-2">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onGetLocation}
        disabled={isLocating || !hasMap}
      >
        <Navigation className="h-4 w-4 mr-2" />
        {isLocating ? 'Localisation...' : 'Ma position'}
      </Button>
    </div>
  );
};

export default MapControls;

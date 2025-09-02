import React from 'react';
import InteractiveMapWithFilters from '@/components/map/InteractiveMapWithFilters';

interface MapWithFiltersProps {
  onBack?: () => void;
}

const MapWithFilters: React.FC<MapWithFiltersProps> = ({ onBack }) => {
  return <InteractiveMapWithFilters onBack={onBack} />;
};

export default MapWithFilters;
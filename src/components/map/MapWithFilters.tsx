import React from 'react';
import EnhancedRepairersMap from '@/components/search/EnhancedRepairersMap';

interface MapWithFiltersProps {
  onBack?: () => void;
  searchFilters?: any;
}

const MapWithFilters: React.FC<MapWithFiltersProps> = ({ onBack, searchFilters }) => {
  return <EnhancedRepairersMap onClose={onBack} searchFilters={searchFilters} />;
};

export default MapWithFilters;
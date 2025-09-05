import React from 'react';
import EnhancedRepairersMap from '@/components/search/EnhancedRepairersMap';

interface MapWithFiltersProps {
  onBack?: () => void;
}

const MapWithFilters: React.FC<MapWithFiltersProps> = ({ onBack }) => {
  return <EnhancedRepairersMap onClose={onBack} />;
};

export default MapWithFilters;
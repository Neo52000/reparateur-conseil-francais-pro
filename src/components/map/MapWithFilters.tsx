import React, { Suspense } from 'react';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

// Lazy load the interactive map component
const InteractiveMapWithFilters = React.lazy(() => import('@/components/map/InteractiveMapWithFilters'));

interface MapWithFiltersProps {
  onBack?: () => void;
}

const MapWithFilters: React.FC<MapWithFiltersProps> = ({ onBack }) => {
  return (
    <Suspense fallback={<LoadingSkeleton variant="map" />}>
      <InteractiveMapWithFilters onBack={onBack} />
    </Suspense>
  );
};

export default MapWithFilters;
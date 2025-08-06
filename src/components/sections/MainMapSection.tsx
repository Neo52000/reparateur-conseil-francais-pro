
import React from 'react';
import RepairersMap from '@/components/RepairersMap';
import { useSearchStore } from '@/stores/searchStore';

const MainMapSection: React.FC = () => {
  const { filters, isSearchActive } = useSearchStore();

  return (
    <div className="mb-12">
      <RepairersMap searchFilters={isSearchActive ? filters : undefined} />
    </div>
  );
};

export default MainMapSection;

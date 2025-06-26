
import React from 'react';
import RepairersCarousel from '@/components/RepairersCarousel';
import { Repairer } from '@/types/repairer';
import { useSearchStore } from '@/stores/searchStore';

interface RepairersCarouselSectionProps {
  onViewProfile: (repairer: Repairer) => void;
  onCall: (phone: string) => void;
}

const RepairersCarouselSection: React.FC<RepairersCarouselSectionProps> = ({
  onViewProfile,
  onCall
}) => {
  const { filters, isSearchActive } = useSearchStore();

  // Construire les filtres pour le carrousel
  const searchFilters = isSearchActive ? {
    city: filters.city,
    postalCode: filters.postalCode,
    services: filters.searchTerm ? [filters.searchTerm] : undefined,
  } : undefined;

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {isSearchActive ? 'Réparateurs correspondant à votre recherche' : 'Les derniers réparateurs inscrits'}
        </h2>
      </div>
      <RepairersCarousel 
        onViewProfile={onViewProfile}
        onCall={onCall}
        searchFilters={searchFilters}
      />
    </div>
  );
};

export default RepairersCarouselSection;

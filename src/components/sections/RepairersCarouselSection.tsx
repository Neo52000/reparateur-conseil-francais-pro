
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
      {/* Titre avec hauteur fixe pour éviter les sauts */}
      <div className="text-center mb-8 min-h-[120px] flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 transition-all duration-300">
          {isSearchActive ? 'Réparateurs correspondant à votre recherche' : 'Les derniers réparateurs inscrits'}
        </h2>
        {isSearchActive && (
          <p className="text-gray-600 animate-fade-in">
            Résultats basés sur vos critères de recherche
          </p>
        )}
      </div>
      
      {/* Conteneur du carrousel avec hauteur minimale */}
      <div className="min-h-[300px]">
        <RepairersCarousel 
          onViewProfile={onViewProfile}
          onCall={onCall}
          searchFilters={searchFilters}
        />
      </div>
    </div>
  );
};

export default RepairersCarouselSection;

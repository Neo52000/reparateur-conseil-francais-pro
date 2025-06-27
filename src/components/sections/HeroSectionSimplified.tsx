
import React from 'react';
import SearchModeSelector from '@/components/search/SearchModeSelector';

interface HeroSectionSimplifiedProps {
  onQuickSearch: () => void;
  onMapSearch: () => void;
}

/**
 * Section Hero simplifiée avec sélecteur de mode de recherche uniquement
 */
const HeroSectionSimplified: React.FC<HeroSectionSimplifiedProps> = ({
  onQuickSearch,
  onMapSearch
}) => {
  try {
    return (
      <div className="relative min-h-screen bg-cover bg-center" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="relative z-20 flex flex-col justify-center items-center min-h-screen text-white px-4 sm:px-6 lg:px-8 py-16">
          {/* Sélecteur de mode de recherche - bloc unique */}
          <div className="w-full max-w-6xl">
            <SearchModeSelector
              onQuickSearch={onQuickSearch}
              onMapSearch={onMapSearch}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erreur critique dans HeroSectionSimplified:', error);
    return (
      <div className="relative h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mt-4">Chargement en cours...</p>
        </div>
      </div>
    );
  }
};

export default HeroSectionSimplified;

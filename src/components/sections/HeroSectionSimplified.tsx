
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import LocationSearchModal from '@/components/modals/LocationSearchModal';
import MapModal from '@/components/modals/MapModal';

interface SearchCriteria {
  deviceType: string;
  brand: string;
  model: string;
  repairType: string;
  city: string;
  postalCode: string;
}

interface HeroSectionSimplifiedProps {
  onQuickSearch: (searchCriteria: SearchCriteria) => void;
  onMapSearch: () => void;
}

const HeroSectionSimplified: React.FC<HeroSectionSimplifiedProps> = ({
  onQuickSearch,
  onMapSearch
}) => {
  const [isLocationSearchModalOpen, setIsLocationSearchModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const handleLocationSearch = (searchCriteria: SearchCriteria) => {
    onQuickSearch(searchCriteria);
  };

  const handleMapModalClose = () => {
    setIsMapModalOpen(false);
  };

  try {
    return (
      <div className="relative h-[90vh] bg-cover bg-center" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="relative z-20 flex flex-col justify-center items-center h-full text-white px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-4xl text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Trouvez le meilleur réparateur près de chez vous
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Comparez les prix, consultez les avis et prenez rendez-vous en quelques clics
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => setIsLocationSearchModalOpen(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-3"
              >
                <Search className="h-6 w-6" />
                Rechercher des réparateurs
              </Button>

              <Button
                onClick={() => setIsMapModalOpen(true)}
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-3"
              >
                <MapPin className="h-6 w-6" />
                Voir la carte
              </Button>
            </div>
          </div>
        </div>

        <LocationSearchModal
          isOpen={isLocationSearchModalOpen}
          onClose={() => setIsLocationSearchModalOpen(false)}
          onSearch={handleLocationSearch}
        />

        <MapModal
          isOpen={isMapModalOpen}
          onClose={handleMapModalClose}
        />
      </div>
    );
  } catch (error) {
    console.error('Erreur critique dans HeroSectionSimplified:', error);
    return (
      <div className="relative h-[90vh] bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mt-4">Chargement en cours...</p>
        </div>
      </div>
    );
  }
};

export default HeroSectionSimplified;

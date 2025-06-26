
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/Logo';
import SearchModeModal from '@/components/SearchModeModal';

interface HeroSectionProps {
  searchTerm: string;
  selectedLocation: string;
  onSearchTermChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onQuickSearch: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  searchTerm,
  selectedLocation,
  onSearchTermChange,
  onLocationChange,
  onQuickSearch
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearchClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="relative h-screen bg-cover bg-center" style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
    }}>
      {/* Overlay noir */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="relative z-20 flex flex-col justify-center items-center h-full text-white px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <Logo variant="full" size="xl" className="brightness-0 invert" />
          </div>
          <p className="text-xl md:text-2xl mb-8">
            Trouvez le meilleur réparateur près de chez vous
          </p>
        </div>

        {/* Barre de recherche simplifiée */}
        <div className="w-full max-w-2xl relative z-30">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Que souhaitez-vous réparer ?
            </h2>
            
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <Input
                  placeholder="Rechercher un service (ex: écran cassé iPhone 14)"
                  value={searchTerm}
                  onChange={(e) => {
                    console.log('Service input changed:', e.target.value);
                    onSearchTermChange(e.target.value);
                  }}
                  className="pl-10 bg-white text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                size="lg" 
                onClick={handleSearchClick}
              >
                Rechercher
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de sélection du mode */}
      <SearchModeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        searchTerm={searchTerm}
        onQuickSearch={onQuickSearch}
      />
    </div>
  );
};

export default HeroSection;

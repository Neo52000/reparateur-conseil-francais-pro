
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Logo from '@/components/Logo';
import SearchModeToggle from '@/components/SearchModeToggle';
import CityPostalCodeInput from '@/components/CityPostalCodeInput';
import { useSearchStore } from '@/stores/searchStore';

interface HeroSectionSimplifiedProps {
  searchTerm: string;
  selectedLocation: string;
  onSearchTermChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onQuickSearch: () => void;
}

/**
 * Section Hero simplifiée
 * Version allégée qui évite les useEffect complexes
 */
const HeroSectionSimplified: React.FC<HeroSectionSimplifiedProps> = ({
  searchTerm,
  selectedLocation,
  onSearchTermChange,
  onLocationChange,
  onQuickSearch
}) => {
  const [localCity, setLocalCity] = useState('');
  const [localPostal, setLocalPostal] = useState('');
  
  const { searchMode, setSearchMode, setSearchTerm, setCityPostal, performSearch } = useSearchStore();

  // Fonction de recherche manuelle (évite les useEffect automatiques)
  const handleSearchClick = () => {
    try {
      console.log('Recherche manuelle déclenchée');
      setSearchTerm(searchTerm);
      setCityPostal(localCity, localPostal);
      performSearch();
      onQuickSearch();
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  };

  try {
    return (
      <div className="relative h-screen bg-cover bg-center" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
      }}>
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

          <div className="w-full max-w-2xl relative z-30">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Rechercher des réparateurs
              </h2>
              
              <div className="flex flex-col space-y-4">
                <div className="py-2">
                  <SearchModeToggle
                    selectedMode={searchMode}
                    onModeChange={setSearchMode}
                  />
                </div>

                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <Input
                    placeholder="Service (optionnel) - ex: écran cassé iPhone 14"
                    value={searchTerm}
                    onChange={(e) => onSearchTermChange(e.target.value)}
                    className="pl-10 bg-white text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {searchMode === 'quick' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Localisation
                    </label>
                    <CityPostalCodeInput
                      cityValue={localCity}
                      postalCodeValue={localPostal}
                      onCityChange={setLocalCity}
                      onPostalCodeChange={setLocalPostal}
                      onValidSelection={({ city, postalCode }) => {
                        setLocalCity(city);
                        setLocalPostal(postalCode);
                      }}
                      className="bg-white"
                    />
                  </div>
                )}

                {/* Bouton de recherche manuel */}
                <button
                  onClick={handleSearchClick}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔍 Lancer la recherche
                </button>

                <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  {searchMode === 'quick' ? (
                    <p>🔍 Mode recherche rapide avec localisation</p>
                  ) : (
                    <p>🗺️ Mode carte géolocalisée active</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erreur critique dans HeroSectionSimplified:', error);
    return (
      <div className="relative h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Logo variant="full" size="lg" />
          <p className="text-gray-600 mt-4">Chargement en cours...</p>
        </div>
      </div>
    );
  }
};

export default HeroSectionSimplified;

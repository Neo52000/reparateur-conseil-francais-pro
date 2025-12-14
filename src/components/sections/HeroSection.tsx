
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Logo from '@/components/Logo';
import SearchModeToggle from '@/components/SearchModeToggle';
import CityPostalCodeInput from '@/components/CityPostalCodeInput';
import { useSearchStore } from '@/stores/searchStore';

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
  const [localCity, setLocalCity] = useState('');
  const [localPostal, setLocalPostal] = useState('');
  
  const { searchMode, setSearchMode, setSearchTerm, setCityPostal, performSearch } = useSearchStore();

  // Lancer automatiquement la recherche selon le mode avec gestion d'erreur
  useEffect(() => {
    try {
      if (searchMode === 'quick') {
        // Pour la recherche rapide : service + localisation obligatoires
        if (searchTerm.trim() && (localCity.trim() || localPostal.trim())) {
          console.log('Auto-recherche rapide:', { searchTerm, localCity, localPostal });
          setSearchTerm(searchTerm);
          setCityPostal(localCity, localPostal);
          performSearch();
          onQuickSearch();
        }
      } else if (searchMode === 'map') {
        // Pour la carte : toujours active, service optionnel
        console.log('Mode carte activé - service optionnel');
        setSearchTerm(searchTerm);
        setCityPostal(localCity, localPostal);
        performSearch();
        onQuickSearch();
      }
    } catch (error) {
      console.error('Error in search effect:', error);
    }
  }, [searchTerm, localCity, localPostal, searchMode, setSearchTerm, setCityPostal, performSearch, onQuickSearch]);

  try {
    return (
      <div className="relative h-screen bg-cover bg-center" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
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

          {/* Formulaire de recherche intégré */}
          <div className="w-full max-w-2xl relative z-30">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Rechercher des réparateurs
              </h2>
              
              <div className="flex flex-col space-y-4">
                {/* Mode de recherche */}
                <div className="py-2">
                  <SearchModeToggle
                    selectedMode={searchMode}
                    onModeChange={setSearchMode}
                  />
                </div>

                {/* Champ de service (optionnel) */}
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <Input
                    placeholder="Service (optionnel) - ex: écran cassé iPhone 14"
                    value={searchTerm}
                    onChange={(e) => {
                      try {
                        console.log('Service input changed:', e.target.value);
                        onSearchTermChange(e.target.value);
                      } catch (error) {
                        console.error('Error changing search term:', error);
                      }
                    }}
                    className="pl-10 bg-white text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Champs de localisation (uniquement en mode rapide) */}
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
                      onValidSelection={({ city, postalCode, isValid }) => {
                        try {
                          console.log('Validation de localisation:', { city, postalCode, isValid });
                          if (isValid) {
                            setLocalCity(city);
                            setLocalPostal(postalCode);
                          }
                        } catch (error) {
                          console.error('Error in location validation:', error);
                        }
                      }}
                      className="bg-white"
                    />
                  </div>
                )}

                {/* Message d'aide selon le mode */}
                <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  {searchMode === 'quick' ? (
                    <p>🔍 Saisissez un service et une localisation pour lancer la recherche</p>
                  ) : (
                    <p>🗺️ Carte géolocalisée active - Ajoutez un service pour filtrer les résultats</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Critical error in HeroSection:', error);
    return (
      <div className="relative h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erreur de chargement</p>
          <p className="text-sm text-gray-500">Veuillez recharger la page</p>
        </div>
      </div>
    );
  }
};

export default HeroSection;

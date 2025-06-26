
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import CityPostalCodeInput from '@/components/CityPostalCodeInput';
import { useSearchStore } from '@/stores/searchStore';

interface SearchModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onQuickSearch: () => void;
}

const SearchModeModal: React.FC<SearchModeModalProps> = ({
  isOpen,
  onClose,
  searchTerm,
  onQuickSearch
}) => {
  const [selectedMode, setSelectedMode] = useState<'quick' | 'map' | null>(null);
  const [localCity, setLocalCity] = useState('');
  const [localPostal, setLocalPostal] = useState('');
  const [isValidLocation, setIsValidLocation] = useState(false);
  
  const { setSearchTerm, setCityPostal, performSearch, setSearchMode, searchMode } = useSearchStore();

  const handleModeSelect = (mode: 'quick' | 'map') => {
    console.log('Mode sélectionné:', mode);
    
    if (mode === 'map') {
      // Mode carte : fermer la modal et effectuer la recherche
      setSearchMode('map');
      setSearchTerm(searchTerm);
      performSearch();
      onQuickSearch();
      onClose();
    } else {
      // Mode rapide : afficher le formulaire de localisation
      setSelectedMode(mode);
      setSearchMode('quick');
    }
  };

  const handleQuickSearch = () => {
    console.log('Recherche rapide avec:', { 
      searchTerm, 
      localCity, 
      localPostal, 
      isValidLocation 
    });

    // Vérifier qu'on a au moins une localisation
    if (!localCity.trim() && !localPostal.trim()) {
      console.log('Aucune localisation fournie');
      return;
    }
    
    // Mettre à jour le store avec les critères de recherche
    setSearchTerm(searchTerm);
    setCityPostal(localCity, localPostal);
    
    // Effectuer la recherche
    performSearch();
    
    // Fermer la modal et appeler la fonction originale
    onClose();
    onQuickSearch();
  };

  const handleClose = () => {
    setSelectedMode(null);
    setLocalCity('');
    setLocalPostal('');
    setIsValidLocation(false);
    onClose();
  };

  // Utiliser le mode du store si aucun mode local n'est sélectionné
  const currentMode = selectedMode || (searchMode === 'quick' ? 'quick' : null);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Comment souhaitez-vous rechercher ?
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Choisissez votre méthode de recherche préférée
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Rappel du service recherché */}
          {searchTerm && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Service recherché :</strong> {searchTerm}
              </p>
            </div>
          )}

          {/* Sélection du mode si aucun mode n'est sélectionné */}
          {!currentMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className="p-6 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                onClick={() => handleModeSelect('quick')}
              >
                <div className="text-center">
                  <Search className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">Recherche rapide</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Recherchez par service et localisation
                  </p>
                  <Button variant="outline" className="w-full">
                    Choisir <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              <div 
                className="p-6 border border-gray-200 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
                onClick={() => handleModeSelect('map')}
              >
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold text-gray-900 mb-2">Carte géolocalisée</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Explorez visuellement sur une carte interactive
                  </p>
                  <Button variant="outline" className="w-full">
                    Choisir <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire de recherche rapide */}
          {currentMode === 'quick' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Recherche rapide</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedMode(null)}
                >
                  Changer de mode
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Localisation (ville ou code postal)
                  </label>
                  <CityPostalCodeInput
                    cityValue={localCity}
                    postalCodeValue={localPostal}
                    onCityChange={setLocalCity}
                    onPostalCodeChange={setLocalPostal}
                    onValidSelection={({ city, postalCode, isValid }) => {
                      console.log('Validation de localisation:', { city, postalCode, isValid });
                      setIsValidLocation(isValid);
                      if (isValid) {
                        setLocalCity(city);
                        setLocalPostal(postalCode);
                      }
                    }}
                    className="bg-white"
                  />
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                  size="lg" 
                  onClick={handleQuickSearch}
                  disabled={!localCity.trim() && !localPostal.trim()}
                >
                  Rechercher
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModeModal;

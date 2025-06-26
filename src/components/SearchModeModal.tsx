
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  const [localCity, setLocalCity] = useState('');
  const [localPostal, setLocalPostal] = useState('');
  const [isValidLocation, setIsValidLocation] = useState(false);
  
  const { setSearchTerm, setCityPostal, performSearch } = useSearchStore();

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
    setLocalCity('');
    setLocalPostal('');
    setIsValidLocation(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Où rechercher ?
          </DialogTitle>
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
      </DialogContent>
    </Dialog>
  );
};

export default SearchModeModal;

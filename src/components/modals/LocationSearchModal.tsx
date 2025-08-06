
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import CityPostalCodeInput from '@/components/CityPostalCodeInput';

interface SearchCriteria {
  deviceType: string;
  brand: string;
  model: string;
  repairType: string;
  city: string;
  postalCode: string;
}

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchCriteria: SearchCriteria) => void;
}

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch
}) => {
  const [city, setCity] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');

  const handleSearch = () => {
    if (city || postalCode) {
      const searchCriteria: SearchCriteria = {
        deviceType: '',
        brand: '',
        model: '',
        repairType: '',
        city,
        postalCode
      };
      onSearch(searchCriteria);
      onClose();
    }
  };

  const isSearchReady = city || postalCode;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-900">
            Où cherchez-vous un réparateur ?
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Votre localisation
            </label>
            <CityPostalCodeInput
              cityValue={city}
              postalCodeValue={postalCode}
              onCityChange={setCity}
              onPostalCodeChange={setPostalCode}
              className="grid-cols-2 gap-2"
            />
          </div>

          <Button 
            onClick={handleSearch}
            className="w-full bg-blue-600 hover:bg-blue-700 text-base py-6"
            size="lg"
            disabled={!isSearchReady}
          >
            <Search className="h-5 w-5 mr-2" />
            Rechercher des réparateurs
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSearchModal;

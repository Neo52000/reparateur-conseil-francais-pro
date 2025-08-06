
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Smartphone } from 'lucide-react';
import CityPostalCodeInput from '@/components/CityPostalCodeInput';

interface SearchModeSelectorProps {
  onQuickSearch: (searchCriteria: SearchCriteria) => void;
  onMapSearch: () => void;
}

interface SearchCriteria {
  deviceType: string;
  brand: string;
  model: string;
  repairType: string;
  city: string;
  postalCode: string;
}

const SearchModeSelector: React.FC<SearchModeSelectorProps> = ({
  onQuickSearch,
  onMapSearch
}) => {
  const [city, setCity] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');

  const handleQuickSearch = () => {
    if (city || postalCode) {
      const searchCriteria: SearchCriteria = {
        deviceType: '',
        brand: '',
        model: '',
        repairType: '',
        city,
        postalCode
      };
      console.log('Search criteria:', searchCriteria);
      onQuickSearch(searchCriteria);
    }
  };

  const isSearchReady = city || postalCode;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Comment souhaitez-vous rechercher ?
        </h2>
        <p className="text-gray-600">
          Choisissez votre méthode de recherche préférée
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Search */}
        <Card className="group cursor-pointer transition-all hover:shadow-xl hover:scale-105 bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Recherche rapide
              </h3>
            </div>

            <div className="space-y-4">
              {/* Location Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Où êtes-vous ?
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
                onClick={handleQuickSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-base py-5 mt-4"
                size="lg"
                disabled={!isSearchReady}
              >
                Rechercher des réparateurs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map Search */}
        <Card className="group cursor-pointer transition-all hover:shadow-xl hover:scale-105 bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:from-green-600 group-hover:to-green-700 transition-all">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Carte interactive
              </h3>
              
              <p className="text-gray-600 mb-4 text-base">
                Explorez les réparateurs près de chez vous sur une carte géolocalisée
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-400" />
                  <span>Géolocalisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span>Visuel</span>
                </div>
              </div>
              
              <Button 
                onClick={onMapSearch}
                className="w-full bg-green-600 hover:bg-green-700 text-base py-5"
                size="lg"
              >
                Voir la carte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SearchModeSelector;

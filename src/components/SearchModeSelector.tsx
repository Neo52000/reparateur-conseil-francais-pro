
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Users, Clock } from 'lucide-react';

interface SearchModeSelectorProps {
  selectedMode: 'quick' | 'map';
  onModeChange: (mode: 'quick' | 'map') => void;
}

const SearchModeSelector: React.FC<SearchModeSelectorProps> = ({
  selectedMode,
  onModeChange
}) => {
  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Comment souhaitez-vous rechercher ?
        </h2>
        <p className="text-gray-600">
          Choisissez votre méthode de recherche préférée
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Mode Recherche Rapide */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedMode === 'quick' 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onModeChange('quick')}
        >
          <CardContent className="p-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                selectedMode === 'quick' ? 'bg-blue-500' : 'bg-gray-100'
              }`}>
                <Search className={`h-8 w-8 ${
                  selectedMode === 'quick' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Recherche rapide
              </h3>
              
              <p className="text-gray-600 mb-4">
                Recherchez par service et localisation pour des résultats ciblés et précis
              </p>
              
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Rapide</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Ciblé</span>
                </div>
              </div>
              
              <Button 
                className={`mt-4 w-full ${
                  selectedMode === 'quick' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {selectedMode === 'quick' ? 'Sélectionné' : 'Choisir'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mode Carte */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedMode === 'map' 
              ? 'ring-2 ring-green-500 bg-green-50' 
              : 'hover:bg-gray-50'
          }`}
          onClick={() => onModeChange('map')}
        >
          <CardContent className="p-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                selectedMode === 'map' ? 'bg-green-500' : 'bg-gray-100'
              }`}>
                <MapPin className={`h-8 w-8 ${
                  selectedMode === 'map' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Carte géolocalisée
              </h3>
              
              <p className="text-gray-600 mb-4">
                Explorez visuellement les réparateurs autour de vous sur une carte interactive
              </p>
              
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Visuel</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Proximité</span>
                </div>
              </div>
              
              <Button 
                className={`mt-4 w-full ${
                  selectedMode === 'map' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {selectedMode === 'map' ? 'Sélectionné' : 'Choisir'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SearchModeSelector;

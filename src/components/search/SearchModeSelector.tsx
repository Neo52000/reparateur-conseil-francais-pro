
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Zap, Eye } from 'lucide-react';

interface SearchModeSelectorProps {
  onQuickSearch: () => void;
  onMapSearch: () => void;
}

const SearchModeSelector: React.FC<SearchModeSelectorProps> = ({
  onQuickSearch,
  onMapSearch
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Trouvez votre réparateur
        </h2>
        <p className="text-xl text-gray-600">
          Choisissez votre méthode de recherche préférée
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Search */}
        <Card className="group cursor-pointer transition-all hover:shadow-xl hover:scale-105">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                <Search className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Recherche rapide
              </h3>
              
              <p className="text-gray-600 mb-6 text-lg">
                Trouvez votre réparateur en seulement 3 clics : marque, modèle, panne
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>Ultra rapide</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span>Précis</span>
                </div>
              </div>
              
              <Button 
                onClick={onQuickSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                size="lg"
              >
                Commencer la recherche
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map Search */}
        <Card className="group cursor-pointer transition-all hover:shadow-xl hover:scale-105">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:from-green-600 group-hover:to-green-700 transition-all">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Carte interactive
              </h3>
              
              <p className="text-gray-600 mb-6 text-lg">
                Explorez les réparateurs près de chez vous sur une carte géolocalisée
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span>Géolocalisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span>Visuel</span>
                </div>
              </div>
              
              <Button 
                onClick={onMapSearch}
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
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


import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Search, MapPin } from 'lucide-react';

interface SearchModeToggleProps {
  selectedMode: 'quick' | 'map';
  onModeChange: (mode: 'quick' | 'map') => void;
}

const SearchModeToggle: React.FC<SearchModeToggleProps> = ({
  selectedMode,
  onModeChange
}) => {
  return (
    <div className="flex flex-col items-center space-y-4 mb-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Mode de recherche
        </h3>
        <p className="text-sm text-gray-600">
          Choisissez votre méthode de recherche préférée
        </p>
      </div>
      
      <ToggleGroup 
        type="single" 
        value={selectedMode} 
        onValueChange={(value) => {
          if (value) onModeChange(value as 'quick' | 'map');
        }}
        className="bg-gray-100 p-1 rounded-lg"
      >
        <ToggleGroupItem 
          value="quick" 
          className="flex items-center space-x-2 px-6 py-3 rounded-md data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=off]:text-gray-700 data-[state=off]:hover:bg-gray-200 transition-all"
        >
          <Search className="h-4 w-4" />
          <span className="font-medium">Recherche rapide</span>
        </ToggleGroupItem>
        
        <ToggleGroupItem 
          value="map" 
          className="flex items-center space-x-2 px-6 py-3 rounded-md data-[state=on]:bg-green-600 data-[state=on]:text-white data-[state=off]:text-gray-700 data-[state=off]:hover:bg-gray-200 transition-all"
        >
          <MapPin className="h-4 w-4" />
          <span className="font-medium">Carte géolocalisée</span>
        </ToggleGroupItem>
      </ToggleGroup>
      
      <div className="text-center text-sm text-gray-500 max-w-md">
        {selectedMode === 'quick' ? (
          <p>🔍 Recherchez rapidement par service et localisation</p>
        ) : (
          <p>🗺️ Explorez visuellement les réparateurs sur une carte interactive</p>
        )}
      </div>
    </div>
  );
};

export default SearchModeToggle;


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
    <div className="flex justify-center">
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
          className="flex items-center space-x-2 px-4 py-2 rounded-md data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=off]:text-gray-700 data-[state=off]:hover:bg-gray-200 transition-all"
        >
          <Search className="h-4 w-4" />
          <span className="font-medium">Recherche rapide</span>
        </ToggleGroupItem>
        
        <ToggleGroupItem 
          value="map" 
          className="flex items-center space-x-2 px-4 py-2 rounded-md data-[state=on]:bg-green-600 data-[state=on]:text-white data-[state=off]:text-gray-700 data-[state=off]:hover:bg-gray-200 transition-all"
        >
          <MapPin className="h-4 w-4" />
          <span className="font-medium">Carte géolocalisée</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default SearchModeToggle;

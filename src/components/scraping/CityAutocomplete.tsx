import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import { useAddressAutocomplete } from '@/hooks/useAddressAutocomplete';

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  label?: string;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Rechercher une ville...",
  label = "Ville"
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions, loading } = useAddressAutocomplete(inputValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setInputValue(suggestion.city || suggestion.label);
    setShowSuggestions(false);
    onChange(
      suggestion.city || suggestion.label, 
      { lat: suggestion.lat, lng: suggestion.lng }
    );
  };

  const handleInputBlur = () => {
    // Délai pour permettre le clic sur les suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Filtrer pour ne garder que les villes uniques
  const citySuggestions = suggestions
    .filter(s => s.city && s.city.toLowerCase().includes(inputValue.toLowerCase()))
    .reduce((unique, current) => {
      const exists = unique.find(item => item.city.toLowerCase() === current.city.toLowerCase());
      if (!exists) {
        unique.push(current);
      }
      return unique;
    }, [] as typeof suggestions)
    .slice(0, 5);

  return (
    <div className="space-y-2 relative">
      <Label className="text-sm font-medium flex items-center">
        <MapPin className="h-4 w-4 mr-2 text-primary" />
        {label}
      </Label>
      
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleInputBlur}
          className="w-full"
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {/* Suggestions dropdown */}
        {showSuggestions && citySuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
            {citySuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground border-none outline-none"
              >
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-2 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{suggestion.city}</div>
                    <div className="text-xs text-muted-foreground">
                      {suggestion.postal_code} - {suggestion.context}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Tapez au moins 3 caractères pour voir les suggestions
      </p>
    </div>
  );
};

export default CityAutocomplete;
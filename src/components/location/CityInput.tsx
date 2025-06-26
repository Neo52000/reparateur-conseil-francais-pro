
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Check } from "lucide-react";
import LocationSuggestionsList from "./LocationSuggestionsList";

interface City {
  nom: string;
  code: string;
  codePostal: string;
  codeDepartement: string;
  population: number;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onCitySelect: (city: City) => void;
  cities: City[];
  showSuggestions: boolean;
  onFocus: () => void;
  onBlur: () => void;
  isValid: boolean;
  required?: boolean;
  disabled?: boolean;
  isPostalInputActive: boolean;
}

const CityInput: React.FC<Props> = ({
  value,
  onChange,
  onCitySelect,
  cities,
  showSuggestions,
  onFocus,
  onBlur,
  isValid,
  required = false,
  disabled = false,
  isPostalInputActive
}) => {
  return (
    <div className="relative">
      <Label htmlFor="city" className="text-gray-700">
        Ville {required && "*"}
        {value && isValid && (
          <Check className="inline ml-2 h-4 w-4 text-green-600" />
        )}
      </Label>
      <div className="relative">
        <MapPin className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          id="city"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={() => setTimeout(onBlur, 150)}
          placeholder="Entrez une ville"
          className="pl-10 text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          required={required && !isPostalInputActive}
          disabled={disabled}
        />
      </div>
      
      <LocationSuggestionsList
        cities={cities}
        onCitySelect={onCitySelect}
        isVisible={showSuggestions && !isPostalInputActive}
      />
    </div>
  );
};

export default CityInput;

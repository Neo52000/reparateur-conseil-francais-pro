
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
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
  isCityInputActive: boolean;
}

const PostalCodeInput: React.FC<Props> = ({
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
  isCityInputActive
}) => {
  return (
    <div className="relative">
      <Label htmlFor="postal-code" className="text-gray-700">
        Code postal {required && "*"}
        {value && isValid && (
          <Check className="inline ml-2 h-4 w-4 text-green-600" />
        )}
      </Label>
      <Input
        id="postal-code"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={() => setTimeout(onBlur, 150)}
        placeholder="Ex: 75001"
        maxLength={5}
        pattern="[0-9]{5}"
        className="text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        required={required && !isCityInputActive}
        disabled={disabled}
      />
      
      <LocationSuggestionsList
        cities={cities}
        onCitySelect={onCitySelect}
        isVisible={showSuggestions && !isCityInputActive}
      />
    </div>
  );
};

export default PostalCodeInput;

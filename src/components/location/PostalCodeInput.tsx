
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
      <Label htmlFor="postal-code" className="text-white/90">
        Code postal {required && "*"}
        {value && isValid && (
          <Check className="inline ml-2 h-4 w-4 text-green-400" />
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
        className="text-white bg-white/10 border-white/30 focus:border-blue-400 focus:ring-blue-400 placeholder:text-white/50"
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

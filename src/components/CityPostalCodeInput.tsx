
import React, { useState, useEffect } from "react";
import { usePostalCodeValidation } from "@/hooks/usePostalCodeValidation";
import CityInput from "./location/CityInput";
import PostalCodeInput from "./location/PostalCodeInput";

interface Props {
  cityValue: string;
  postalCodeValue: string;
  onCityChange: (city: string) => void;
  onPostalCodeChange: (postalCode: string) => void;
  onValidSelection?: (data: { city: string; postalCode: string; isValid: boolean }) => void;
  className?: string;
  required?: boolean;
}

const CityPostalCodeInput: React.FC<Props> = ({
  cityValue,
  postalCodeValue,
  onCityChange,
  onPostalCodeChange,
  onValidSelection,
  className = "",
  required = false
}) => {
  const [cityInput, setCityInput] = useState(cityValue || "");
  const [postalInput, setPostalInput] = useState(postalCodeValue || "");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showPostalSuggestions, setShowPostalSuggestions] = useState(false);
  const [isValidCombination, setIsValidCombination] = useState(false);
  const [inputMode, setInputMode] = useState<'city' | 'postal' | null>(null);

  const cityResults = usePostalCodeValidation(cityInput, 'city');
  const postalResults = usePostalCodeValidation(postalInput, 'postal');

  // Synchroniser avec les props
  useEffect(() => {
    setCityInput(cityValue);
  }, [cityValue]);

  useEffect(() => {
    setPostalInput(postalCodeValue);
  }, [postalCodeValue]);

  // Vérifier si la combinaison ville/code postal est valide
  useEffect(() => {
    if (cityInput && postalInput) {
      const isValid = cityResults.cities.some(city => 
        city.nom.toLowerCase() === cityInput.toLowerCase() && 
        city.codePostal === postalInput
      ) || postalResults.cities.some(city => 
        city.nom.toLowerCase() === cityInput.toLowerCase() && 
        city.codePostal === postalInput
      );
      
      setIsValidCombination(isValid);
      
      if (onValidSelection) {
        onValidSelection({
          city: cityInput,
          postalCode: postalInput,
          isValid
        });
      }
    } else {
      // Valide si au moins un champ est rempli
      const isValid = Boolean(cityInput.trim() || postalInput.trim());
      setIsValidCombination(isValid);
      
      if (onValidSelection) {
        onValidSelection({
          city: cityInput,
          postalCode: postalInput,
          isValid
        });
      }
    }
  }, [cityInput, postalInput, cityResults.cities, postalResults.cities, onValidSelection]);

  const handleCitySelect = (city: any) => {
    setCityInput(city.nom);
    setPostalInput(city.codePostal);
    onCityChange(city.nom);
    onPostalCodeChange(city.codePostal);
    setShowCitySuggestions(false);
    setInputMode('city');
  };

  const handlePostalSelect = (city: any) => {
    setCityInput(city.nom);
    setPostalInput(city.codePostal);
    onCityChange(city.nom);
    onPostalCodeChange(city.codePostal);
    setShowPostalSuggestions(false);
    setInputMode('postal');
  };

  const handleCityInputChange = (value: string) => {
    // Si on tape dans la ville, on efface le code postal pour éviter les conflits
    if (value && postalInput && inputMode !== 'city') {
      setPostalInput('');
      onPostalCodeChange('');
    }
    
    setCityInput(value);
    onCityChange(value);
    setShowCitySuggestions(true);
    setInputMode('city');
  };

  const handlePostalInputChange = (value: string) => {
    // Si on tape dans le code postal, on efface la ville pour éviter les conflits
    if (value && cityInput && inputMode !== 'postal') {
      setCityInput('');
      onCityChange('');
    }
    
    setPostalInput(value);
    onPostalCodeChange(value);
    setShowPostalSuggestions(true);
    setInputMode('postal');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CityInput
          value={cityInput}
          onChange={handleCityInputChange}
          onCitySelect={handleCitySelect}
          cities={cityResults.cities}
          showSuggestions={showCitySuggestions}
          onFocus={() => setShowCitySuggestions(true)}
          onBlur={() => setShowCitySuggestions(false)}
          isValid={isValidCombination}
          required={required}
          disabled={!!postalInput && inputMode === 'postal'}
          isPostalInputActive={!!postalInput}
        />

        <PostalCodeInput
          value={postalInput}
          onChange={handlePostalInputChange}
          onCitySelect={handlePostalSelect}
          cities={postalResults.cities}
          showSuggestions={showPostalSuggestions}
          onFocus={() => setShowPostalSuggestions(true)}
          onBlur={() => setShowPostalSuggestions(false)}
          isValid={isValidCombination}
          required={required}
          disabled={!!cityInput && inputMode === 'city'}
          isCityInputActive={!!cityInput}
        />
      </div>

      {/* Message d'aide */}
      <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
        💡 Saisissez soit une ville, soit un code postal (pas les deux en même temps)
      </div>
    </div>
  );
};

export default CityPostalCodeInput;

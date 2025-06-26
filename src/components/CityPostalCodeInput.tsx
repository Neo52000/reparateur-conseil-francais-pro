
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePostalCodeValidation } from "@/hooks/usePostalCodeValidation";
import { MapPin, Check } from "lucide-react";

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
        {/* Champ Ville */}
        <div className="relative">
          <Label htmlFor="city" className="text-gray-700">
            Ville {required && "*"}
            {cityInput && isValidCombination && (
              <Check className="inline ml-2 h-4 w-4 text-green-600" />
            )}
          </Label>
          <div className="relative">
            <MapPin className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              id="city"
              value={cityInput}
              onChange={(e) => handleCityInputChange(e.target.value)}
              onFocus={() => setShowCitySuggestions(true)}
              onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
              placeholder="Entrez une ville"
              className="pl-10 text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required={required && !postalInput}
              disabled={!!postalInput && inputMode === 'postal'}
            />
          </div>
          
          {showCitySuggestions && cityResults.cities.length > 0 && !postalInput && (
            <div className="absolute z-30 top-full left-0 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-auto mt-1">
              {cityResults.cities.slice(0, 8).map((city, i) => (
                <div
                  key={`${city.nom}-${city.codePostal}-${i}`}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCitySelect(city);
                  }}
                >
                  <div className="font-medium text-gray-900">{city.nom}</div>
                  <div className="text-sm text-gray-500">
                    {city.codePostal} • {city.codeDepartement}
                    {city.population > 0 && (
                      <span className="ml-2 text-xs">
                        {city.population.toLocaleString()} hab.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Champ Code Postal */}
        <div className="relative">
          <Label htmlFor="postal-code" className="text-gray-700">
            Code postal {required && "*"}
            {postalInput && isValidCombination && (
              <Check className="inline ml-2 h-4 w-4 text-green-600" />
            )}
          </Label>
          <Input
            id="postal-code"
            value={postalInput}
            onChange={(e) => handlePostalInputChange(e.target.value)}
            onFocus={() => setShowPostalSuggestions(true)}
            onBlur={() => setTimeout(() => setShowPostalSuggestions(false), 150)}
            placeholder="Ex: 75001"
            maxLength={5}
            pattern="[0-9]{5}"
            className="text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required={required && !cityInput}
            disabled={!!cityInput && inputMode === 'city'}
          />
          
          {showPostalSuggestions && postalResults.cities.length > 0 && !cityInput && (
            <div className="absolute z-30 top-full left-0 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-auto mt-1">
              {postalResults.cities.slice(0, 8).map((city, i) => (
                <div
                  key={`${city.nom}-${city.codePostal}-${i}`}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handlePostalSelect(city);
                  }}
                >
                  <div className="font-medium text-gray-900">{city.nom}</div>
                  <div className="text-sm text-gray-500">
                    {city.codePostal} • {city.codeDepartement}
                    {city.population > 0 && (
                      <span className="ml-2 text-xs">
                        {city.population.toLocaleString()} hab.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message d'aide */}
      <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
        💡 Saisissez soit une ville, soit un code postal (pas les deux en même temps)
      </div>
    </div>
  );
};

export default CityPostalCodeInput;

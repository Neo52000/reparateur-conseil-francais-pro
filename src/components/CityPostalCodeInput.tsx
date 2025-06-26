
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
      setIsValidCombination(false);
    }
  }, [cityInput, postalInput, cityResults.cities, postalResults.cities, onValidSelection]);

  const handleCitySelect = (city: any) => {
    setCityInput(city.nom);
    setPostalInput(city.codePostal);
    onCityChange(city.nom);
    onPostalCodeChange(city.codePostal);
    setShowCitySuggestions(false);
  };

  const handlePostalSelect = (city: any) => {
    setCityInput(city.nom);
    setPostalInput(city.codePostal);
    onCityChange(city.nom);
    onPostalCodeChange(city.codePostal);
    setShowPostalSuggestions(false);
  };

  const handleCityInputChange = (value: string) => {
    setCityInput(value);
    onCityChange(value); // Changement en temps réel
    setShowCitySuggestions(true);
  };

  const handlePostalInputChange = (value: string) => {
    setPostalInput(value);
    onPostalCodeChange(value); // Changement en temps réel
    setShowPostalSuggestions(true);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Champ Ville */}
        <div className="relative">
          <Label htmlFor="city" className="text-gray-700">
            Ville {required && "*"}
            {cityInput && postalInput && (
              <span className="ml-2">
                {isValidCombination ? (
                  <Check className="inline h-4 w-4 text-green-600" />
                ) : (
                  <span className="text-red-500 text-xs">Combinaison invalide</span>
                )}
              </span>
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
              required={required}
            />
          </div>
          
          {showCitySuggestions && cityResults.cities.length > 0 && (
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
            required={required}
          />
          
          {showPostalSuggestions && postalResults.cities.length > 0 && (
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

      {/* Message de validation */}
      {cityInput && postalInput && !isValidCombination && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          ⚠️ La combinaison ville/code postal saisie ne semble pas correcte. 
          Vérifiez l'orthographe ou sélectionnez une suggestion.
        </div>
      )}
    </div>
  );
};

export default CityPostalCodeInput;


import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import CityInput from '@/components/location/CityInput';
import PostalCodeInput from '@/components/location/PostalCodeInput';
import { usePostalCodeValidation } from '@/hooks/usePostalCodeValidation';

interface City {
  nom: string;
  code: string;
  codePostal: string;
  codeDepartement: string;
  population: number;
}

interface CityPostalCodeInputProps {
  cityValue: string;
  postalCodeValue: string;
  onCityChange: (city: string) => void;
  onPostalCodeChange: (postalCode: string) => void;
  onValidSelection?: (data: { city: string; postalCode: string; isValid: boolean }) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const CityPostalCodeInput: React.FC<CityPostalCodeInputProps> = ({
  cityValue,
  postalCodeValue,
  onCityChange,
  onPostalCodeChange,
  onValidSelection,
  required = false,
  disabled = false,
  className = "grid-cols-2 gap-4"
}) => {
  const {
    cities,
    showCitySuggestions,
    showPostalSuggestions,
    isCityValid,
    isPostalValid,
    setShowCitySuggestions,
    setShowPostalSuggestions,
    handleCityInputChange,
    handlePostalCodeInputChange
  } = usePostalCodeValidation();

  const [isCityInputActive, setIsCityInputActive] = useState(false);
  const [isPostalInputActive, setIsPostalInputActive] = useState(false);

  const handleCityChange = useCallback((value: string) => {
    handleCityInputChange(value);
    onCityChange(value);
  }, [handleCityInputChange, onCityChange]);

  const handlePostalChange = useCallback((value: string) => {
    handlePostalCodeInputChange(value);
    onPostalCodeChange(value);
  }, [handlePostalCodeInputChange, onPostalCodeChange]);

  const handleCitySelect = useCallback((city: City) => {
    onCityChange(city.nom);
    onPostalCodeChange(city.codePostal);
    setShowCitySuggestions(false);
    setShowPostalSuggestions(false);
    
    if (onValidSelection) {
      onValidSelection({
        city: city.nom,
        postalCode: city.codePostal,
        isValid: true
      });
    }
  }, [onCityChange, onPostalCodeChange, setShowCitySuggestions, setShowPostalSuggestions, onValidSelection]);

  const handleCityFocus = useCallback(() => {
    setIsCityInputActive(true);
    setIsPostalInputActive(false);
    setShowCitySuggestions(true);
    setShowPostalSuggestions(false);
  }, [setShowCitySuggestions, setShowPostalSuggestions]);

  const handleCityBlur = useCallback(() => {
    setIsCityInputActive(false);
    setShowCitySuggestions(false);
  }, [setShowCitySuggestions]);

  const handlePostalFocus = useCallback(() => {
    setIsPostalInputActive(true);
    setIsCityInputActive(false);
    setShowPostalSuggestions(true);
    setShowCitySuggestions(false);
  }, [setShowPostalSuggestions, setShowCitySuggestions]);

  const handlePostalBlur = useCallback(() => {
    setIsPostalInputActive(false);
    setShowPostalSuggestions(false);
  }, [setShowPostalSuggestions]);

  const cityInputProps = useMemo(() => ({
    value: cityValue,
    onChange: handleCityChange,
    onCitySelect: handleCitySelect,
    cities,
    showSuggestions: showCitySuggestions,
    onFocus: handleCityFocus,
    onBlur: handleCityBlur,
    isValid: isCityValid,
    required,
    disabled,
    isPostalInputActive
  }), [
    cityValue, handleCityChange, handleCitySelect, cities,
    showCitySuggestions, handleCityFocus, handleCityBlur,
    isCityValid, required, disabled, isPostalInputActive
  ]);

  const postalInputProps = useMemo(() => ({
    value: postalCodeValue,
    onChange: handlePostalChange,
    onCitySelect: handleCitySelect,
    cities,
    showSuggestions: showPostalSuggestions,
    onFocus: handlePostalFocus,
    onBlur: handlePostalBlur,
    isValid: isPostalValid,
    required,
    disabled,
    isCityInputActive
  }), [
    postalCodeValue, handlePostalChange, handleCitySelect, cities,
    showPostalSuggestions, handlePostalFocus, handlePostalBlur,
    isPostalValid, required, disabled, isCityInputActive
  ]);

  return (
    <div className={cn("grid", className)}>
      <CityInput {...cityInputProps} />
      <PostalCodeInput {...postalInputProps} />
    </div>
  );
};

export default CityPostalCodeInput;

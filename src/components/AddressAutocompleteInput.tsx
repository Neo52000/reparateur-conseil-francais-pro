
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useAddressAutocomplete } from "@/hooks/useAddressAutocomplete";
import { usePostalCodeValidation } from "@/hooks/usePostalCodeValidation";
import { MapPin, Check, AlertTriangle } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: { 
    address: string; 
    city?: string; 
    postal_code?: string;
    lat?: number;
    lng?: number;
    department_code?: string;
    isValidPostal?: boolean;
  }) => void;
  placeholder?: string;
  required?: boolean;
}

const AddressAutocompleteInput: React.FC<Props> = ({
  value,
  onChange,
  placeholder = "Entrez une adresse",
  required
}) => {
  const [input, setInput] = useState(value || "");
  const [show, setShow] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');

  const { suggestions, loading } = useAddressAutocomplete(input);
  
  // Extraire le code postal de l'adresse pour validation
  const extractedPostalCode = input.match(/\b\d{5}\b/)?.[0] || "";
  const postalValidation = usePostalCodeValidation(extractedPostalCode, 'postal');

  const handleSelect = (sugg: any) => {
    setInput(sugg.label);
    setShow(false);
    
    // Validation du code postal avec l'API Carto
    const isValidPostal = postalValidation.cities.some(city => 
      city.codePostal === sugg.postal_code && 
      city.nom.toLowerCase().includes(sugg.city.toLowerCase())
    );

    setValidationStatus(isValidPostal ? 'valid' : 'invalid');
    
    console.log('Address selected:', {
      address: sugg.label,
      city: sugg.city,
      postal_code: sugg.postal_code,
      lat: sugg.lat,
      lng: sugg.lng,
      department_code: sugg.department_code,
      isValidPostal
    });
    
    onChange({
      address: sugg.label,
      city: sugg.city,
      postal_code: sugg.postal_code,
      lat: sugg.lat,
      lng: sugg.lng,
      department_code: sugg.department_code,
      isValidPostal
    });
  };

  const getValidationIcon = () => {
    if (validationStatus === 'valid') {
      return <Check className="h-4 w-4 text-green-600" />;
    } else if (validationStatus === 'invalid') {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    return null;
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
        <Input
          value={input}
          onChange={e => {
            setInput(e.target.value);
            setShow(true);
            setValidationStatus('unknown');
          }}
          onFocus={() => setShow(true)}
          onBlur={() => setTimeout(() => setShow(false), 150)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="pl-10 pr-10"
        />
        {validationStatus !== 'unknown' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getValidationIcon()}
          </div>
        )}
      </div>
      
      {show && (suggestions.length > 0 || loading) && (
        <div className="absolute z-30 top-full left-0 w-full bg-white border border-gray-200 rounded shadow-lg max-h-52 overflow-auto">
          {loading && (
            <div className="p-2 text-sm text-gray-400">Recherche…</div>
          )}
          {suggestions.map((sugg, i) => {
            // Vérifier si cette suggestion a un code postal valide
            const hasValidPostal = postalValidation.cities.some(city => 
              city.codePostal === sugg.postal_code
            );
            
            return (
              <div
                key={sugg.label + i}
                className="p-2 hover:bg-blue-100 cursor-pointer text-sm border-b last:border-b-0"
                onMouseDown={e => {
                  e.preventDefault();
                  handleSelect(sugg);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{sugg.value}</div>
                    <div className="text-gray-500 text-xs">
                      {sugg.postal_code} {sugg.city}
                      {sugg.context && ` • ${sugg.context}`}
                    </div>
                  </div>
                  {hasValidPostal && (
                    <Check className="h-3 w-3 text-green-500 ml-2 flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
          {!loading && suggestions.length === 0 && (
            <div className="p-2 text-sm text-gray-400">Aucune suggestion</div>
          )}
        </div>
      )}
      
      {validationStatus === 'invalid' && extractedPostalCode && (
        <div className="mt-1 text-xs text-orange-600">
          ⚠️ Code postal {extractedPostalCode} : vérifiez la correspondance avec la ville
        </div>
      )}
    </div>
  );
};

export default AddressAutocompleteInput;

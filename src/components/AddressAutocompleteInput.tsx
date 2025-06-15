
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useAddressAutocomplete } from "@/hooks/useAddressAutocomplete";

interface Props {
  value: string;
  onChange: (value: { 
    address: string; 
    city?: string; 
    postal_code?: string;
    lat?: number;
    lng?: number;
    department_code?: string;
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

  const { suggestions, loading } = useAddressAutocomplete(input);

  const handleSelect = (sugg: any) => {
    setInput(sugg.label);
    setShow(false);
    
    console.log('Address selected:', {
      address: sugg.label,
      city: sugg.city,
      postal_code: sugg.postal_code,
      lat: sugg.lat,
      lng: sugg.lng,
      department_code: sugg.department_code
    });
    
    onChange({
      address: sugg.label,
      city: sugg.city,
      postal_code: sugg.postal_code,
      lat: sugg.lat,
      lng: sugg.lng,
      department_code: sugg.department_code
    });
  };

  return (
    <div className="relative">
      <Input
        value={input}
        onChange={e => {
          setInput(e.target.value);
          setShow(true);
        }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 150)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      {show && (suggestions.length > 0 || loading) && (
        <div className="absolute z-30 top-full left-0 w-full bg-white border border-gray-200 rounded shadow max-h-52 overflow-auto">
          {loading && (
            <div className="p-2 text-sm text-gray-400">Recherche…</div>
          )}
          {suggestions.map((sugg, i) => (
            <div
              key={sugg.label + i}
              className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
              onMouseDown={e => {
                e.preventDefault();
                handleSelect(sugg);
              }}
            >
              <div className="font-medium">{sugg.value}</div>
              <div className="text-gray-500 text-xs">
                {sugg.postal_code} {sugg.city}
                {sugg.context && ` • ${sugg.context}`}
              </div>
            </div>
          ))}
          {!loading && suggestions.length === 0 && (
            <div className="p-2 text-sm text-gray-400">Aucune suggestion</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressAutocompleteInput;

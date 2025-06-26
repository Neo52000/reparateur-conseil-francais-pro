
import React from "react";
import { Check } from "lucide-react";

interface City {
  nom: string;
  code: string;
  codePostal: string;
  codeDepartement: string;
  population: number;
}

interface Props {
  cities: City[];
  onCitySelect: (city: City) => void;
  isVisible: boolean;
}

const LocationSuggestionsList: React.FC<Props> = ({
  cities,
  onCitySelect,
  isVisible
}) => {
  if (!isVisible || cities.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-30 top-full left-0 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-auto mt-1">
      {cities.slice(0, 8).map((city, i) => (
        <div
          key={`${city.nom}-${city.codePostal}-${i}`}
          className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
          onMouseDown={(e) => {
            e.preventDefault();
            onCitySelect(city);
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
  );
};

export default LocationSuggestionsList;

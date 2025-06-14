
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Star, 
  Euro, 
  Clock, 
  MapPin,
  Filter,
  X
} from 'lucide-react';

const SearchFilters = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([50]);
  const [distance, setDistance] = useState([10]);
  const [minRating, setMinRating] = useState(0);
  const [openNow, setOpenNow] = useState(false);
  const [fastResponse, setFastResponse] = useState(false);

  const services = [
    'Écran cassé', 'Batterie', 'Connecteur charge', 'Réparation eau',
    'Appareil photo', 'Haut-parleur', 'Micro', 'Vitre arrière',
    'Boutons', 'Capteurs', 'Logiciel', 'Déblocage'
  ];

  const brands = [
    'iPhone', 'Samsung', 'Xiaomi', 'Huawei', 'OnePlus',
    'Google Pixel', 'Oppo', 'Vivo', 'Nothing', 'Fairphone'
  ];

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setSelectedServices([]);
    setSelectedBrands([]);
    setPriceRange([50]);
    setDistance([10]);
    setMinRating(0);
    setOpenNow(false);
    setFastResponse(false);
  };

  const activeFiltersCount = selectedServices.length + selectedBrands.length + 
    (minRating > 0 ? 1 : 0) + (openNow ? 1 : 0) + (fastResponse ? 1 : 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtres de recherche
            {activeFiltersCount > 0 && (
              <Badge className="ml-2" variant="secondary">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-1" />
              Effacer tout
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Services */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Services</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {services.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service}`}
                    checked={selectedServices.includes(service)}
                    onCheckedChange={() => toggleService(service)}
                  />
                  <label
                    htmlFor={`service-${service}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {service}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Marques */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Marques</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => toggleBrand(brand)}
                  />
                  <label
                    htmlFor={`brand-${brand}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Prix et Distance */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Euro className="h-4 w-4 mr-1" />
                Prix maximum
              </h3>
              <div className="space-y-2">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={200}
                  min={20}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>20€</span>
                  <span className="font-medium">{priceRange[0]}€</span>
                  <span>200€</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Distance
              </h3>
              <div className="space-y-2">
                <Slider
                  value={distance}
                  onValueChange={setDistance}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>1km</span>
                  <span className="font-medium">{distance[0]}km</span>
                  <span>50km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Options rapides */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Note minimum
              </h3>
              <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les notes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Toutes les notes</SelectItem>
                  <SelectItem value="3">3 étoiles et +</SelectItem>
                  <SelectItem value="4">4 étoiles et +</SelectItem>
                  <SelectItem value="4.5">4.5 étoiles et +</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Options</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="open-now"
                    checked={openNow}
                    onCheckedChange={(checked) => setOpenNow(checked as boolean)}
                  />
                  <label htmlFor="open-now" className="text-sm text-gray-700 cursor-pointer">
                    Ouvert maintenant
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fast-response"
                    checked={fastResponse}
                    onCheckedChange={(checked) => setFastResponse(checked as boolean)}
                  />
                  <label htmlFor="fast-response" className="text-sm text-gray-700 cursor-pointer flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Réponse rapide (&lt; 1h)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Filters Display */}
        {(selectedServices.length > 0 || selectedBrands.length > 0) && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Filtres sélectionnés :</h4>
            <div className="flex flex-wrap gap-2">
              {selectedServices.map((service) => (
                <Badge
                  key={service}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleService(service)}
                >
                  {service}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
              {selectedBrands.map((brand) => (
                <Badge
                  key={brand}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => toggleBrand(brand)}
                >
                  {brand}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Apply Filters Button */}
        <div className="border-t pt-4">
          <Button className="w-full">
            Appliquer les filtres ({activeFiltersCount})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;

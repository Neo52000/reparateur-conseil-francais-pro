
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';

interface SearchFiltersProps {
  onFiltersChange?: (filters: any) => void;
  initialFilters?: any;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  onFiltersChange,
  initialFilters = {}
}) => {
  const { brands: catalogBrands, loading } = useCatalog();
  const [priceRange, setPriceRange] = useState(initialFilters.priceRange || [0, 300]);
  const [selectedServices, setSelectedServices] = useState<string[]>(initialFilters.services || []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialFilters.brands || []);
  const [rating, setRating] = useState<number | null>(initialFilters.minRating || null);
  const [availability, setAvailability] = useState<string>(initialFilters.availability || '');

  // Notify parent component of filter changes
  useEffect(() => {
    if (onFiltersChange) {
      const filters = {
        priceRange,
        services: selectedServices,
        brands: selectedBrands,
        minRating: rating,
        availability
      };
      onFiltersChange(filters);
    }
  }, [priceRange, selectedServices, selectedBrands, rating, availability, onFiltersChange]);

  const services = [
    'Écran cassé',
    'Batterie défaillante',
    'Problème de charge',
    'Dégât des eaux',
    'Appareil photo',
    'Haut-parleur',
    'Boutons défaillants',
    'Problème logiciel'
  ];

  // Utiliser les vraies marques de la base de données
  const brands = catalogBrands.map(brand => brand.name).sort();

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 300]);
    setSelectedServices([]);
    setSelectedBrands([]);
    setRating(null);
    setAvailability('');
  };

  const activeFiltersCount = selectedServices.length + selectedBrands.length + 
    (rating ? 1 : 0) + (availability ? 1 : 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtres de recherche
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount} filtre(s) actif(s)</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fourchette de prix */}
        <div>
          <Label className="text-sm font-medium">Prix de réparation (€)</Label>
          <div className="mt-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={300}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{priceRange[0]}€</span>
              <span>{priceRange[1]}€</span>
            </div>
          </div>
        </div>

        {/* Type de service */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Type de réparation</Label>
          <div className="grid grid-cols-1 gap-2">
            {services.map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={service}
                  checked={selectedServices.includes(service)}
                  onCheckedChange={() => handleServiceToggle(service)}
                />
                <Label htmlFor={service} className="text-sm">{service}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Marques */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Marques spécialisées</Label>
          {loading ? (
            <p className="text-sm text-gray-500">Chargement des marques...</p>
          ) : (
            <div className="space-y-2">
              <Select 
                value="" 
                onValueChange={(value) => {
                  if (value && !selectedBrands.includes(value)) {
                    handleBrandToggle(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une marque..." />
                </SelectTrigger>
                <SelectContent>
                  {brands
                    .filter(brand => !selectedBrands.includes(brand))
                    .map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              
              {selectedBrands.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedBrands.map((brand) => (
                    <Badge key={brand} variant="secondary" className="text-xs">
                      {brand}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => handleBrandToggle(brand)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Note minimale */}
        <div>
          <Label className="text-sm font-medium">Note minimale</Label>
          <Select value={rating?.toString() || ''} onValueChange={(value) => setRating(value ? Number(value) : null)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Toutes les notes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les notes</SelectItem>
              <SelectItem value="4">4+ étoiles</SelectItem>
              <SelectItem value="4.5">4.5+ étoiles</SelectItem>
              <SelectItem value="5">5 étoiles uniquement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Disponibilité */}
        <div>
          <Label className="text-sm font-medium">Disponibilité</Label>
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Toutes disponibilités" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes disponibilités</SelectItem>
              <SelectItem value="today">Disponible aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="urgent">Réparation express</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4">
          <Button className="flex-1">
            Appliquer les filtres
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Effacer
          </Button>
        </div>

        {/* Filtres actifs */}
        {(selectedServices.length > 0 || selectedBrands.length > 0) && (
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium mb-2 block">Filtres actifs :</Label>
            <div className="flex flex-wrap gap-2">
              {selectedServices.map((service) => (
                <Badge key={service} variant="secondary" className="text-xs">
                  {service}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => handleServiceToggle(service)}
                  />
                </Badge>
              ))}
              {selectedBrands.map((brand) => (
                <Badge key={brand} variant="secondary" className="text-xs">
                  {brand}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => handleBrandToggle(brand)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilters;

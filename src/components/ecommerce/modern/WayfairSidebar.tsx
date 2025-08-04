import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Truck, 
  Shield,
  X,
  Search
} from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';

interface Filters {
  category: string[];
  priceRange: [number, number];
  brands: string[];
  rating: number;
  features: string[];
  shipping: string[];
}

interface WayfairSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  productCount: number;
}

const WayfairSidebar: React.FC<WayfairSidebarProps> = ({
  filters,
  onFiltersChange,
  productCount
}) => {
  const { brands: catalogBrands, loading } = useCatalog();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    brands: true,
    rating: true,
    features: false,
    shipping: false
  });

  const [brandSearch, setBrandSearch] = useState('');

  const categories = [
    { id: 'ecrans', name: 'Écrans', count: 234 },
    { id: 'batteries', name: 'Batteries', count: 156 },
    { id: 'cameras', name: 'Caméras', count: 89 },
    { id: 'coques', name: 'Coques', count: 445 },
    { id: 'chargeurs', name: 'Chargeurs', count: 123 },
    { id: 'cables', name: 'Câbles', count: 67 },
    { id: 'outils', name: 'Outils', count: 45 }
  ];

  // Utiliser les vraies marques de la base de données
  const brands = catalogBrands.map(brand => ({
    id: brand.id,
    name: brand.name,
    count: Math.floor(Math.random() * 150) + 10 // Simulated count for now
  })).sort((a, b) => a.name.localeCompare(b.name));

  const features = [
    { id: 'garantie-6mois', name: 'Garantie 6 mois', count: 189 },
    { id: 'garantie-12mois', name: 'Garantie 12 mois', count: 145 },
    { id: 'installation-incluse', name: 'Installation incluse', count: 78 },
    { id: 'qualite-premium', name: 'Qualité Premium', count: 234 },
    { id: 'oem-original', name: 'OEM Original', count: 167 },
    { id: 'compatible-tous', name: 'Compatible tous modèles', count: 45 }
  ];

  const shippingOptions = [
    { id: 'gratuit', name: 'Livraison gratuite', count: 345 },
    { id: 'express', name: 'Express 24h', count: 123 },
    { id: 'retrait', name: 'Retrait en magasin', count: 234 },
    { id: 'same-day', name: 'Livraison jour J', count: 67 }
  ];

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilters = (key: keyof Filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleArrayFilter = (key: 'category' | 'brands' | 'features' | 'shipping', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilters(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      category: [],
      priceRange: [0, 1000],
      brands: [],
      rating: 0,
      features: [],
      shipping: []
    });
  };

  const hasActiveFilters = filters.category.length > 0 || 
                          filters.brands.length > 0 || 
                          filters.rating > 0 || 
                          filters.features.length > 0 || 
                          filters.shipping.length > 0 ||
                          filters.priceRange[0] > 0 || 
                          filters.priceRange[1] < 1000;

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 sticky top-24">
      {/* Header des filtres */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filtres</CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {productCount} produits trouvés
          </p>
        </CardHeader>
      </Card>

      {/* Filtres actifs */}
      {hasActiveFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {filters.category.map(cat => (
                <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                  {categories.find(c => c.id === cat)?.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleArrayFilter('category', cat)}
                  />
                </Badge>
              ))}
              {filters.brands.map(brand => (
                <Badge key={brand} variant="secondary" className="flex items-center gap-1">
                  {brands.find(b => b.id === brand)?.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleArrayFilter('brands', brand)}
                  />
                </Badge>
              ))}
              {filters.rating > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.rating}+ ⭐
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => updateFilters('rating', 0)}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Catégories */}
      <Card>
        <Collapsible open={openSections.categories} onOpenChange={() => toggleSection('categories')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Catégories</CardTitle>
                {openSections.categories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
              {categories.map(category => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={filters.category.includes(category.id)}
                      onCheckedChange={() => toggleArrayFilter('category', category.id)}
                    />
                    <label
                      htmlFor={category.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {category.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Prix */}
      <Card>
        <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Prix</CardTitle>
                {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilters('priceRange', value as [number, number])}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange[0]}
                  onChange={(e) => updateFilters('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                  className="w-20 text-sm"
                />
                <span className="text-sm text-gray-500">à</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilters('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 1000])}
                  className="w-20 text-sm"
                />
                <span className="text-sm text-gray-500">€</span>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {filters.priceRange[0]}€ - {filters.priceRange[1]}€
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Marques */}
      <Card>
        <Collapsible open={openSections.brands} onOpenChange={() => toggleSection('brands')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Marques</CardTitle>
                {openSections.brands ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une marque..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-3">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Chargement des marques...</p>
                ) : (
                  filteredBrands.map(brand => (
                    <div key={brand.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={brand.id}
                          checked={filters.brands.includes(brand.id)}
                          onCheckedChange={() => toggleArrayFilter('brands', brand.id)}
                        />
                        <label
                          htmlFor={brand.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {brand.name}
                        </label>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {brand.count}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Note client */}
      <Card>
        <Collapsible open={openSections.rating} onOpenChange={() => toggleSection('rating')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Note client</CardTitle>
                {openSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
              {[4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={filters.rating === rating}
                    onCheckedChange={() => updateFilters('rating', filters.rating === rating ? 0 : rating)}
                  />
                  <label
                    htmlFor={`rating-${rating}`}
                    className="flex items-center gap-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="ml-1">& plus</span>
                  </label>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Caractéristiques */}
      <Card>
        <Collapsible open={openSections.features} onOpenChange={() => toggleSection('features')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Caractéristiques</CardTitle>
                {openSections.features ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
              {features.map(feature => (
                <div key={feature.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={feature.id}
                      checked={filters.features.includes(feature.id)}
                      onCheckedChange={() => toggleArrayFilter('features', feature.id)}
                    />
                    <label
                      htmlFor={feature.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {feature.name}
                    </label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Livraison */}
      <Card>
        <Collapsible open={openSections.shipping} onOpenChange={() => toggleSection('shipping')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Livraison</CardTitle>
                {openSections.shipping ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
              {shippingOptions.map(option => (
                <div key={option.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={filters.shipping.includes(option.id)}
                      onCheckedChange={() => toggleArrayFilter('shipping', option.id)}
                    />
                    <label
                      htmlFor={option.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.name}
                    </label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {option.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default WayfairSidebar;
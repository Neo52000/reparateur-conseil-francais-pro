
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Filter, Star, Clock, Euro, Smartphone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCatalog } from '@/hooks/useCatalog';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

interface SearchFilters {
  brand: string;
  model: string;
  issueType: string;
  location: string;
  maxDistance: number;
  sortBy: string;
  maxPrice: number;
}

const AdvancedSearch = ({ onSearch }: AdvancedSearchProps) => {
  const { user } = useAuth();
  const { brands: catalogBrands, deviceModels, repairTypes, loading } = useCatalog();
  const [filters, setFilters] = useState<SearchFilters>({
    brand: '',
    model: '',
    issueType: '',
    location: '',
    maxDistance: 10,
    sortBy: 'distance',
    maxPrice: 200
  });

  // Utiliser les vraies marques de la base de données
  const brands = catalogBrands.map(brand => brand.name).sort();

  // Filtrer les modèles par marque sélectionnée
  const getModelsForBrand = (brandName: string) => {
    const brand = catalogBrands.find(b => b.name === brandName);
    if (!brand) return [];
    return deviceModels
      .filter(model => model.brand_id === brand.id)
      .map(model => model.model_name)
      .sort();
  };

  // Utiliser les vrais types de réparation
  const issueTypes = repairTypes.map(repair => repair.name).sort();

  const isPremiumUser = user; // Pour la démo, tous les utilisateurs connectés ont accès

  const handleSearch = () => {
    onSearch(filters);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFilters(prev => ({
          ...prev,
          location: `${position.coords.latitude},${position.coords.longitude}`
        }));
      });
    }
  };

  if (!isPremiumUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Recherche Avancée
            <Badge className="ml-2">Premium</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <Smartphone className="h-12 w-12 mx-auto text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-900">Fonctionnalité Premium</h3>
              <p className="text-gray-600 mt-2">
                La recherche avancée est disponible avec l'abonnement Premium à 34.90€/mois.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <p>• Recherche par marque ET modèle spécifique</p>
              <p>• Filtres par type de panne</p>
              <p>• Géolocalisation automatique</p>
              <p>• Tri par distance, prix, délai ou note</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Recherche Avancée
          <Badge className="ml-2">Premium</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Marque</label>
            <Select value={filters.brand} onValueChange={(value) => setFilters(prev => ({ ...prev, brand: value, model: '' }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une marque" />
              </SelectTrigger>
              <SelectContent>
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Modèle</label>
            <Select value={filters.model} onValueChange={(value) => setFilters(prev => ({ ...prev, model: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un modèle" />
              </SelectTrigger>
              <SelectContent>
                {filters.brand && getModelsForBrand(filters.brand).map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Type de panne</label>
            <Select value={filters.issueType} onValueChange={(value) => setFilters(prev => ({ ...prev, issueType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Type de panne" />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Localisation</label>
            <div className="flex space-x-2">
              <Input
                placeholder="Ville ou adresse"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
              <Button variant="outline" size="sm" onClick={getLocation}>
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Distance max (km)</label>
            <Select value={filters.maxDistance.toString()} onValueChange={(value) => setFilters(prev => ({ ...prev, maxDistance: parseInt(value) }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="20">20 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Trier par</label>
            <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="price">Prix</SelectItem>
                <SelectItem value="rating">Note</SelectItem>
                <SelectItem value="delay">Délai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSearch} className="w-full">
          <Search className="h-4 w-4 mr-2" />
          Rechercher
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;

import React from 'react';
import { useSuppliersDirectory } from '@/hooks/useSuppliersDirectory';
import { SupplierCard } from './SupplierCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Filter, ChevronDown, Users, Star, Verified } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Constantes pour les filtres
const PRODUCT_TYPES = [
  'Écrans', 'Batteries', 'Connecteurs', 'Haut-parleurs', 'Caméras',
  'Coques', 'Flex', 'Micros', 'Nappes', 'Vibrants'
];

const BRANDS = [
  'Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OnePlus', 'Google',
  'Sony', 'Nokia', 'Motorola', 'LG', 'Oppo', 'Vivo'
];

const SuppliersDirectory: React.FC = () => {
  const {
    suppliers,
    loading,
    error,
    hasAccess,
    fetchSuppliers,
    fetchSupplierById,
    fetchSupplierReviews,
    createReview,
  } = useSuppliersDirectory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  useEffect(() => {
    if (hasAccess) {
      handleSearch();
    }
  }, [hasAccess]);

  const handleSearch = () => {
    fetchSuppliers({
      search: searchTerm,
      brands: selectedBrands,
      productTypes: selectedProductTypes,
      verified: verifiedOnly
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrands([]);
    setSelectedProductTypes([]);
    setVerifiedOnly(false);
    fetchSuppliers();
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    }
  };

  const handleProductTypeChange = (productType: string, checked: boolean) => {
    if (checked) {
      setSelectedProductTypes([...selectedProductTypes, productType]);
    } else {
      setSelectedProductTypes(selectedProductTypes.filter(p => p !== productType));
    }
  };

  const handleViewDetails = async (supplierId: string) => {
    const supplier = await fetchSupplierById(supplierId);
    if (supplier) {
      const reviews = await fetchSupplierReviews(supplierId);
      setSelectedSupplier({ ...supplier, reviews });
    }
  };

  // Vérification d'accès
  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Annuaire Fournisseurs</CardTitle>
            <CardDescription>
              Accédez à notre réseau de fournisseurs vérifiés
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              L'annuaire fournisseurs est réservé aux réparateurs avec un abonnement Premium ou Enterprise.
            </p>
            <Button 
              onClick={() => window.location.href = '/subscription-plans'}
              className="mt-4"
            >
              Voir les plans d'abonnement
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center p-8">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Annuaire Fournisseurs
        </h1>
        <p className="text-muted-foreground mb-6">
          Découvrez notre réseau de fournisseurs de pièces détachées vérifiés
        </p>
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{suppliers.length}</div>
              <p className="text-sm text-muted-foreground">Fournisseurs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {suppliers.length > 0 
                  ? (suppliers.map(s => s.rating || 0).reduce((sum, rating) => sum + rating, 0) / suppliers.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <p className="text-sm text-muted-foreground">Note moyenne</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {suppliers.filter(s => s.is_verified).length}
              </div>
              <p className="text-sm text-muted-foreground">Vérifiés</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Recherche */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>
                Rechercher
              </Button>
              <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres avancés
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>

            {/* Filtres sélectionnés */}
            {(selectedBrands.length > 0 || selectedProductTypes.length > 0 || verifiedOnly) && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium">Filtres actifs:</span>
                {selectedBrands.map(brand => (
                  <Badge key={brand} variant="secondary" className="text-xs">
                    {brand}
                    <button
                      onClick={() => handleBrandChange(brand, false)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {selectedProductTypes.map(type => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type}
                    <button
                      onClick={() => handleProductTypeChange(type, false)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {verifiedOnly && (
                  <Badge variant="secondary" className="text-xs">
                    Vérifiés seulement
                    <button
                      onClick={() => setVerifiedOnly(false)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Effacer tout
                </Button>
              </div>
            )}

            {/* Panneau de filtres avancés */}
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleContent className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Marques */}
                  <div>
                    <Label className="text-sm font-medium">Marques</Label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                      {BRANDS.map(brand => (
                        <div key={brand} className="flex items-center space-x-2">
                          <Checkbox
                            id={`brand-${brand}`}
                            checked={selectedBrands.includes(brand)}
                            onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                          />
                          <Label htmlFor={`brand-${brand}`} className="text-sm">
                            {brand}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Types de produits */}
                  <div>
                    <Label className="text-sm font-medium">Types de produits</Label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                      {PRODUCT_TYPES.map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={selectedProductTypes.includes(type)}
                            onCheckedChange={(checked) => handleProductTypeChange(type, checked as boolean)}
                          />
                          <Label htmlFor={`type-${type}`} className="text-sm">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Options */}
                  <div>
                    <Label className="text-sm font-medium">Options</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="verified-only"
                          checked={verifiedOnly}
                          onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                        />
                        <Label htmlFor="verified-only" className="text-sm">
                          Fournisseurs vérifiés seulement
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSearch}>
                    Appliquer les filtres
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Réinitialiser
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Liste des fournisseurs */}
      {suppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center p-8">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun fournisseur trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Essayez de modifier vos critères de recherche
            </p>
            <Button onClick={clearFilters}>
              Effacer les filtres
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SuppliersDirectory;
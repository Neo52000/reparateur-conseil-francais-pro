import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Filter, Users, Star, Lock } from 'lucide-react';
import { useSuppliersDirectory } from '@/hooks/useSuppliersDirectory';
import { SupplierCard } from '@/components/suppliers/SupplierCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const PRODUCT_TYPES = [
  'Écrans', 'Batteries', 'Coques', 'Chargeurs', 'Accessoires',
  'Pièces détachées', 'Outils de réparation', 'Adhésifs'
];

const BRANDS = [
  'Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OnePlus', 'Google',
  'Sony', 'LG', 'Motorola', 'Nokia', 'Oppo', 'Vivo'
];

export const SuppliersDirectoryPage = () => {
  const navigate = useNavigate();
  const { suppliers, loading, error, hasAccess, fetchSuppliers } = useSuppliersDirectory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (hasAccess) {
      handleSearch();
    }
  }, [searchTerm, selectedBrands, selectedProductTypes, showVerifiedOnly, hasAccess]);

  const handleSearch = () => {
    fetchSuppliers({
      search: searchTerm,
      brands: selectedBrands,
      productTypes: selectedProductTypes,
      verified: showVerifiedOnly,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrands([]);
    setSelectedProductTypes([]);
    setShowVerifiedOnly(false);
  };

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <Lock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">Accès Premium Requis</h2>
            <p className="text-muted-foreground mb-6">
              L'annuaire des fournisseurs est exclusivement accessible aux réparateurs 
              avec un abonnement Premium ou Enterprise.
            </p>
            <Button onClick={() => navigate('/subscription-plans')}>
              Voir les abonnements
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Annuaire des Fournisseurs</h1>
        <p className="text-muted-foreground">
          Découvrez les meilleurs fournisseurs de pièces et accessoires pour la téléphonie.
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Fournisseurs</p>
                <p className="text-xl font-bold">{suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
                <p className="text-xl font-bold">
                  {suppliers.length > 0 
                    ? (suppliers.map(s => s.rating || 0).reduce((acc, rating) => acc + rating, 0) / suppliers.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">Certifiés</p>
                <p className="text-xl font-bold">
                  {suppliers.filter(s => s.is_verified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche et filtres */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recherche et filtres</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres avancés
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un fournisseur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Marques</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {BRANDS.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBrands([...selectedBrands, brand]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(b => b !== brand));
                            }
                          }}
                        />
                        <label htmlFor={`brand-${brand}`} className="text-sm">
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Types de produits</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {PRODUCT_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={selectedProductTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProductTypes([...selectedProductTypes, type]);
                            } else {
                              setSelectedProductTypes(selectedProductTypes.filter(t => t !== type));
                            }
                          }}
                        />
                        <label htmlFor={`type-${type}`} className="text-sm">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified-only"
                      checked={showVerifiedOnly}
                      onCheckedChange={(checked) => setShowVerifiedOnly(checked === true)}
                    />
                    <label htmlFor="verified-only" className="text-sm">
                      Fournisseurs certifiés uniquement
                    </label>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Effacer les filtres
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Résultats */}
      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-80 animate-pulse">
              <CardContent className="p-6">
                <div className="bg-gray-200 h-12 w-12 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                <div className="bg-gray-200 h-3 w-full mb-4 rounded"></div>
                <div className="bg-gray-200 h-3 w-2/3 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : suppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onViewDetails={(id) => navigate(`/suppliers/${id}`)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Aucun fournisseur trouvé avec les critères sélectionnés.
            </p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Effacer les filtres
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
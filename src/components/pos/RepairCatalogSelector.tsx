import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, ShoppingCart } from 'lucide-react';
import { useRepairerCatalog } from '@/hooks/catalog/useRepairerCatalog';
import type { CatalogTreeNode } from '@/types/repairerCatalog';

interface RepairCatalogSelectorProps {
  onRepairSelect: (repair: {
    name: string;
    basePrice: number;
    customPrice?: number;
    margin?: number;
  }) => void;
}

interface SelectedRepair {
  id: string;
  name: string;
  basePrice: number;
  customPrice?: number;
  margin?: number;
  quantity: number;
}

const RepairCatalogSelector: React.FC<RepairCatalogSelectorProps> = ({
  onRepairSelect
}) => {
  const { catalogTree, loading } = useRepairerCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [filteredRepairs, setFilteredRepairs] = useState<any[]>([]);

  // Extraire toutes les réparations du catalogue
  const extractRepairs = (nodes: CatalogTreeNode[]): any[] => {
    const repairs: any[] = [];
    
    nodes.forEach(brand => {
      if (brand.children) {
        brand.children.forEach(model => {
          if (model.children) {
            model.children.forEach(repair => {
              if (repair.prices && repair.prices.length > 0) {
                repairs.push({
                  id: `${brand.id}-${model.id}-${repair.id}`,
                  brandName: brand.name,
                  modelName: model.name,
                  repairName: repair.name,
                  basePrice: repair.prices[0]?.price_eur || 0,
                  customPrice: repair.custom_price?.custom_price_eur,
                  margin: repair.margin_percentage,
                  isActive: repair.is_active,
                  brandId: brand.id,
                  modelId: model.id,
                  repairId: repair.id
                });
              }
            });
          }
        });
      }
    });
    
    return repairs;
  };

  useEffect(() => {
    const allRepairs = extractRepairs(catalogTree);
    
    let filtered = allRepairs.filter(repair => repair.isActive);
    
    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(repair =>
        repair.repairName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.modelName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrer par marque
    if (selectedBrand) {
      filtered = filtered.filter(repair => repair.brandId === selectedBrand);
    }
    
    // Filtrer par modèle
    if (selectedModel) {
      filtered = filtered.filter(repair => repair.modelId === selectedModel);
    }
    
    setFilteredRepairs(filtered);
  }, [catalogTree, searchTerm, selectedBrand, selectedModel]);

  const getBrands = () => {
    return catalogTree.filter(node => node.type === 'brand');
  };

  const getModels = () => {
    const selectedBrandNode = catalogTree.find(node => node.id === selectedBrand);
    return selectedBrandNode?.children || [];
  };

  const handleRepairSelect = (repair: any) => {
    const finalPrice = repair.customPrice || repair.basePrice;
    
    onRepairSelect({
      name: `${repair.brandName} ${repair.modelName} - ${repair.repairName}`,
      basePrice: repair.basePrice,
      customPrice: repair.customPrice,
      margin: repair.margin
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Sélectionner une réparation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Rechercher</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Rechercher une réparation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="brand">Marque</Label>
            <select
              id="brand"
              className="w-full p-2 border rounded-md"
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedModel(''); // Reset model when brand changes
              }}
            >
              <option value="">Toutes les marques</option>
              {getBrands().map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model">Modèle</Label>
            <select
              id="model"
              className="w-full p-2 border rounded-md"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedBrand}
            >
              <option value="">Tous les modèles</option>
              {getModels().map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des réparations */}
        <div className="max-h-80 overflow-y-auto space-y-2">
          {filteredRepairs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {catalogTree.length === 0 
                ? 'Aucun catalogue configuré'
                : 'Aucune réparation trouvée avec les filtres actuels'
              }
            </div>
          ) : (
            filteredRepairs.map(repair => (
              <div 
                key={repair.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{repair.repairName}</span>
                    {repair.margin && (
                      <Badge variant="secondary" className="text-xs">
                        Marge: {repair.margin}%
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {repair.brandName} - {repair.modelName}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    {repair.customPrice ? (
                      <div>
                        <div className="font-bold text-green-600">
                          {repair.customPrice.toFixed(2)} €
                        </div>
                        <div className="text-xs text-muted-foreground line-through">
                          {repair.basePrice.toFixed(2)} €
                        </div>
                      </div>
                    ) : (
                      <div className="font-bold">
                        {repair.basePrice.toFixed(2)} €
                      </div>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleRepairSelect(repair)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RepairCatalogSelector;
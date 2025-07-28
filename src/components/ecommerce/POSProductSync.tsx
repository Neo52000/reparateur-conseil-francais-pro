import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  RefreshCw, 
  Check,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface POSProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  synced: boolean;
}

const POSProductSync: React.FC = () => {
  const [posProducts, setPosProducts] = useState<POSProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const { toast } = useToast();

  // Simulation de produits POS
  useEffect(() => {
    setPosProducts([
      { id: '1', name: 'Écran iPhone 12', sku: 'ECR-IP12', price: 89.99, stock: 5, category: 'Écrans', synced: true },
      { id: '2', name: 'Batterie Samsung S21', sku: 'BAT-S21', price: 45.00, stock: 8, category: 'Batteries', synced: false },
      { id: '3', name: 'Vitre arrière iPhone 13', sku: 'VIT-IP13', price: 25.50, stock: 3, category: 'Vitres', synced: false },
      { id: '4', name: 'Chargeur universel', sku: 'CHG-UNI', price: 15.99, stock: 12, category: 'Accessoires', synced: true }
    ]);
  }, []);

  const handleSyncAll = async () => {
    setLoading(true);
    setSyncProgress(0);

    try {
      const unsyncedProducts = posProducts.filter(p => !p.synced);
      
      for (let i = 0; i < unsyncedProducts.length; i++) {
        // Simulation de synchronisation
        await new Promise(resolve => setTimeout(resolve, 800));
        setSyncProgress(((i + 1) / unsyncedProducts.length) * 100);
      }

      // Marquer tous les produits comme synchronisés
      setPosProducts(prev => prev.map(p => ({ ...p, synced: true })));

      toast({
        title: "Synchronisation terminée",
        description: `${unsyncedProducts.length} produits synchronisés avec succès`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les produits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setSyncProgress(0);
    }
  };

  const handleSyncSelected = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Aucun produit sélectionné",
        description: "Veuillez sélectionner au moins un produit",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulation de synchronisation des produits sélectionnés
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPosProducts(prev => prev.map(p => 
        selectedProducts.includes(p.id) ? { ...p, synced: true } : p
      ));

      setSelectedProducts([]);

      toast({
        title: "Synchronisation terminée",
        description: `${selectedProducts.length} produit(s) synchronisé(s)`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de synchroniser les produits sélectionnés",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const unsyncedCount = posProducts.filter(p => !p.synced).length;
  const syncedCount = posProducts.filter(p => p.synced).length;

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total produits</p>
                <p className="text-2xl font-bold">{posProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Synchronisés</p>
                <p className="text-2xl font-bold text-emerald-600">{syncedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">À synchroniser</p>
                <p className="text-2xl font-bold text-amber-600">{unsyncedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions de synchronisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Synchronisation des produits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={handleSyncAll}
              disabled={loading || unsyncedCount === 0}
              className="flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Synchroniser tout ({unsyncedCount})
            </Button>

            <Button 
              variant="outline"
              onClick={handleSyncSelected}
              disabled={loading || selectedProducts.length === 0}
            >
              Synchroniser sélection ({selectedProducts.length})
            </Button>
          </div>

          {loading && syncProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Synchronisation en cours...</span>
                <span>{Math.round(syncProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des produits */}
      <Card>
        <CardHeader>
          <CardTitle>Produits POS</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Tous ({posProducts.length})</TabsTrigger>
              <TabsTrigger value="synced">Synchronisés ({syncedCount})</TabsTrigger>
              <TabsTrigger value="unsynced">À sync. ({unsyncedCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {posProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  isSelected={selectedProducts.includes(product.id)}
                  onSelect={(id, selected) => {
                    if (selected) {
                      setSelectedProducts(prev => [...prev, id]);
                    } else {
                      setSelectedProducts(prev => prev.filter(p => p !== id));
                    }
                  }}
                />
              ))}
            </TabsContent>

            <TabsContent value="synced" className="space-y-3">
              {posProducts.filter(p => p.synced).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </TabsContent>

            <TabsContent value="unsynced" className="space-y-3">
              {posProducts.filter(p => !p.synced).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  isSelected={selectedProducts.includes(product.id)}
                  onSelect={(id, selected) => {
                    if (selected) {
                      setSelectedProducts(prev => [...prev, id]);
                    } else {
                      setSelectedProducts(prev => prev.filter(p => p !== id));
                    }
                  }}
                />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface ProductCardProps {
  product: POSProduct;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isSelected, onSelect }) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        {onSelect && !product.synced && (
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={(e) => onSelect(product.id, e.target.checked)}
            className="h-4 w-4 text-primary"
          />
        )}
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-muted-foreground">
            SKU: {product.sku} • Stock: {product.stock} • {product.category}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-medium">{product.price.toFixed(2)} €</span>
        <Badge variant={product.synced ? "default" : "secondary"}>
          {product.synced ? "Synchronisé" : "Non synchronisé"}
        </Badge>
        {product.synced && (
          <ArrowRight className="w-4 h-4 text-emerald-600" />
        )}
      </div>
    </div>
  );
};

export default POSProductSync;
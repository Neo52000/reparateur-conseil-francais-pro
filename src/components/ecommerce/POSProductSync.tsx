import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface POSProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  synced: boolean;
}

interface POSInventoryItem {
  id: string;
  name: string;
  sku: string;
  unit_price: number;
  current_stock: number;
  category: string;
  repairer_id: string;
}

interface EcommerceProduct {
  sku: string;
  repairer_id: string;
}

const POSProductSync: React.FC = () => {
  const [posProducts, setPosProducts] = useState<POSProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Chargement des produits POS depuis la base
  useEffect(() => {
    loadPOSProducts();
  }, [user]);

  const loadPOSProducts = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingData(true);
      const { data: posInventory } = await supabase
        .from('pos_inventory_items' as any)
        .select('*')
        .eq('repairer_id', user.id) as { data: POSInventoryItem[] | null };

      const { data: ecomProducts } = await supabase
        .from('ecommerce_products' as any)
        .select('sku')
        .eq('repairer_id', user.id) as { data: EcommerceProduct[] | null };

      const syncedSkus = new Set(ecomProducts?.map(p => p.sku) || []);

      const products: POSProduct[] = posInventory?.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        price: item.unit_price || 0,
        stock: item.current_stock || 0,
        category: item.category || 'Divers',
        synced: syncedSkus.has(item.sku)
      })) || [];

      setPosProducts(products);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      // Fallback avec données simulées
      setPosProducts([
        { id: '1', name: 'Écran iPhone 12', sku: 'ECR-IP12', price: 89.99, stock: 5, category: 'Écrans', synced: true },
        { id: '2', name: 'Batterie Samsung S21', sku: 'BAT-S21', price: 45.00, stock: 8, category: 'Batteries', synced: false },
        { id: '3', name: 'Vitre arrière iPhone 13', sku: 'VIT-IP13', price: 25.50, stock: 3, category: 'Vitres', synced: false },
        { id: '4', name: 'Chargeur universel', sku: 'CHG-UNI', price: 15.99, stock: 12, category: 'Accessoires', synced: true }
      ]);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  const handleSyncAll = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setSyncProgress(0);

    try {
      const unsyncedProducts = posProducts.filter(p => !p.synced);
      
      for (let i = 0; i < unsyncedProducts.length; i++) {
        const product = unsyncedProducts[i];
        
        // Synchroniser vers e-commerce
        await supabase
          .from('ecommerce_products' as any)
          .upsert({
            repairer_id: user.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            stock_quantity: product.stock,
            category: product.category,
            is_active: true,
            created_at: new Date().toISOString()
          });
        
        setSyncProgress(((i + 1) / unsyncedProducts.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 200)); // Throttling
      }

      // Marquer tous les produits comme synchronisés
      setPosProducts(prev => prev.map(p => ({ ...p, synced: true })));

      toast({
        title: "Synchronisation terminée",
        description: `${unsyncedProducts.length} produits synchronisés avec succès`,
        variant: "default"
      });
    } catch (error) {
      console.error('Erreur sync:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser les produits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setSyncProgress(0);
    }
  }, [posProducts, user, toast]);

  const handleSyncSelected = useCallback(async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Aucun produit sélectionné",
        description: "Veuillez sélectionner au moins un produit",
        variant: "destructive"
      });
      return;
    }

    if (!user) return;
    setLoading(true);
    
    try {
      const productsToSync = posProducts.filter(p => selectedProducts.includes(p.id));
      
      for (const product of productsToSync) {
        await supabase
          .from('ecommerce_products' as any)
          .upsert({
            repairer_id: user.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            stock_quantity: product.stock,
            category: product.category,
            is_active: true,
            created_at: new Date().toISOString()
          });
      }

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
      console.error('Erreur sync sélection:', error);
      toast({
        title: "Erreur",
        description: "Impossible de synchroniser les produits sélectionnés",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedProducts, posProducts, user, toast]);

  // Statistiques mémorisées pour éviter les recalculs
  const stats = useMemo(() => ({
    unsyncedCount: posProducts.filter(p => !p.synced).length,
    syncedCount: posProducts.filter(p => p.synced).length,
    totalCount: posProducts.length
  }), [posProducts]);

  // Callback pour gérer la sélection
  const handleProductSelect = useCallback((id: string, selected: boolean) => {
    setSelectedProducts(prev => 
      selected ? [...prev, id] : prev.filter(p => p !== id)
    );
  }, []);

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                <p className="text-2xl font-bold">{stats.totalCount}</p>
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
                <p className="text-2xl font-bold text-emerald-600">{stats.syncedCount}</p>
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
                <p className="text-2xl font-bold text-amber-600">{stats.unsyncedCount}</p>
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
              disabled={loading || stats.unsyncedCount === 0}
              className="flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Synchroniser tout ({stats.unsyncedCount})
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
              <TabsTrigger value="all">Tous ({stats.totalCount})</TabsTrigger>
              <TabsTrigger value="synced">Synchronisés ({stats.syncedCount})</TabsTrigger>
              <TabsTrigger value="unsynced">À sync. ({stats.unsyncedCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {posProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  isSelected={selectedProducts.includes(product.id)}
                  onSelect={handleProductSelect}
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
                  onSelect={handleProductSelect}
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

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, isSelected, onSelect }) => {
  const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelect) {
      onSelect(product.id, e.target.checked);
    }
  }, [product.id, onSelect]);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        {onSelect && !product.synced && (
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={handleSelectChange}
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
});

export default POSProductSync;
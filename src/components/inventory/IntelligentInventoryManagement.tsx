import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  ShoppingCart,
  Edit,
  Trash2,
  Link,
  Eye,
  Filter
} from 'lucide-react';
import { useInventoryManagement, EnhancedInventoryItem } from '@/hooks/useInventoryManagement';
import { EnhancedProductForm } from './EnhancedProductForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const IntelligentInventoryManagement: React.FC = () => {
  const {
    inventory,
    categories,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductLinks,
  } = useInventoryManagement();

  const [selectedProduct, setSelectedProduct] = useState<EnhancedInventoryItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory.filter(item => 
    item.current_stock <= (item.minimum_stock || 0)
  );

  const handleCreateProduct = async (productData: Partial<EnhancedInventoryItem>) => {
    try {
      await createProduct({
        ...productData,
        repairer_id: 'current_user_id' // This should come from auth context
      });
      setIsFormOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleUpdateProduct = async (productData: Partial<EnhancedInventoryItem>) => {
    if (!selectedProduct) return;
    try {
      await updateProduct(selectedProduct.id, productData);
      setIsFormOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const formatPrice = (price?: number) => {
    return price ? `${price.toFixed(2)}€` : '-';
  };

  const getStockStatus = (item: EnhancedInventoryItem) => {
    if (item.current_stock === 0) {
      return <Badge variant="destructive">Rupture</Badge>;
    } else if (item.current_stock <= (item.minimum_stock || 0)) {
      return <Badge variant="secondary">Stock faible</Badge>;
    } else {
      return <Badge variant="default">En stock</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-primary mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total produits</p>
              <p className="text-2xl font-bold">{inventory.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-destructive mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Alertes stock</p>
              <p className="text-2xl font-bold">{lowStockItems.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valeur stock</p>
              <p className="text-2xl font-bold">
                {formatPrice(inventory.reduce((sum, item) => 
                  sum + (item.purchase_price_ttc || 0) * item.current_stock, 0
                ))}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <ShoppingCart className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">E-commerce actifs</p>
              <p className="text-2xl font-bold">
                {inventory.filter(item => item.is_ecommerce_active).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre d'actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestion Intelligente du Stock</CardTitle>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setSelectedProduct(null);
                  setIsFormOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau produit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedProduct ? 'Modifier le produit' : 'Nouveau produit'}
                  </DialogTitle>
                </DialogHeader>
                <EnhancedProductForm
                  product={selectedProduct || undefined}
                  categories={categories}
                  onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setSelectedProduct(null);
                  }}
                  loading={loading}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, SKU ou marque..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="inventory" className="w-full">
            <TabsList>
              <TabsTrigger value="inventory">Inventaire</TabsTrigger>
              <TabsTrigger value="alerts">
                Alertes ({lowStockItems.length})
              </TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Prix achat</TableHead>
                      <TableHead>Prix vente</TableHead>
                      <TableHead>Marge</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {item.image_url && (
                              <img 
                                src={item.image_url} 
                                alt={item.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.brand} {item.model}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm">{item.sku}</code>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{item.current_stock}</span>
                            {item.minimum_stock && (
                              <span className="text-sm text-muted-foreground">
                                / {item.minimum_stock}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatPrice(item.purchase_price_ttc)}</TableCell>
                        <TableCell>{formatPrice(item.sale_price_ttc)}</TableCell>
                        <TableCell>
                          {item.margin_percentage && (
                            <Badge variant="outline">
                              {item.margin_percentage.toFixed(1)}%
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStockStatus(item)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(item);
                                setIsFormOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Link className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="alerts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                    Alertes de stock ({lowStockItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lowStockItems.length === 0 ? (
                    <p className="text-muted-foreground">Aucune alerte de stock actuellement.</p>
                  ) : (
                    <div className="space-y-4">
                      {lowStockItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Stock: {item.current_stock} / Seuil: {item.minimum_stock || 0}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Réapprovisionner
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(item);
                                setIsFormOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Rotation du stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Rotation moyenne</span>
                        <span className="font-medium">2.3x/mois</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Produits lents</span>
                        <span className="text-destructive">{inventory.filter(i => (i.current_stock * (i.sale_price_ttc || 0)) > 1000).length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Rentabilité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Marge moyenne</span>
                        <span className="font-medium">
                          {(inventory.reduce((sum, item) => sum + (item.margin_percentage || 0), 0) / inventory.length).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Meilleure marge</span>
                        <span className="text-green-600">
                          {Math.max(...inventory.map(i => i.margin_percentage || 0)).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance E-commerce</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Produits actifs</span>
                        <span className="font-medium">{inventory.filter(i => i.is_ecommerce_active).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Taux activation</span>
                        <span className="text-blue-600">
                          {((inventory.filter(i => i.is_ecommerce_active).length / inventory.length) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
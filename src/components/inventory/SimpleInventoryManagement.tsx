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
  Edit,
  Trash2,
  Truck,
  AlertTriangle
} from 'lucide-react';
import { useSimpleInventory, SimpleInventoryItem, SimpleSupplier } from '@/hooks/useSimpleInventory';
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
import { Label } from '@/components/ui/label';

export const SimpleInventoryManagement: React.FC = () => {
  const {
    inventory,
    categories,
    suppliers,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    createSupplier,
  } = useSimpleInventory();

  const [selectedProduct, setSelectedProduct] = useState<SimpleInventoryItem | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    description: '',
    brand: '',
    model: '',
    current_stock: 0,
    minimum_stock: 0,
    selling_price: 0,
    cost_price: 0,
    is_ecommerce_active: false,
    requires_intervention: false,
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const resetProductForm = () => {
    setProductForm({
      name: '',
      sku: '',
      description: '',
      brand: '',
      model: '',
      current_stock: 0,
      minimum_stock: 0,
      selling_price: 0,
      cost_price: 0,
      is_ecommerce_active: false,
      requires_intervention: false,
    });
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      name: '',
      email: '',
      phone: '',
    });
  };

  const handleCreateProduct = async () => {
    try {
      await createProduct(productForm);
      setIsProductFormOpen(false);
      resetProductForm();
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    try {
      await updateProduct(selectedProduct.id, productForm);
      setIsProductFormOpen(false);
      resetProductForm();
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

  const handleCreateSupplier = async () => {
    try {
      await createSupplier(supplierForm);
      setIsSupplierFormOpen(false);
      resetSupplierForm();
    } catch (error) {
      console.error('Error creating supplier:', error);
    }
  };

  const openProductForm = (product?: SimpleInventoryItem) => {
    if (product) {
      setSelectedProduct(product);
      setProductForm({
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        brand: product.brand || '',
        model: product.model || '',
        current_stock: product.current_stock,
        minimum_stock: product.minimum_stock || 0,
        selling_price: product.selling_price || 0,
        cost_price: product.cost_price || 0,
        is_ecommerce_active: product.is_ecommerce_active,
        requires_intervention: product.requires_intervention,
      });
    } else {
      setSelectedProduct(null);
      resetProductForm();
    }
    setIsProductFormOpen(true);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lowStockItems = inventory.filter(item => 
    item.current_stock <= (item.minimum_stock || 0)
  );

  const formatPrice = (price?: number) => {
    return price ? `${price.toFixed(2)}€` : '-';
  };

  const getStockStatus = (item: SimpleInventoryItem) => {
    if (item.current_stock === 0) {
      return <Badge variant="destructive">Rupture</Badge>;
    } else if (item.current_stock <= (item.minimum_stock || 0)) {
      return <Badge variant="secondary">Stock faible</Badge>;
    } else {
      return <Badge variant="default">En stock</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement de l'inventaire...</p>
        </div>
      </div>
    );
  }

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
            <Truck className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fournisseurs</p>
              <p className="text-2xl font-bold">{suppliers.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">E-commerce actifs</p>
              <p className="text-2xl font-bold">
                {inventory.filter(item => item.is_ecommerce_active).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestion Simple du Stock</CardTitle>
            <div className="flex gap-2">
              <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openProductForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau produit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedProduct ? 'Modifier le produit' : 'Nouveau produit'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom *</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({...prev, name: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={productForm.sku}
                        onChange={(e) => setProductForm(prev => ({...prev, sku: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand">Marque</Label>
                      <Input
                        id="brand"
                        value={productForm.brand}
                        onChange={(e) => setProductForm(prev => ({...prev, brand: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Modèle</Label>
                      <Input
                        id="model"
                        value={productForm.model}
                        onChange={(e) => setProductForm(prev => ({...prev, model: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="current_stock">Stock actuel</Label>
                      <Input
                        id="current_stock"
                        type="number"
                        value={productForm.current_stock}
                        onChange={(e) => setProductForm(prev => ({...prev, current_stock: parseInt(e.target.value) || 0}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="minimum_stock">Stock minimum</Label>
                      <Input
                        id="minimum_stock"
                        type="number"
                        value={productForm.minimum_stock}
                        onChange={(e) => setProductForm(prev => ({...prev, minimum_stock: parseInt(e.target.value) || 0}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cost_price">Prix d'achat</Label>
                      <Input
                        id="cost_price"
                        type="number"
                        step="0.01"
                        value={productForm.cost_price}
                        onChange={(e) => setProductForm(prev => ({...prev, cost_price: parseFloat(e.target.value) || 0}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="selling_price">Prix de vente</Label>
                      <Input
                        id="selling_price"
                        type="number"
                        step="0.01"
                        value={productForm.selling_price}
                        onChange={(e) => setProductForm(prev => ({...prev, selling_price: parseFloat(e.target.value) || 0}))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsProductFormOpen(false)}>
                      Annuler
                    </Button>
                    <Button 
                      onClick={selectedProduct ? handleUpdateProduct : handleCreateProduct}
                      disabled={!productForm.name}
                    >
                      {selectedProduct ? 'Modifier' : 'Créer'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isSupplierFormOpen} onOpenChange={setIsSupplierFormOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Truck className="h-4 w-4 mr-2" />
                    Nouveau fournisseur
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouveau fournisseur</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="supplier_name">Nom *</Label>
                      <Input
                        id="supplier_name"
                        value={supplierForm.name}
                        onChange={(e) => setSupplierForm(prev => ({...prev, name: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier_email">Email</Label>
                      <Input
                        id="supplier_email"
                        type="email"
                        value={supplierForm.email}
                        onChange={(e) => setSupplierForm(prev => ({...prev, email: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier_phone">Téléphone</Label>
                      <Input
                        id="supplier_phone"
                        value={supplierForm.phone}
                        onChange={(e) => setSupplierForm(prev => ({...prev, phone: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsSupplierFormOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateSupplier} disabled={!supplierForm.name}>
                      Créer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
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
          </div>

          <Tabs defaultValue="inventory" className="w-full">
            <TabsList>
              <TabsTrigger value="inventory">Inventaire</TabsTrigger>
              <TabsTrigger value="alerts">
                Alertes ({lowStockItems.length})
              </TabsTrigger>
              <TabsTrigger value="suppliers">
                Fournisseurs ({suppliers.length})
              </TabsTrigger>
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
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.brand} {item.model}
                            </p>
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
                        <TableCell>{formatPrice(item.cost_price)}</TableCell>
                        <TableCell>{formatPrice(item.selling_price)}</TableCell>
                        <TableCell>{getStockStatus(item)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openProductForm(item)}
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
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="alerts">
              <div className="space-y-4">
                {lowStockItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucune alerte de stock actuellement.
                  </p>
                ) : (
                  lowStockItems.map((item) => (
                    <Card key={item.id} className="border-l-4 border-l-red-500">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Stock: {item.current_stock} / Seuil: {item.minimum_stock || 0}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openProductForm(item)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="suppliers">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{supplier.email || '-'}</TableCell>
                        <TableCell>{supplier.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={supplier.is_active ? "default" : "secondary"}>
                            {supplier.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
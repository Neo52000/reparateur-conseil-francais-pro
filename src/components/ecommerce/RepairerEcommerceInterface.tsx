import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingBag, 
  Package, 
  Users, 
  BarChart3,
  Plus,
  Edit,
  Trash,
  Eye,
  Star,
  Euro,
  TrendingUp,
  ShoppingCart,
  Bell,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  description: string;
  images: string[];
  isActive: boolean;
  sales: number;
  rating: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  createdAt: string;
  shippingAddress: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

const RepairerEcommerceInterface: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = () => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Écran iPhone 13',
        category: 'Écrans',
        price: 149.90,
        stock: 12,
        sku: 'SCR-IP13-001',
        description: 'Écran de remplacement haute qualité pour iPhone 13',
        images: [],
        isActive: true,
        sales: 24,
        rating: 4.5
      },
      {
        id: '2',
        name: 'Batterie Samsung S21',
        category: 'Batteries',
        price: 89.90,
        stock: 8,
        sku: 'BAT-SS21-001',
        description: 'Batterie de remplacement pour Samsung Galaxy S21',
        images: [],
        isActive: true,
        sales: 15,
        rating: 4.3
      },
      {
        id: '3',
        name: 'Coque iPhone 13 Pro',
        category: 'Accessoires',
        price: 29.90,
        stock: 25,
        sku: 'COQ-IP13P-001',
        description: 'Coque de protection transparente',
        images: [],
        isActive: true,
        sales: 45,
        rating: 4.7
      }
    ];
    setProducts(mockProducts);
  };

  const loadOrders = () => {
    const mockOrders: Order[] = [
      {
        id: 'ORD001',
        customerName: 'Marie Dubois',
        customerEmail: 'marie.dubois@email.com',
        total: 179.80,
        status: 'processing',
        items: [
          { productId: '1', productName: 'Écran iPhone 13', quantity: 1, price: 149.90 },
          { productId: '3', productName: 'Coque iPhone 13 Pro', quantity: 1, price: 29.90 }
        ],
        createdAt: '2024-07-26',
        shippingAddress: '123 Rue de la Paix, Paris'
      },
      {
        id: 'ORD002',
        customerName: 'Pierre Martin',
        customerEmail: 'pierre.martin@email.com',
        total: 89.90,
        status: 'shipped',
        items: [
          { productId: '2', productName: 'Batterie Samsung S21', quantity: 1, price: 89.90 }
        ],
        createdAt: '2024-07-25',
        shippingAddress: '456 Avenue des Champs, Lyon'
      }
    ];
    setOrders(mockOrders);
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'outline' as const, color: 'text-yellow-600' },
      processing: { label: 'En cours', variant: 'default' as const, color: 'text-blue-600' },
      shipped: { label: 'Expédiée', variant: 'outline' as const, color: 'text-purple-600' },
      delivered: { label: 'Livrée', variant: 'default' as const, color: 'text-green-600' },
      cancelled: { label: 'Annulée', variant: 'outline' as const, color: 'text-red-600' }
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders => 
      orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    
    toast({
      title: "Statut mis à jour",
      description: `Commande ${orderId} mise à jour`,
    });
  };

  const toggleProductStatus = (productId: string) => {
    setProducts(products => 
      products.map(product => 
        product.id === productId ? { ...product, isActive: !product.isActive } : product
      )
    );
  };

  // Statistiques du dashboard
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            Boutique E-commerce
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="products">Produits</TabsTrigger>
              <TabsTrigger value="orders">Commandes</TabsTrigger>
              <TabsTrigger value="customers">Clients</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            {/* Dashboard */}
            <TabsContent value="dashboard" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="flex items-center p-4">
                    <Euro className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</p>
                      <p className="text-2xl font-bold">{totalRevenue.toFixed(2)}€</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center p-4">
                    <ShoppingCart className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Commandes</p>
                      <p className="text-2xl font-bold">{totalOrders}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center p-4">
                    <Package className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Produits</p>
                      <p className="text-2xl font-bold">{totalProducts}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex items-center p-4">
                    <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Panier moyen</p>
                      <p className="text-2xl font-bold">{averageOrderValue.toFixed(2)}€</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Commandes récentes */}
              <Card>
                <CardHeader>
                  <CardTitle>Commandes récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Commande</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{order.total}€</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{order.createdAt}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gestion des produits */}
            <TabsContent value="products" className="mt-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestion des Produits</h2>
                <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nouveau Produit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Créer un nouveau produit</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nom du produit</label>
                        <Input placeholder="Nom du produit" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">SKU</label>
                        <Input placeholder="Code produit" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Catégorie</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="screens">Écrans</SelectItem>
                            <SelectItem value="batteries">Batteries</SelectItem>
                            <SelectItem value="accessories">Accessoires</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Prix</label>
                        <Input type="number" placeholder="Prix en €" />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea placeholder="Description du produit..." />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateProductOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={() => setIsCreateProductOpen(false)}>
                        Créer le produit
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Ventes</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.price}€</TableCell>
                          <TableCell>
                            <Badge variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'outline' : 'destructive'}>
                              {product.stock} unités
                            </Badge>
                          </TableCell>
                          <TableCell>{product.sales}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              {product.rating}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.isActive ? 'default' : 'outline'}>
                              {product.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setSelectedProduct(product)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => toggleProductStatus(product.id)}
                              >
                                {product.isActive ? <Trash className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gestion des commandes */}
            <TabsContent value="orders" className="mt-6 space-y-6">
              <h2 className="text-2xl font-bold">Gestion des Commandes</h2>
              
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Commande</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Articles</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customerName}</div>
                              <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{order.items.length} article(s)</TableCell>
                          <TableCell>{order.total}€</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{order.createdAt}</TableCell>
                          <TableCell>
                            <Select 
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value as Order['status'])}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">En attente</SelectItem>
                                <SelectItem value="processing">En cours</SelectItem>
                                <SelectItem value="shipped">Expédiée</SelectItem>
                                <SelectItem value="delivered">Livrée</SelectItem>
                                <SelectItem value="cancelled">Annulée</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gestion des clients */}
            <TabsContent value="customers" className="mt-6 space-y-6">
              <h2 className="text-2xl font-bold">Gestion des Clients</h2>
              
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Module de gestion des clients à développer
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Paramètres */}
            <TabsContent value="settings" className="mt-6 space-y-6">
              <h2 className="text-2xl font-bold">Paramètres de la Boutique</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Configuration générale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom de la boutique</label>
                      <Input placeholder="Nom de votre boutique" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Devise</label>
                      <Select defaultValue="eur">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eur">Euro (€)</SelectItem>
                          <SelectItem value="usd">Dollar ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea placeholder="Description de votre boutique..." />
                  </div>
                  <Button>Enregistrer les paramètres</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairerEcommerceInterface;
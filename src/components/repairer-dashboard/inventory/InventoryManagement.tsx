
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, AlertTriangle, ShoppingCart, TrendingDown, Plus, Search } from 'lucide-react';

interface InventoryItem {
  id: string;
  part: string;
  stock: number;
  minStock: number;
  price: number;
  supplier?: string;
  lastOrdered?: string;
  source?: string;
}

interface InventoryManagementProps {
  inventory: InventoryItem[];
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ 
  inventory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredInventory = inventory.filter(item =>
    item.part.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(item => item.stock <= item.minStock);
  const outOfStockItems = inventory.filter(item => item.stock === 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.price), 0);

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock === 0) return { status: 'Rupture', color: 'bg-red-100 text-red-800' };
    if (item.stock <= item.minStock) return { status: 'Stock faible', color: 'bg-orange-100 text-orange-800' };
    return { status: 'En stock', color: 'bg-green-100 text-green-800' };
  };

  const mockSuppliers = [
    { name: 'TechParts Pro', deliveryTime: '24-48h', rating: 4.8 },
    { name: 'Mobile Supply', deliveryTime: '48-72h', rating: 4.6 },
    { name: 'Repair Direct', deliveryTime: '24h', rating: 4.9 },
  ];

  return (
    <div className="space-y-6">

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total articles</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valeur stock</p>
                <p className="text-2xl font-bold">{totalValue.toFixed(0)}€</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock faible</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockItems.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ruptures</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems.length}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Gestion de l'inventaire
                </span>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher une pièce..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold">{item.part}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>Prix: {item.price}€</span>
                              {item.supplier && <span>• {item.supplier}</span>}
                              {item.source === 'demo' && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                  Démo
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">Stock: {item.stock}</p>
                          <p className="text-sm text-gray-600">Min: {item.minStock}</p>
                        </div>
                        <Badge className={stockStatus.color}>
                          {stockStatus.status}
                        </Badge>
                        {item.stock <= item.minStock && (
                          <Button size="sm" variant="outline">
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Commander
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Commandes en cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune commande en cours</p>
                <p className="text-sm">Les commandes automatiques apparaîtront ici</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Fournisseurs partenaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSuppliers.map((supplier, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{supplier.name}</h3>
                      <p className="text-sm text-gray-600">Livraison: {supplier.deliveryTime}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">★ {supplier.rating}</Badge>
                      <Button size="sm" variant="outline">Configurer</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics des stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <TrendingDown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Analytics détaillées en développement</p>
                <p className="text-sm">Prévisions de consommation, optimisation des stocks</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManagement;

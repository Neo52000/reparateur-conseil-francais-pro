
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Package, 
  AlertCircle, 
  TrendingDown, 
  TrendingUp,
  Plus,
  Edit,
  Smartphone,
  Battery,
  Monitor
} from 'lucide-react';

interface Part {
  id: string;
  name: string;
  category: string;
  compatibility: string[];
  stock: number;
  minStock: number;
  price: number;
  supplier: string;
  lastOrdered: string;
}

const PartsInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [parts, setParts] = useState<Part[]>([
    {
      id: '1',
      name: 'Écran LCD iPhone 13',
      category: 'écrans',
      compatibility: ['iPhone 13'],
      stock: 5,
      minStock: 10,
      price: 89.90,
      supplier: 'TechParts Pro',
      lastOrdered: '2024-06-10'
    },
    {
      id: '2',
      name: 'Batterie iPhone 13',
      category: 'batteries',
      compatibility: ['iPhone 13'],
      stock: 15,
      minStock: 8,
      price: 24.50,
      supplier: 'Mobile Parts',
      lastOrdered: '2024-06-08'
    },
    {
      id: '3',
      name: 'Écran OLED Samsung S23',
      category: 'écrans',
      compatibility: ['Samsung Galaxy S23'],
      stock: 2,
      minStock: 5,
      price: 125.00,
      supplier: 'Samsung Parts',
      lastOrdered: '2024-06-05'
    },
    {
      id: '4',
      name: 'Port de charge iPhone 13',
      category: 'connecteurs',
      compatibility: ['iPhone 13', 'iPhone 13 Pro'],
      stock: 8,
      minStock: 6,
      price: 15.90,
      supplier: 'TechParts Pro',
      lastOrdered: '2024-06-12'
    },
    {
      id: '5',
      name: 'Haut-parleur iPhone 13',
      category: 'audio',
      compatibility: ['iPhone 13'],
      stock: 12,
      minStock: 8,
      price: 18.50,
      supplier: 'Audio Parts',
      lastOrdered: '2024-06-07'
    }
  ]);

  const categories = [
    { id: 'all', name: 'Toutes', icon: Package },
    { id: 'écrans', name: 'Écrans', icon: Monitor },
    { id: 'batteries', name: 'Batteries', icon: Battery },
    { id: 'connecteurs', name: 'Connecteurs', icon: Smartphone },
    { id: 'audio', name: 'Audio', icon: Smartphone }
  ];

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.compatibility.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || part.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { status: 'rupture', color: 'destructive', text: 'Rupture' };
    if (stock <= minStock) return { status: 'faible', color: 'default', text: 'Stock Faible' };
    return { status: 'normal', color: 'secondary', text: 'Stock OK' };
  };

  const totalValue = parts.reduce((sum, part) => sum + (part.stock * part.price), 0);
  const lowStockItems = parts.filter(part => part.stock <= part.minStock).length;
  const outOfStockItems = parts.filter(part => part.stock === 0).length;

  return (
    <div className="space-y-6">
      {/* Inventory Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valeur totale</p>
                <p className="text-2xl font-bold">{totalValue.toFixed(2)}€</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Références</p>
                <p className="text-2xl font-bold">{parts.length}</p>
              </div>
              <Smartphone className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock faible</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockItems}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ruptures</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <CardTitle>Inventaire des Pièces</CardTitle>
              <CardDescription>Gérez votre stock de pièces détachées</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une pièce
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher par nom ou compatibilité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center"
              >
                <category.icon className="h-4 w-4 mr-1" />
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Parts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredParts.map((part) => {
          const stockStatus = getStockStatus(part.stock, part.minStock);
          return (
            <Card key={part.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{part.name}</h3>
                    <p className="text-sm text-gray-600">{part.supplier}</p>
                  </div>
                  <Badge variant={stockStatus.color as any}>
                    {stockStatus.text}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock actuel:</span>
                    <span className={`font-medium ${part.stock <= part.minStock ? 'text-orange-600' : 'text-gray-900'}`}>
                      {part.stock} unités
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock minimum:</span>
                    <span className="text-gray-900">{part.minStock} unités</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Prix unitaire:</span>
                    <span className="font-medium text-gray-900">{part.price.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Valeur stock:</span>
                    <span className="font-medium text-gray-900">{(part.stock * part.price).toFixed(2)}€</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Compatible avec:</p>
                  <div className="flex flex-wrap gap-1">
                    {part.compatibility.map((device, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {device}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Dernière commande: {new Date(part.lastOrdered).toLocaleDateString('fr-FR')}
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Modifier
                    </Button>
                    {part.stock <= part.minStock && (
                      <Button size="sm">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Commander
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredParts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune pièce trouvée pour votre recherche.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PartsInventory;

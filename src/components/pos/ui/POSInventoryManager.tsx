import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Package, 
  AlertTriangle, 
  Edit, 
  Barcode,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  cost_price: number;
  selling_price: number;
  supplier?: string;
  location?: string;
  last_restocked?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

const POSInventoryManager: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'value'>('name');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Données simulées d'inventaire
  const mockItems: InventoryItem[] = [
    {
      id: '1',
      sku: 'SCR-IP13-001',
      name: 'Écran iPhone 13',
      description: 'Écran OLED original qualité premium',
      category: 'Écrans',
      current_stock: 12,
      minimum_stock: 5,
      maximum_stock: 50,
      cost_price: 120.00,
      selling_price: 149.90,
      supplier: 'TechParts Pro',
      location: 'R-A-01',
      last_restocked: '2024-01-15',
      status: 'in_stock'
    },
    {
      id: '2',
      sku: 'BAT-SS21-001',
      name: 'Batterie Samsung S21',
      description: 'Batterie lithium-ion haute capacité',
      category: 'Batteries',
      current_stock: 3,
      minimum_stock: 5,
      maximum_stock: 30,
      cost_price: 65.00,
      selling_price: 89.90,
      supplier: 'MobileParts',
      location: 'R-B-03',
      last_restocked: '2024-01-10',
      status: 'low_stock'
    },
    {
      id: '3',
      sku: 'CHG-USB-C',
      name: 'Chargeur USB-C',
      description: 'Chargeur rapide 65W USB-C',
      category: 'Accessoires',
      current_stock: 0,
      minimum_stock: 10,
      maximum_stock: 100,
      cost_price: 15.00,
      selling_price: 29.90,
      supplier: 'PowerTech',
      location: 'R-C-02',
      last_restocked: '2024-01-05',
      status: 'out_of_stock'
    }
  ];

  useEffect(() => {
    setItems(mockItems);
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'stock':
        return b.current_stock - a.current_stock;
      case 'value':
        return (b.current_stock * b.selling_price) - (a.current_stock * a.selling_price);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const getStockBadgeVariant = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return 'destructive';
      case 'low_stock':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTotalInventoryValue = () => {
    return items.reduce((total, item) => total + (item.current_stock * item.cost_price), 0);
  };

  const getLowStockItems = () => {
    return items.filter(item => item.current_stock <= item.minimum_stock);
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Articles Total</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-admin-green" />
              <div>
                <p className="text-sm text-muted-foreground">Valeur Stock</p>
                <p className="text-2xl font-bold">{getTotalInventoryValue().toFixed(2)}€</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Stock Faible</p>
                <p className="text-2xl font-bold">{getLowStockItems().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-admin-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Ruptures</p>
                <p className="text-2xl font-bold">
                  {items.filter(item => item.status === 'out_of_stock').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et contrôles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Gestion de l'Inventaire</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-admin-green hover:bg-admin-green/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un Nouvel Article</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" placeholder="Ex: SCR-IP14-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de l'article</Label>
                    <Input id="name" placeholder="Ex: Écran iPhone 14" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Description détaillée..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ecrans">Écrans</SelectItem>
                        <SelectItem value="batteries">Batteries</SelectItem>
                        <SelectItem value="accessoires">Accessoires</SelectItem>
                        <SelectItem value="pieces">Pièces détachées</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Fournisseur</Label>
                    <Input id="supplier" placeholder="Nom du fournisseur" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost_price">Prix d'achat</Label>
                    <Input id="cost_price" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="selling_price">Prix de vente</Label>
                    <Input id="selling_price" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min_stock">Stock minimum</Label>
                    <Input id="min_stock" type="number" placeholder="5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_stock">Stock maximum</Label>
                    <Input id="max_stock" type="number" placeholder="50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Emplacement</Label>
                    <Input id="location" placeholder="Ex: R-A-01" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="initial_stock">Stock initial</Label>
                    <Input id="initial_stock" type="number" placeholder="0" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button className="bg-admin-green hover:bg-admin-green/90">
                    Ajouter l'Article
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher par nom ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="Écrans">Écrans</SelectItem>
                <SelectItem value="Batteries">Batteries</SelectItem>
                <SelectItem value="Accessoires">Accessoires</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="stock">Niveau de stock</SelectItem>
                <SelectItem value="value">Valeur stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table d'inventaire */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Emplacement</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Barcode className="w-3 h-3" />
                          {item.sku}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={getStockBadgeVariant(item.status)}>
                          {item.current_stock} / {item.minimum_stock}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Max: {item.maximum_stock}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{item.selling_price}€</div>
                        <div className="text-xs text-muted-foreground">
                          Achat: {item.cost_price}€
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {(item.current_stock * item.selling_price).toFixed(2)}€
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-admin-green"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default POSInventoryManager;
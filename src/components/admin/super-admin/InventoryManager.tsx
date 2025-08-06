import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  cost_price: number | null;
  selling_price: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number | null;
  is_active: boolean;
  is_service: boolean;
  repairer_id: string;
  created_at: string;
  updated_at: string;
}

const InventoryManager: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    cost_price: '',
    selling_price: '',
    stock_quantity: '',
    min_stock_level: '5',
    max_stock_level: '',
    is_service: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, categoryFilter, stockFilter]);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('inventory_items' as any)
        .select('*')
        .order('name');

      if (error) throw error;
      setItems((data as unknown as InventoryItem[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'inventaire:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'inventaire",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'low':
          filtered = filtered.filter(item => item.stock_quantity <= item.min_stock_level);
          break;
        case 'out':
          filtered = filtered.filter(item => item.stock_quantity === 0);
          break;
        case 'good':
          filtered = filtered.filter(item => item.stock_quantity > item.min_stock_level);
          break;
      }
    }

    setFilteredItems(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      const itemData = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description || null,
        category: formData.category || null,
        brand: formData.brand || null,
        model: formData.model || null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        selling_price: parseFloat(formData.selling_price),
        stock_quantity: parseInt(formData.stock_quantity),
        min_stock_level: parseInt(formData.min_stock_level),
        max_stock_level: formData.max_stock_level ? parseInt(formData.max_stock_level) : null,
        is_service: formData.is_service,
        repairer_id: 'admin' // TODO: Use actual admin ID
      };

      if (editingItem) {
        const { error } = await supabase
          .from('inventory_items' as any)
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        
        toast({
          title: "Article mis à jour",
          description: "L'article a été mis à jour avec succès",
        });
      } else {
        const { error } = await supabase
          .from('inventory_items' as any)
          .insert([itemData]);

        if (error) throw error;
        
        toast({
          title: "Article créé",
          description: "L'article a été créé avec succès",
        });
      }

      setIsCreateModalOpen(false);
      setEditingItem(null);
      resetForm();
      await fetchInventory();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder l'article",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      category: '',
      brand: '',
      model: '',
      cost_price: '',
      selling_price: '',
      stock_quantity: '',
      min_stock_level: '5',
      max_stock_level: '',
      is_service: false
    });
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      sku: item.sku,
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      brand: item.brand || '',
      model: item.model || '',
      cost_price: item.cost_price?.toString() || '',
      selling_price: item.selling_price.toString(),
      stock_quantity: item.stock_quantity.toString(),
      min_stock_level: item.min_stock_level.toString(),
      max_stock_level: item.max_stock_level?.toString() || '',
      is_service: item.is_service
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      const { error } = await supabase
        .from('inventory_items' as any)
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès",
      });
      
      await fetchInventory();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article",
        variant: "destructive"
      });
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock_quantity === 0) return { status: 'out', color: 'destructive', label: 'Rupture' };
    if (item.stock_quantity <= item.min_stock_level) return { status: 'low', color: 'secondary', label: 'Stock faible' };
    return { status: 'good', color: 'default', label: 'En stock' };
  };

  const lowStockItems = items.filter(item => item.stock_quantity <= item.min_stock_level && item.stock_quantity > 0).length;
  const outOfStockItems = items.filter(item => item.stock_quantity === 0).length;
  const totalValue = items.reduce((sum, item) => sum + (item.selling_price * item.stock_quantity), 0);
  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion de l'Inventaire</h2>
          <p className="text-muted-foreground">Synchronisation POS/E-commerce</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Synchroniser
          </Button>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingItem(null);
                resetForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Article
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Modifier l\'article' : 'Créer un nouvel article'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SKU</label>
                    <Input
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Code article"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nom de l'article"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de l'article"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Catégorie</label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Catégorie"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Marque</label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Marque"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Modèle</label>
                    <Input
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="Modèle"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prix d'achat</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prix de vente *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.selling_price}
                      onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stock actuel *</label>
                    <Input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stock minimum</label>
                    <Input
                      type="number"
                      value={formData.min_stock_level}
                      onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                      placeholder="5"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stock maximum</label>
                    <Input
                      type="number"
                      value={formData.max_stock_level}
                      onChange={(e) => setFormData({ ...formData, max_stock_level: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_service"
                    checked={formData.is_service}
                    onChange={(e) => setFormData({ ...formData, is_service: e.target.checked })}
                  />
                  <label htmlFor="is_service" className="text-sm">Article de service (non physique)</label>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {editingItem ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-admin-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Articles totaux</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-admin-yellow" />
              <div>
                <p className="text-sm text-muted-foreground">Stock faible</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-admin-red" />
              <div>
                <p className="text-sm text-muted-foreground">Rupture</p>
                <p className="text-2xl font-bold">{outOfStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-admin-green" />
              <div>
                <p className="text-sm text-muted-foreground">Valeur totale</p>
                <p className="text-2xl font-bold">{totalValue.toFixed(2)}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, SKU, marque ou modèle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category || 'unknown'} value={category || 'unknown'}>
                            {category || 'Non catégorisé'}
                          </SelectItem>
                        ))}
              </SelectContent>
            </Select>
            
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="État du stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les stocks</SelectItem>
                <SelectItem value="good">En stock</SelectItem>
                <SelectItem value="low">Stock faible</SelectItem>
                <SelectItem value="out">Rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des articles */}
      <Card>
        <CardHeader>
          <CardTitle>Articles d'inventaire</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && items.length === 0 ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun article trouvé
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg admin-card-hover">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.name}</p>
                          {item.is_service && (
                            <Badge variant="outline" className="text-xs">Service</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.sku} • {item.brand} {item.model}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{item.selling_price.toFixed(2)}€</p>
                        <p className="text-sm text-muted-foreground">
                          Stock: {item.stock_quantity}
                        </p>
                      </div>
                      
                      <Badge variant={stockStatus.color as any}>
                        {stockStatus.label}
                      </Badge>
                      
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManager;
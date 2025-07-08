import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, Minus, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Phase 9: Gestion des stocks et inventaire
const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [stockMovements, setStockMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchInventory();
    fetchStockMovements();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          product:ecommerce_products(name, sku, price)
        `)
        .order('current_stock', { ascending: true });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'inventaire",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStockMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          inventory_item:inventory_items(
            product:ecommerce_products(name, sku)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setStockMovements(data || []);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    }
  };

  const adjustStock = async () => {
    if (!selectedItem || adjustmentQuantity === 0) return;

    try {
      const newStock = selectedItem.current_stock + adjustmentQuantity;
      
      if (newStock < 0) {
        toast({
          title: "Erreur",
          description: "Le stock ne peut pas être négatif",
          variant: "destructive"
        });
        return;
      }

      // Mettre à jour le stock
      const { error: inventoryError } = await supabase
        .from('inventory_items')
        .update({ 
          current_stock: newStock,
          last_restocked: adjustmentQuantity > 0 ? new Date().toISOString() : undefined
        })
        .eq('id', selectedItem.id);

      if (inventoryError) throw inventoryError;

      // Enregistrer le mouvement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          inventory_item_id: selectedItem.id,
          movement_type: adjustmentQuantity > 0 ? 'in' : 'out',
          quantity: Math.abs(adjustmentQuantity),
          reason: adjustmentReason || 'Ajustement manuel'
        });

      if (movementError) throw movementError;

      toast({
        title: "Stock mis à jour",
        description: `Stock ajusté de ${adjustmentQuantity > 0 ? '+' : ''}${adjustmentQuantity}`
      });

      // Réinitialiser et recharger
      setSelectedItem(null);
      setAdjustmentQuantity(0);
      setAdjustmentReason('');
      await fetchInventory();
      await fetchStockMovements();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajuster le stock",
        variant: "destructive"
      });
    }
  };

  const getStockStatus = (item: any) => {
    if (item.current_stock === 0) {
      return { status: 'Rupture', variant: 'destructive' as const, icon: AlertTriangle };
    } else if (item.current_stock <= item.minimum_stock) {
      return { status: 'Stock faible', variant: 'secondary' as const, icon: TrendingDown };
    } else {
      return { status: 'En stock', variant: 'default' as const, icon: TrendingUp };
    }
  };

  const lowStockItems = inventory.filter(item => 
    item.current_stock <= item.minimum_stock
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Gestion des stocks
          </h2>
          <p className="text-muted-foreground">
            Gérez votre inventaire et suivez les mouvements de stock
          </p>
        </div>
      </div>

      {/* Alertes stock faible */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertes stock faible ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.slice(0, 6).map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-muted-foreground">{item.product?.sku}</p>
                  </div>
                  <Badge variant="secondary">
                    {item.current_stock} restants
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau des stocks */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire actuel</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock actuel</TableHead>
                  <TableHead>Stock minimum</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Emplacement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map(item => {
                  const stockStatus = getStockStatus(item);
                  const StatusIcon = stockStatus.icon;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product?.name}
                      </TableCell>
                      <TableCell>{item.product?.sku}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {item.current_stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.minimum_stock}
                      </TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {stockStatus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.location || 'Non défini'}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedItem(item)}
                            >
                              Ajuster
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ajuster le stock</DialogTitle>
                            </DialogHeader>
                            {selectedItem && (
                              <div className="space-y-4">
                                <div>
                                  <p className="font-medium">{selectedItem.product?.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Stock actuel : {selectedItem.current_stock}
                                  </p>
                                </div>
                                
                                <div>
                                  <Label htmlFor="adjustment">Ajustement</Label>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setAdjustmentQuantity(prev => prev - 1)}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                      id="adjustment"
                                      type="number"
                                      value={adjustmentQuantity}
                                      onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                                      className="text-center"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setAdjustmentQuantity(prev => prev + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="reason">Raison (optionnel)</Label>
                                  <Input
                                    id="reason"
                                    value={adjustmentReason}
                                    onChange={(e) => setAdjustmentReason(e.target.value)}
                                    placeholder="Ex: Réapprovisionnement, Vente, Casse..."
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <Button 
                                    onClick={adjustStock}
                                    disabled={adjustmentQuantity === 0}
                                    className="flex-1"
                                  >
                                    Confirmer l'ajustement
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Historique des mouvements */}
      <Card>
        <CardHeader>
          <CardTitle>Mouvements récents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Raison</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockMovements.map(movement => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {new Date(movement.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    {movement.inventory_item?.product?.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={movement.movement_type === 'in' ? 'default' : 'secondary'}>
                      {movement.movement_type === 'in' ? 'Entrée' : 'Sortie'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'}>
                      {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    {movement.reason || 'Non spécifiée'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;
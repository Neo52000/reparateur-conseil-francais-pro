import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Euro
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger les commandes
  const loadOrders = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ecommerce_orders')
        .select(`
          *,
          ecommerce_order_items (
            id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders((data || []).map(order => ({
        ...order,  
        order_status: order.order_status as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
        items: order.ecommerce_order_items || []
      }) as Order));
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user?.id]);

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('ecommerce_orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `La commande est maintenant "${getStatusLabel(newStatus)}"`
      });

      await loadOrders();
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  // Obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      processing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status as keyof typeof labels] || status;
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { variant: "secondary" as const, icon: Clock },
      confirmed: { variant: "default" as const, icon: CheckCircle },
      processing: { variant: "secondary" as const, icon: Package },
      shipped: { variant: "default" as const, icon: Truck },
      delivered: { variant: "default" as const, icon: CheckCircle },
      cancelled: { variant: "destructive" as const, icon: XCircle }
    };
    
    const config = configs[status as keyof typeof configs] || configs.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={status === 'delivered' ? 'bg-emerald-600' : ''}>
        <Icon className="w-3 h-3 mr-1" />
        {getStatusLabel(status)}
      </Badge>
    );
  };

  // Obtenir le badge de statut de paiement
  const getPaymentStatusBadge = (status: string) => {
    const configs = {
      pending: { variant: "secondary" as const, label: "En attente" },
      paid: { variant: "default" as const, label: "Payé" },
      failed: { variant: "destructive" as const, label: "Échec" },
      refunded: { variant: "outline" as const, label: "Remboursé" }
    };
    
    const config = configs[status as keyof typeof configs] || configs.pending;
    
    return (
      <Badge variant={config.variant} className={status === 'paid' ? 'bg-emerald-600' : ''}>
        <Euro className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculer les statistiques
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === 'pending').length,
    processing: orders.filter(o => o.order_status === 'processing').length,
    shipped: orders.filter(o => o.order_status === 'shipped').length,
    revenue: orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_amount, 0)
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Gestion des Commandes
          </h2>
          <p className="text-muted-foreground">
            {orders.length} commande{orders.length !== 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">En préparation</p>
                <p className="text-2xl font-bold">{stats.processing}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Expédiées</p>
                <p className="text-2xl font-bold">{stats.shipped}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">€{stats.revenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="processing">En préparation</SelectItem>
                <SelectItem value="shipped">Expédiée</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table des commandes */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-mono font-medium">
                      {order.order_number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.items?.length || 0} article{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customer_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">€{order.total_amount.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      HT: €{order.subtotal.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={order.order_status} 
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="confirmed">Confirmée</SelectItem>
                        <SelectItem value="processing">En préparation</SelectItem>
                        <SelectItem value="shipped">Expédiée</SelectItem>
                        <SelectItem value="delivered">Livrée</SelectItem>
                        <SelectItem value="cancelled">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(order.payment_status)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Dialog 
                      open={isOrderDetailOpen && selectedOrder?.id === order.id} 
                      onOpenChange={(open) => {
                        setIsOrderDetailOpen(open);
                        if (!open) setSelectedOrder(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Détails de la commande {order.order_number}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Informations client</h4>
                              <p><strong>Nom:</strong> {order.customer_name}</p>
                              <p><strong>Email:</strong> {order.customer_email}</p>
                              {order.customer_phone && (
                                <p><strong>Téléphone:</strong> {order.customer_phone}</p>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Statuts</h4>
                              <div className="space-y-2">
                                <div>Commande: {getStatusBadge(order.order_status)}</div>
                                <div>Paiement: {getPaymentStatusBadge(order.payment_status)}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Articles commandés</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Produit</TableHead>
                                  <TableHead>Qté</TableHead>
                                  <TableHead>Prix unitaire</TableHead>
                                  <TableHead>Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {order.items?.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>
                                      <div>
                                        <div className="font-medium">{item.product_name}</div>
                                        <div className="text-sm text-muted-foreground">{item.product_sku}</div>
                                      </div>
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>€{item.unit_price.toFixed(2)}</TableCell>
                                    <TableCell>€{item.total_price.toFixed(2)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          
                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center">
                              <span>Sous-total:</span>
                              <span>€{order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>TVA:</span>
                              <span>€{order.tax_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-lg">
                              <span>Total:</span>
                              <span>€{order.total_amount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucune commande ne correspond aux critères' 
                  : 'Aucune commande pour le moment'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
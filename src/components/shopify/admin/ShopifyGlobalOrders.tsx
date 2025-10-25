import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, Search, Filter, Download, Loader2, TrendingUp, ShoppingCart, Euro } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ShopifyOrder {
  id: string;
  order_number: string;
  shop_domain: string;
  store_name: string;
  repairer_name: string;
  repairer_email: string;
  customer_email: string;
  total_price: number;
  commission_amount: number;
  commission_status: string;
  financial_status: string;
  fulfillment_status: string;
  created_at: string;
}

interface OrderStats {
  total_orders: number;
  total_revenue: number;
  total_commissions: number;
  pending_commissions: number;
}

const ShopifyGlobalOrders: React.FC = () => {
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ShopifyOrder[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total_orders: 0,
    total_revenue: 0,
    total_commissions: 0,
    pending_commissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call when shopify_orders table is created
      const data: any[] = [];
      const error = null;

      if (error) throw error;

      const formattedOrders: ShopifyOrder[] = (data || []).map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        shop_domain: order.shop_domain,
        store_name: order.shopify_stores?.store_name || 'N/A',
        repairer_name: order.shopify_stores?.repairers?.full_name || 'N/A',
        repairer_email: order.shopify_stores?.repairers?.email || 'N/A',
        customer_email: order.customer_email || 'N/A',
        total_price: parseFloat(order.total_price || '0'),
        commission_amount: parseFloat(order.commission_amount || '0'),
        commission_status: order.commission_status || 'pending',
        financial_status: order.financial_status || 'pending',
        fulfillment_status: order.fulfillment_status || 'unfulfilled',
        created_at: order.created_at,
      }));

      setOrders(formattedOrders);

      // Calculate stats
      const totalRevenue = formattedOrders.reduce((sum, order) => sum + order.total_price, 0);
      const totalCommissions = formattedOrders.reduce((sum, order) => sum + order.commission_amount, 0);
      const pendingCommissions = formattedOrders
        .filter((order) => order.commission_status === 'pending')
        .reduce((sum, order) => sum + order.commission_amount, 0);

      setStats({
        total_orders: formattedOrders.length,
        total_revenue: totalRevenue,
        total_commissions: totalCommissions,
        pending_commissions: pendingCommissions,
      });
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les commandes Shopify',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.repairer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.financial_status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      paid: { variant: 'default', label: 'Payée' },
      pending: { variant: 'secondary', label: 'En attente' },
      refunded: { variant: 'destructive', label: 'Remboursée' },
      cancelled: { variant: 'outline', label: 'Annulée' },
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const exportToCSV = () => {
    const headers = ['N° Commande', 'Client', 'Réparateur', 'Boutique', 'Montant', 'Commission', 'Statut', 'Date'];
    const rows = filteredOrders.map((order) => [
      order.order_number,
      order.customer_email,
      order.repairer_name,
      order.store_name,
      order.total_price.toFixed(2),
      order.commission_amount.toFixed(2),
      order.financial_status,
      format(new Date(order.created_at), 'dd/MM/yyyy'),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopify-orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2 text-primary" />
              <span className="text-2xl font-bold">{stats.total_orders}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CA Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              <span className="text-2xl font-bold">{stats.total_revenue.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commissions Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Euro className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-2xl font-bold">{stats.total_commissions.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commissions En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Euro className="h-4 w-4 mr-2 text-yellow-600" />
              <span className="text-2xl font-bold">{stats.pending_commissions.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Commandes Shopify</CardTitle>
              <CardDescription>Toutes les commandes e-commerce de la plateforme</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par n° commande, client, réparateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="refunded">Remboursée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Réparateur</TableHead>
                  <TableHead>Boutique</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      Aucune commande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell className="text-sm">{order.customer_email}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{order.repairer_name}</div>
                          <div className="text-xs text-muted-foreground">{order.repairer_email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{order.store_name}</TableCell>
                      <TableCell className="text-right font-medium">{order.total_price.toFixed(2)} €</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {order.commission_amount.toFixed(2)} €
                      </TableCell>
                      <TableCell>{getStatusBadge(order.financial_status)}</TableCell>
                      <TableCell>{format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://${order.shop_domain}/admin/orders`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            {filteredOrders.length} commande(s) affichée(s) sur {orders.length} au total
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopifyGlobalOrders;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Package, Euro } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useShopifyStore } from '@/hooks/useShopifyStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ShopifyOrder {
  id: string;
  shopify_order_name: string;
  order_total_amount: number;
  order_currency: string;
  commission_amount: number;
  commission_rate: number;
  repairer_net_amount: number;
  commission_status: string;
  customer_email: string;
  order_fulfillment_status: string;
  created_at: string;
}

const ShopifyOrdersManager: React.FC = () => {
  const { store } = useShopifyStore();
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    netRevenue: 0,
  });

  useEffect(() => {
    if (store) {
      loadOrders();
    }
  }, [store]);

  const loadOrders = async () => {
    if (!store) return;

    try {
      const { data, error } = await supabase
        .from('shopify_order_commissions')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);

      // Calculate stats
      const totalRevenue = data?.reduce((sum, order) => sum + Number(order.order_total_amount), 0) || 0;
      const totalCommissions = data?.reduce((sum, order) => sum + Number(order.commission_amount), 0) || 0;
      const netRevenue = data?.reduce((sum, order) => sum + Number(order.repairer_net_amount), 0) || 0;

      setStats({
        totalOrders: data?.length || 0,
        totalRevenue,
        totalCommissions,
        netRevenue,
      });
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      calculated: 'default',
      paid: 'default',
      disputed: 'destructive',
    };

    const labels: Record<string, string> = {
      pending: 'En attente',
      calculated: 'Calculée',
      paid: 'Payée',
      disputed: 'Litige',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getFulfillmentBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Non expédiée</Badge>;

    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      fulfilled: 'default',
      partial: 'secondary',
      unfulfilled: 'secondary',
    };

    const labels: Record<string, string> = {
      fulfilled: 'Expédiée',
      partial: 'Partielle',
      unfulfilled: 'Non expédiée',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (!store) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Créez d'abord votre boutique Shopify pour gérer vos commandes
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Commandes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Chiffre d'affaires</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalRevenue.toFixed(2)}€</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Commissions plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">-{stats.totalCommissions.toFixed(2)}€</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenu net</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{stats.netRevenue.toFixed(2)}€</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Commandes Shopify</CardTitle>
              <CardDescription>Historique de vos commandes en ligne</CardDescription>
            </div>
            <Button asChild variant="outline">
              <a 
                href={`https://${store.shop_domain}/admin/orders`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Admin Shopify
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucune commande pour le moment</p>
              <p className="text-sm text-muted-foreground mt-2">
                Les commandes passéessur votre boutique Shopify apparaîtront ici
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Revenu net</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Expédition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.shopify_order_name}
                    </TableCell>
                    <TableCell>{order.customer_email}</TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {Number(order.order_total_amount).toFixed(2)} {order.order_currency}
                    </TableCell>
                    <TableCell className="text-orange-500">
                      -{Number(order.commission_amount).toFixed(2)}€
                      <span className="text-xs text-muted-foreground ml-1">
                        ({order.commission_rate}%)
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {Number(order.repairer_net_amount).toFixed(2)}€
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.commission_status)}
                    </TableCell>
                    <TableCell>
                      {getFulfillmentBadge(order.order_fulfillment_status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopifyOrdersManager;

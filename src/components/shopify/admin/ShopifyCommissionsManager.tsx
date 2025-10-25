import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Euro, DollarSign, TrendingUp, Users, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CommissionData {
  repairer_id: string;
  repairer_name: string;
  repairer_email: string;
  store_name: string;
  store_id: string;
  commission_rate: number;
  total_revenue: number;
  total_commissions: number;
  pending_commissions: number;
  paid_commissions: number;
  orders_count: number;
}

interface CommissionStats {
  total_month_commissions: number;
  pending_commissions: number;
  paid_commissions: number;
  active_repairers: number;
}

const ShopifyCommissionsManager: React.FC = () => {
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [stats, setStats] = useState<CommissionStats>({
    total_month_commissions: 0,
    pending_commissions: 0,
    paid_commissions: 0,
    active_repairers: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    try {
      setLoading(true);

      // Récupérer les commissions par réparateur
      const { data: storesData, error: storesError } = await supabase
        .from('shopify_stores')
        .select(`
          id,
          store_name,
          commission_rate,
          repairer_id,
          repairers!inner(
            full_name,
            email
          )
        `);

      if (storesError) throw storesError;

      // Mock orders data - replace when shopify_orders table exists
      const ordersData: any[] = [];

      // Calculer les commissions par réparateur
      const commissionsMap = new Map<string, CommissionData>();

      storesData?.forEach((store: any) => {
        const storeOrders = ordersData?.filter((order: any) => order.shop_domain === store.shop_domain) || [];
        const totalRevenue = storeOrders.reduce((sum: number, order: any) => sum + parseFloat(order.total_price || '0'), 0);
        const totalCommissions = storeOrders.reduce((sum: number, order: any) => sum + parseFloat(order.commission_amount || '0'), 0);
        const pendingCommissions = storeOrders
          .filter((order: any) => order.commission_status === 'pending')
          .reduce((sum: number, order: any) => sum + parseFloat(order.commission_amount || '0'), 0);
        const paidCommissions = storeOrders
          .filter((order: any) => order.commission_status === 'paid')
          .reduce((sum: number, order: any) => sum + parseFloat(order.commission_amount || '0'), 0);

        commissionsMap.set(store.repairer_id, {
          repairer_id: store.repairer_id,
          repairer_name: store.repairers?.full_name || 'N/A',
          repairer_email: store.repairers?.email || 'N/A',
          store_name: store.store_name || 'N/A',
          store_id: store.id,
          commission_rate: store.commission_rate || 3,
          total_revenue: totalRevenue,
          total_commissions: totalCommissions,
          pending_commissions: pendingCommissions,
          paid_commissions: paidCommissions,
          orders_count: storeOrders.length,
        });
      });

      const commissionsArray = Array.from(commissionsMap.values());
      setCommissions(commissionsArray);

      // Calculer les stats globales
      const totalPending = commissionsArray.reduce((sum, c) => sum + c.pending_commissions, 0);
      const totalPaid = commissionsArray.reduce((sum, c) => sum + c.paid_commissions, 0);
      const totalMonth = commissionsArray.reduce((sum, c) => sum + c.total_commissions, 0);

      setStats({
        total_month_commissions: totalMonth,
        pending_commissions: totalPending,
        paid_commissions: totalPaid,
        active_repairers: commissionsArray.filter((c) => c.orders_count > 0).length,
      });
    } catch (error) {
      console.error('Erreur chargement commissions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les commissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Réparateur', 'Email', 'Boutique', 'Taux %', 'CA Total', 'Commissions', 'En attente', 'Payées', 'Commandes'];
    const rows = commissions.map((c) => [
      c.repairer_name,
      c.repairer_email,
      c.store_name,
      c.commission_rate,
      c.total_revenue.toFixed(2),
      c.total_commissions.toFixed(2),
      c.pending_commissions.toFixed(2),
      c.paid_commissions.toFixed(2),
      c.orders_count,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopify-commissions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Commissions Mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-primary" />
              <span className="text-2xl font-bold">{stats.total_month_commissions.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Euro className="h-4 w-4 mr-2 text-yellow-600" />
              <span className="text-2xl font-bold">{stats.pending_commissions.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
              <span className="text-2xl font-bold">{stats.paid_commissions.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Réparateurs Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-2xl font-bold">{stats.active_repairers}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Commissions par Réparateur</CardTitle>
              <CardDescription>Vue détaillée des commissions et paiements</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Réparateur</TableHead>
                  <TableHead>Boutique</TableHead>
                  <TableHead className="text-right">Taux Commission</TableHead>
                  <TableHead className="text-right">CA Total</TableHead>
                  <TableHead className="text-right">Commissions</TableHead>
                  <TableHead className="text-right">En attente</TableHead>
                  <TableHead className="text-right">Payées</TableHead>
                  <TableHead className="text-right">Commandes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      Aucune commission trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  commissions
                    .sort((a, b) => b.total_commissions - a.total_commissions)
                    .map((commission) => (
                      <TableRow key={commission.repairer_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{commission.repairer_name}</div>
                            <div className="text-sm text-muted-foreground">{commission.repairer_email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{commission.store_name}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{commission.commission_rate}%</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{commission.total_revenue.toFixed(2)} €</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {commission.total_commissions.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-right text-yellow-600 font-medium">
                          {commission.pending_commissions.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          {commission.paid_commissions.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-right">{commission.orders_count}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={commission.pending_commissions === 0}
                            onClick={() => {
                              toast({
                                title: 'Paiement en préparation',
                                description: `Paiement de ${commission.pending_commissions.toFixed(2)} € à ${commission.repairer_name}`,
                              });
                            }}
                          >
                            Payer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopifyCommissionsManager;

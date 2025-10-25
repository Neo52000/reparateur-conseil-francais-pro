import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Store, ExternalLink, TrendingUp, Users, Euro } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AdminShopifyStore {
  id: string;
  repairer_email: string;
  repairer_name: string;
  shop_domain: string;
  store_status: string;
  store_name: string;
  claimed_at: string | null;
  commission_rate: number;
  created_at: string;
  total_orders: number;
  total_revenue: number;
  total_commissions: number;
}

const AdminShopifyDashboard: React.FC = () => {
  const [stores, setStores] = useState<AdminShopifyStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    totalStores: 0,
    activeStores: 0,
    totalRevenue: 0,
    totalCommissions: 0,
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_shopify_stores_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStores(data || []);

      // Calculate global stats
      const activeStores = data?.filter(s => 
        s.store_status === 'active' || s.store_status === 'claimed'
      ).length || 0;
      
      const totalRevenue = data?.reduce((sum, store) => 
        sum + Number(store.total_revenue || 0), 0
      ) || 0;
      
      const totalCommissions = data?.reduce((sum, store) => 
        sum + Number(store.total_commissions || 0), 0
      ) || 0;

      setGlobalStats({
        totalStores: data?.length || 0,
        activeStores,
        totalRevenue,
        totalCommissions,
      });
    } catch (error) {
      console.error('Error loading Shopify stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      sandbox: 'secondary',
      development: 'secondary',
      claimed: 'default',
      active: 'default',
      suspended: 'destructive',
    };

    const labels: Record<string, string> = {
      sandbox: 'Développement',
      development: 'Développement',
      claimed: 'Activée',
      active: 'Active',
      suspended: 'Suspendue',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

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
      {/* Global stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Boutiques Totales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{globalStats.totalStores}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {globalStats.activeStores} actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Boutiques Actives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{globalStats.activeStores}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {((globalStats.activeStores / globalStats.totalStores) * 100).toFixed(0)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              CA Total Généré
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{globalStats.totalRevenue.toFixed(2)}€</p>
            <p className="text-sm text-muted-foreground mt-1">
              Toutes boutiques confondues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Euro className="w-4 h-4" />
              Commissions Totales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">{globalStats.totalCommissions.toFixed(2)}€</p>
            <p className="text-sm text-muted-foreground mt-1">
              Revenus plateforme
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stores table */}
      <Card>
        <CardHeader>
          <CardTitle>Boutiques Shopify des Réparateurs</CardTitle>
          <CardDescription>
            Vue d'ensemble de toutes les boutiques créées sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stores.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucune boutique Shopify créée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Réparateur</TableHead>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Domaine</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Commandes</TableHead>
                  <TableHead>CA Total</TableHead>
                  <TableHead>Commissions</TableHead>
                  <TableHead>Création</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{store.repairer_name}</p>
                        <p className="text-sm text-muted-foreground">{store.repairer_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {store.store_name || 'Sans nom'}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {store.shop_domain}
                      </code>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(store.store_status)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{store.commission_rate}%</Badge>
                    </TableCell>
                    <TableCell>{store.total_orders || 0}</TableCell>
                    <TableCell className="font-semibold">
                      {Number(store.total_revenue || 0).toFixed(2)}€
                    </TableCell>
                    <TableCell className="font-semibold text-orange-500">
                      {Number(store.total_commissions || 0).toFixed(2)}€
                    </TableCell>
                    <TableCell>
                      {format(new Date(store.created_at), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <a 
                          href={`https://${store.shop_domain}/admin`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
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

export default AdminShopifyDashboard;

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, Search, Filter, Download, Loader2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ShopifyStoreDetails {
  id: string;
  repairer_id: string;
  repairer_name: string;
  repairer_email: string;
  store_name: string;
  shop_domain: string;
  store_status: string;
  commission_rate: number;
  products_count?: number;
  total_revenue: number;
  total_commissions: number;
  created_at: string;
  claimed_at: string | null;
}

const ShopifyStoresManager: React.FC = () => {
  const [stores, setStores] = useState<ShopifyStoreDetails[]>([]);
  const [filteredStores, setFilteredStores] = useState<ShopifyStoreDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    filterStores();
  }, [searchTerm, statusFilter, stores]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_shopify_stores_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Erreur chargement boutiques:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les boutiques Shopify',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStores = () => {
    let filtered = [...stores];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (store) =>
          store.repairer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.repairer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.shop_domain?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((store) => store.store_status === statusFilter);
    }

    setFilteredStores(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      claimed: { variant: 'secondary', label: 'Revendiquée' },
      sandbox: { variant: 'outline', label: 'Sandbox' },
      suspended: { variant: 'destructive', label: 'Suspendue' },
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const exportToCSV = () => {
    const headers = ['Réparateur', 'Email', 'Boutique', 'Domaine', 'Statut', 'Commission %', 'Produits', 'CA Total', 'Commissions', 'Date création'];
    const rows = filteredStores.map((store) => [
      store.repairer_name,
      store.repairer_email,
      store.store_name,
      store.shop_domain,
      store.store_status,
      store.commission_rate,
      store.products_count,
      store.total_revenue,
      store.total_commissions,
      format(new Date(store.created_at), 'dd/MM/yyyy'),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopify-stores-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Boutiques Shopify</CardTitle>
              <CardDescription>Gestion de toutes les boutiques e-commerce réparateurs</CardDescription>
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
                placeholder="Rechercher par nom, email, boutique..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="claimed">Revendiquée</SelectItem>
                <SelectItem value="sandbox">Sandbox</SelectItem>
                <SelectItem value="suspended">Suspendue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Réparateur</TableHead>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Domaine</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Produits</TableHead>
                  <TableHead className="text-right">CA Total</TableHead>
                  <TableHead className="text-right">Commissions</TableHead>
                  <TableHead>Créée le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      Aucune boutique trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{store.repairer_name}</div>
                          <div className="text-sm text-muted-foreground">{store.repairer_email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{store.store_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{store.shop_domain}</TableCell>
                      <TableCell>{getStatusBadge(store.store_status)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{store.commission_rate}%</Badge>
                      </TableCell>
                      <TableCell className="text-right">{store.products_count || 0}</TableCell>
                      <TableCell className="text-right font-medium">{store.total_revenue?.toFixed(2) || '0.00'} €</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {store.total_commissions?.toFixed(2) || '0.00'} €
                      </TableCell>
                      <TableCell>{format(new Date(store.created_at), 'dd MMM yyyy', { locale: fr })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://${store.shop_domain}/admin`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Stats footer */}
          <div className="mt-4 text-sm text-muted-foreground">
            {filteredStores.length} boutique(s) affichée(s) sur {stores.length} au total
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopifyStoresManager;

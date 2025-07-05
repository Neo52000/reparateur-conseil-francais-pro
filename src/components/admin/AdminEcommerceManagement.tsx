import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Store, Package, Settings, RefreshCw, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EcommerceStats {
  totalOrders: number;
  totalRevenue: number;
  activeStores: number;
  totalProducts: number;
}

interface EcommerceOrder {
  id: string;
  repairer_id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  repairer_name: string;
}

const AdminEcommerceManagement: React.FC = () => {
  const [stats, setStats] = useState<EcommerceStats>({
    totalOrders: 0,
    totalRevenue: 0,
    activeStores: 0,
    totalProducts: 0
  });
  const [orders, setOrders] = useState<EcommerceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      // Récupérer les boutiques actives avec module E-commerce
      const { data: activeStoresData } = await supabase
        .from('module_subscriptions')
        .select('repairer_id')
        .eq('module_type', 'ecommerce')
        .eq('module_active', true);

      // Pour l'instant, utiliser des données simulées car les tables E-commerce n'existent pas encore
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        activeStores: activeStoresData?.length || 0,
        totalProducts: 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des stats E-commerce:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques E-commerce",
        variant: "destructive"
      });
    }
  };

  const fetchOrders = async () => {
    try {
      // Pour l'instant, les tables E-commerce n'existent pas encore
      // Utiliser des données vides
      setOrders([]);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchOrders()]);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administration E-commerce</h1>
          <p className="text-muted-foreground">Gestion globale des boutiques en ligne</p>
        </div>
        <Button onClick={refreshData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <ShoppingCart className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Commandes totales</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</p>
              <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}€</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Store className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Boutiques actives</p>
              <p className="text-2xl font-bold">{stats.activeStores}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Package className="h-8 w-8 text-orange-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Produits totaux</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders">Commandes récentes</TabsTrigger>
          <TabsTrigger value="stores">Boutiques</TabsTrigger>
          <TabsTrigger value="settings">Paramètres globaux</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Commandes E-commerce récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">{order.repairer_name}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{order.total_amount?.toFixed(2)}€</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune commande trouvée
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Boutiques E-commerce
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Vue d'ensemble des boutiques</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.activeStores} boutique(s) e-commerce active(s) avec {stats.totalProducts} produit(s) au total.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres E-commerce globaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Configuration des modules E-commerce</h3>
                  <p className="text-sm text-muted-foreground">
                    Les paramètres globaux des modules E-commerce peuvent être configurés ici.
                    Cette section sera développée selon les besoins spécifiques.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminEcommerceManagement;
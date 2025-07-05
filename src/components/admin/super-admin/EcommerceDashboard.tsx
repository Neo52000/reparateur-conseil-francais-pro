import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Store, 
  TrendingUp, 
  Users, 
  Package,
  Globe,
  Eye,
  MousePointer,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import SuperAdminLayout from './SuperAdminLayout';
import MetricsCard from './MetricsCard';
import AdvancedTable, { TableColumn, TableAction } from './AdvancedTable';
import ModuleManagementModal from './ModuleManagementModal';
import TemplateManager from './TemplateManager';
import OrdersManager from './OrdersManager';
import InventoryManager from './InventoryManager';
import SyncManager from './SyncManager';
import AdvancedAnalytics from './AdvancedAnalytics';
import InteractiveEcommercePreview from '../preview/InteractiveEcommercePreview';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EcommerceStats {
  totalRevenue: number;
  totalOrders: number;
  activeStores: number;
  conversionRate: number;
  monthlyGrowth: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface EcommerceStore {
  id: string;
  name: string;
  owner: string;
  email: string;
  status: 'active' | 'inactive' | 'maintenance';
  domain: string;
  monthlyOrders: number;
  monthlyRevenue: number;
  conversionRate: number;
  plan: string;
  lastActivity: string;
}

const EcommerceDashboard: React.FC = () => {
  const [stats, setStats] = useState<EcommerceStats>({
    totalRevenue: 0,
    totalOrders: 0,
    activeStores: 0,
    conversionRate: 0,
    monthlyGrowth: 0,
    systemHealth: 'healthy'
  });
  const [stores, setStores] = useState<EcommerceStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<{ id: string; name: string } | null>(null);
  const [isEcommerceFullscreen, setIsEcommerceFullscreen] = useState(false);
  const { toast } = useToast();

  // Données de démonstration pour les graphiques
  const salesData = [
    { month: 'Jan', revenue: 25400, orders: 342, visitors: 12450 },
    { month: 'Fév', revenue: 31200, orders: 428, visitors: 15670 },
    { month: 'Mar', revenue: 28900, orders: 387, visitors: 14320 },
    { month: 'Avr', revenue: 35600, orders: 485, visitors: 18920 },
    { month: 'Mai', revenue: 42300, orders: 567, visitors: 21340 },
    { month: 'Jun', revenue: 38700, orders: 523, visitors: 19850 },
  ];

  const storeTypesData = [
    { name: 'E-commerce Basic', value: 40, color: 'hsl(var(--admin-blue))' },
    { name: 'E-commerce Pro', value: 35, color: 'hsl(var(--admin-green))' },
    { name: 'E-commerce Enterprise', value: 25, color: 'hsl(var(--admin-purple))' },
  ];

  const storeColumns: TableColumn[] = [
    {
      key: 'name',
      title: 'Boutique',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.domain}</div>
        </div>
      )
    },
    {
      key: 'owner',
      title: 'Propriétaire',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.email}</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Statut',
      sortable: true,
      render: (value) => (
        <Badge variant={
          value === 'active' ? 'default' : 
          value === 'maintenance' ? 'secondary' : 'destructive'
        }>
          {value === 'active' ? 'Active' : 
           value === 'maintenance' ? 'Maintenance' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'plan',
      title: 'Plan',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'monthlyOrders',
      title: 'Commandes/mois',
      sortable: true,
      render: (value) => value.toLocaleString()
    },
    {
      key: 'monthlyRevenue',
      title: 'CA Mensuel',
      sortable: true,
      render: (value) => `${value.toLocaleString()}€`
    },
    {
      key: 'conversionRate',
      title: 'Taux conversion',
      sortable: true,
      render: (value) => `${value}%`
    },
    {
      key: 'lastActivity',
      title: 'Dernière activité',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('fr-FR')
    }
  ];

  const storeActions: TableAction[] = [
    {
      label: 'Voir boutique',
      onClick: (row) => {
        window.open(`https://${row.domain}`, '_blank');
      }
    },
    {
      label: 'Analytics',
      onClick: (row) => {
        toast({
          title: "Analytics",
          description: `Affichage des analytics pour ${row.name}`,
        });
      }
    },
    {
      label: 'Gérer templates',
      onClick: (row) => {
        setSelectedStore({ id: row.id, name: row.name });
        setModuleModalOpen(true);
      }
    },
    {
      label: 'Suspendre',
      onClick: (row) => {
        toast({
          title: "Boutique suspendue",
          description: `${row.name} a été suspendue`,
          variant: "destructive"
        });
      },
      variant: 'destructive'
    }
  ];

  useEffect(() => {
    fetchEcommerceData();
  }, []);

  const fetchEcommerceData = async () => {
    try {
      setIsLoading(true);
      
      // Récupérer les vraies données depuis Supabase
      const { data: storesData, error: storesError } = await supabase
        .from('ecommerce_stores')
        .select('*');

      if (storesError) throw storesError;

      // Calculer les statistiques
      const totalRevenue = storesData?.reduce((sum, store) => sum + (Number(store.monthly_revenue) || 0), 0) || 0;
      const totalOrders = storesData?.reduce((sum, store) => sum + (store.monthly_orders || 0), 0) || 0;
      const activeStores = storesData?.filter(store => store.status === 'active').length || 0;
      const avgConversionRate = storesData?.length > 0 ? 
        storesData.reduce((sum, store) => sum + (Number(store.conversion_rate) || 0), 0) / storesData.length : 0;

      setStats({
        totalRevenue,
        totalOrders,
        activeStores,
        conversionRate: avgConversionRate,
        monthlyGrowth: 18.4, // Calculé plus tard avec les analytics
        systemHealth: 'healthy'
      });

      // Transformer les données pour l'affichage
      const transformedStores = storesData?.map(store => ({
        id: store.id,
        name: store.store_name,
        owner: `Propriétaire ${store.store_name}`,
        email: `contact@${store.store_name.toLowerCase().replace(/\s+/g, '')}.fr`,
        status: store.status as 'active' | 'inactive' | 'maintenance',
        domain: store.domain || `${store.store_name.toLowerCase().replace(/\s+/g, '')}.repairhub.fr`,
        monthlyOrders: store.monthly_orders,
        monthlyRevenue: Number(store.monthly_revenue),
        conversionRate: Number(store.conversion_rate),
        plan: `E-commerce ${store.plan_type.charAt(0).toUpperCase() + store.plan_type.slice(1)}`,
        lastActivity: store.last_activity
      })) || [];

      setStores(transformedStores);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données E-commerce:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données E-commerce",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SuperAdminLayout
      title="Administration E-commerce"
      subtitle="Gestion centralisée des boutiques en ligne"
      stats={{
        totalRepairers: stats.activeStores,
        activeModules: stats.totalOrders,
        monthlyRevenue: stats.totalRevenue,
        systemHealth: stats.systemHealth
      }}
      onRefresh={fetchEcommerceData}
    >
      <div className="space-y-6">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Chiffre d'affaires total"
            value={`${stats.totalRevenue.toLocaleString()}€`}
            icon={TrendingUp}
            color="green"
            trend={{
              value: stats.monthlyGrowth,
              isPositive: true,
              period: "ce mois"
            }}
            isLoading={isLoading}
          />
          <MetricsCard
            title="Commandes totales"
            value={stats.totalOrders.toLocaleString()}
            icon={ShoppingCart}
            color="blue"
            trend={{
              value: 15.3,
              isPositive: true,
              period: "ce mois"
            }}
            isLoading={isLoading}
          />
          <MetricsCard
            title="Boutiques actives"
            value={stats.activeStores}
            icon={Store}
            color="purple"
            trend={{
              value: 8.7,
              isPositive: true,
              period: "ce mois"
            }}
            isLoading={isLoading}
          />
          <MetricsCard
            title="Taux de conversion"
            value={`${stats.conversionRate}%`}
            icon={MousePointer}
            color="orange"
            trend={{
              value: 0.4,
              isPositive: true,
              period: "ce mois"
            }}
            isLoading={isLoading}
          />
        </div>

        {/* Tableaux de bord et analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="boutique">Boutique</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="stores">Boutiques</TabsTrigger>
            <TabsTrigger value="inventory">Inventaire</TabsTrigger>
            <TabsTrigger value="sync">Synchronisation</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution des ventes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--admin-green))" 
                        fill="hsl(var(--admin-green-light))" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Répartition des plans E-commerce</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={storeTypesData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {storeTypesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Performance globale */}
            <Card>
              <CardHeader>
                <CardTitle>Performance globale des boutiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Eye className="h-6 w-6 text-admin-blue" />
                    <div>
                      <p className="text-sm text-muted-foreground">Visiteurs uniques</p>
                      <p className="font-medium text-lg">124,567</p>
                      <p className="text-xs text-admin-green">+12.4% ce mois</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-admin-green" />
                    <div>
                      <p className="text-sm text-muted-foreground">Panier moyen</p>
                      <p className="font-medium text-lg">89.45€</p>
                      <p className="text-xs text-admin-green">+3.2% ce mois</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Package className="h-6 w-6 text-admin-purple" />
                    <div>
                      <p className="text-sm text-muted-foreground">Produits vendus</p>
                      <p className="font-medium text-lg">4,567</p>
                      <p className="text-xs text-admin-green">+18.7% ce mois</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Globe className="h-6 w-6 text-admin-orange" />
                    <div>
                      <p className="text-sm text-muted-foreground">Domaines actifs</p>
                      <p className="font-medium text-lg">23</p>
                      <p className="text-xs text-admin-green">+2 ce mois</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boutique">
            <InteractiveEcommercePreview
              settings={{
                store_template: { theme: 'modern', colors: { primary: '#3b82f6', secondary: '#64748b' } },
                default_shipping: { free_threshold: 50, standard_rate: 5.99 },
                payment_gateways: { stripe: true, paypal: true },
                tax_settings: { include_tax: true, display_tax: true }
              }}
              isFullscreen={isEcommerceFullscreen}
              onToggleFullscreen={() => setIsEcommerceFullscreen(!isEcommerceFullscreen)}
            />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersManager />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManager />
          </TabsContent>

          <TabsContent value="stores">
            <div className="space-y-6">
              <AdvancedTable
                title="Gestion des boutiques E-commerce"
                data={stores}
                columns={storeColumns}
                actions={storeActions}
                searchPlaceholder="Rechercher une boutique..."
                isLoading={isLoading}
                onExport={() => {
                  toast({
                    title: "Export en cours",
                    description: "Les données des boutiques sont en cours d'export",
                  });
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="sync">
            <SyncManager />
          </TabsContent>

          <TabsContent value="system">
            <Tabs defaultValue="analytics" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="advanced">Analytics+</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Commandes vs Visiteurs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="orders" 
                              stroke="hsl(var(--admin-green))" 
                              name="Commandes"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="visitors" 
                              stroke="hsl(var(--admin-blue))" 
                              name="Visiteurs"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Top produits vendus</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { name: 'Écran iPhone 14', sales: 234, revenue: '12,450€' },
                            { name: 'Batterie Samsung Galaxy', sales: 189, revenue: '8,967€' },
                            { name: 'Vitre tactile iPad', sales: 156, revenue: '7,890€' },
                            { name: 'Connecteur de charge', sales: 123, revenue: '4,567€' },
                            { name: 'Haut-parleur iPhone', sales: 98, revenue: '3,245€' },
                          ].map((product, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.sales} ventes</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-admin-green">{product.revenue}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Analyse des conversions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="orders" fill="hsl(var(--admin-purple))" name="Commandes" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="advanced">
                <AdvancedAnalytics />
              </TabsContent>

              <TabsContent value="templates">
                <TemplateManager />
              </TabsContent>

              <TabsContent value="monitoring">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-8 w-8 text-admin-green" />
                          <div>
                            <p className="text-sm text-muted-foreground">Boutiques en ligne</p>
                            <p className="font-medium">23/23 actives</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-8 w-8 text-admin-green" />
                          <div>
                            <p className="text-sm text-muted-foreground">Paiements</p>
                            <p className="font-medium">Tous opérationnels</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-8 w-8 text-admin-yellow" />
                          <div>
                            <p className="text-sm text-muted-foreground">SSL/Sécurité</p>
                            <p className="font-medium">1 à renouveler</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-8 w-8 text-admin-green" />
                          <div>
                            <p className="text-sm text-muted-foreground">Performance</p>
                            <p className="font-medium">Excellente</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Activité temps réel</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { time: '14:35', message: 'Nouvelle commande - TechStore Pro (234€)', type: 'success' },
                          { time: '14:33', message: 'Paiement validé - Mobile Parts Shop', type: 'success' },
                          { time: '14:31', message: 'Boutique déployée - Repair Components', type: 'info' },
                          { time: '14:28', message: 'Certificat SSL renouvelé automatiquement', type: 'success' },
                          { time: '14:25', message: 'Alerte: Trafic élevé détecté sur techstore.fr', type: 'warning' },
                        ].map((log, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className={`w-2 h-2 rounded-full ${
                              log.type === 'success' ? 'bg-admin-green' :
                              log.type === 'warning' ? 'bg-admin-yellow' :
                              'bg-admin-blue'
                            }`} />
                            <span className="text-sm text-muted-foreground">{log.time}</span>
                            <span className="text-sm flex-1">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      {/* Module Management Modal */}
      {selectedStore && (
        <ModuleManagementModal
          isOpen={moduleModalOpen}
          onClose={() => {
            setModuleModalOpen(false);
            setSelectedStore(null);
          }}
          repairerId={selectedStore.id}
          repairerName={selectedStore.name}
        />
      )}
    </SuperAdminLayout>
  );
};

export default EcommerceDashboard;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign,
  ShoppingCart,
  Clock,
  AlertCircle,
  CheckCircle,
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface POSStats {
  totalRevenue: number;
  totalTransactions: number;
  activeRepairers: number;
  averageTicket: number;
  monthlyGrowth: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface POSRepairer {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'trial';
  lastActivity: string;
  totalTransactions: number;
  monthlyRevenue: number;
  plan: string;
}

const POSDashboard: React.FC = () => {
  const [stats, setStats] = useState<POSStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    activeRepairers: 0,
    averageTicket: 0,
    monthlyGrowth: 0,
    systemHealth: 'healthy'
  });
  const [repairers, setRepairers] = useState<POSRepairer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Données de démonstration pour les graphiques
  const revenueData = [
    { month: 'Jan', revenue: 12500, transactions: 156 },
    { month: 'Fév', revenue: 15200, transactions: 189 },
    { month: 'Mar', revenue: 18900, transactions: 234 },
    { month: 'Avr', revenue: 16700, transactions: 198 },
    { month: 'Mai', revenue: 21300, transactions: 267 },
    { month: 'Jun', revenue: 19800, transactions: 245 },
  ];

  const moduleUsageData = [
    { name: 'POS Basic', value: 45, color: 'hsl(var(--admin-blue))' },
    { name: 'POS Pro', value: 30, color: 'hsl(var(--admin-green))' },
    { name: 'POS Enterprise', value: 25, color: 'hsl(var(--admin-purple))' },
  ];

  const repairerColumns: TableColumn[] = [
    {
      key: 'name',
      title: 'Réparateur',
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
          value === 'trial' ? 'secondary' : 'destructive'
        }>
          {value === 'active' ? 'Actif' : 
           value === 'trial' ? 'Essai' : 'Inactif'}
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
      key: 'totalTransactions',
      title: 'Transactions',
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
      key: 'lastActivity',
      title: 'Dernière activité',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('fr-FR')
    }
  ];

  const repairerActions: TableAction[] = [
    {
      label: 'Voir détails',
      onClick: (row) => {
        toast({
          title: "Détails du réparateur",
          description: `Affichage des détails pour ${row.name}`,
        });
      }
    },
    {
      label: 'Gérer modules',
      onClick: (row) => {
        toast({
          title: "Gestion des modules",
          description: `Gestion des modules pour ${row.name}`,
        });
      }
    },
    {
      label: 'Suspendre',
      onClick: (row) => {
        toast({
          title: "Réparateur suspendu",
          description: `${row.name} a été suspendu`,
          variant: "destructive"
        });
      },
      variant: 'destructive'
    }
  ];

  useEffect(() => {
    fetchPOSData();
  }, []);

  const fetchPOSData = async () => {
    try {
      setIsLoading(true);
      
      // Simuler des données pour la démonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalRevenue: 124500,
        totalTransactions: 1289,
        activeRepairers: 47,
        averageTicket: 96.50,
        monthlyGrowth: 12.5,
        systemHealth: 'healthy'
      });

      setRepairers([
        {
          id: '1',
          name: 'TechRepairer Pro',
          email: 'contact@techrepairer.fr',
          status: 'active',
          lastActivity: '2024-01-15T10:30:00Z',
          totalTransactions: 234,
          monthlyRevenue: 12450,
          plan: 'POS Pro'
        },
        {
          id: '2',
          name: 'Mobile Fix Expert',
          email: 'info@mobilefix.fr',
          status: 'active',
          lastActivity: '2024-01-14T16:45:00Z',
          totalTransactions: 187,
          monthlyRevenue: 8900,
          plan: 'POS Basic'
        },
        {
          id: '3',
          name: 'Quick Repair Solutions',
          email: 'contact@quickrepair.fr',
          status: 'trial',
          lastActivity: '2024-01-13T09:15:00Z',
          totalTransactions: 56,
          monthlyRevenue: 2100,
          plan: 'POS Enterprise'
        }
      ]);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données POS:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données POS",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SuperAdminLayout
      title="Administration POS"
      subtitle="Gestion centralisée des systèmes Point de Vente"
      stats={{
        totalRepairers: stats.activeRepairers,
        activeModules: stats.totalTransactions,
        monthlyRevenue: stats.totalRevenue,
        systemHealth: stats.systemHealth
      }}
      onRefresh={fetchPOSData}
    >
      <div className="space-y-6">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Chiffre d'affaires total"
            value={`${stats.totalRevenue.toLocaleString()}€`}
            icon={DollarSign}
            color="green"
            trend={{
              value: stats.monthlyGrowth,
              isPositive: true,
              period: "ce mois"
            }}
            isLoading={isLoading}
          />
          <MetricsCard
            title="Transactions totales"
            value={stats.totalTransactions.toLocaleString()}
            icon={CreditCard}
            color="blue"
            trend={{
              value: 8.2,
              isPositive: true,
              period: "ce mois"
            }}
            isLoading={isLoading}
          />
          <MetricsCard
            title="Réparateurs actifs"
            value={stats.activeRepairers}
            icon={Users}
            color="purple"
            trend={{
              value: 5.4,
              isPositive: true,
              period: "ce mois"
            }}
            isLoading={isLoading}
          />
          <MetricsCard
            title="Ticket moyen"
            value={`${stats.averageTicket.toFixed(2)}€`}
            icon={TrendingUp}
            color="orange"
            trend={{
              value: 2.1,
              isPositive: false,
              period: "ce mois"
            }}
            isLoading={isLoading}
          />
        </div>

        {/* Tableaux de bord et analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="repairers">Réparateurs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution du chiffre d'affaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
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
                  <CardTitle>Répartition des plans POS</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={moduleUsageData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {moduleUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Statut système */}
            <Card>
              <CardHeader>
                <CardTitle>Statut du système POS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <CheckCircle className="h-6 w-6 text-admin-green" />
                    <div>
                      <p className="font-medium">Système opérationnel</p>
                      <p className="text-sm text-muted-foreground">Tous les services fonctionnent</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Activity className="h-6 w-6 text-admin-blue" />
                    <div>
                      <p className="font-medium">47 POS connectés</p>
                      <p className="text-sm text-muted-foreground">Dernière synchronisation: il y a 2 min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Clock className="h-6 w-6 text-admin-purple" />
                    <div>
                      <p className="font-medium">Uptime: 99.9%</p>
                      <p className="text-sm text-muted-foreground">Dernière interruption: il y a 7 jours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="repairers">
            <div className="space-y-6">
              <AdvancedTable
                title="Gestion des réparateurs POS"
                data={repairers}
                columns={repairerColumns}
                actions={repairerActions}
                searchPlaceholder="Rechercher un réparateur..."
                isLoading={isLoading}
                onExport={() => {
                  toast({
                    title: "Export en cours",
                    description: "Les données des réparateurs sont en cours d'export",
                  });
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transactions par mois</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="transactions" fill="hsl(var(--admin-blue))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance comparative</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--admin-green))" 
                        name="Revenus"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="transactions" 
                        stroke="hsl(var(--admin-blue))" 
                        name="Transactions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-admin-green" />
                      <div>
                        <p className="text-sm text-muted-foreground">API POS</p>
                        <p className="font-medium">Opérationnel</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-admin-green" />
                      <div>
                        <p className="text-sm text-muted-foreground">Base de données</p>
                        <p className="font-medium">Saine</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-8 w-8 text-admin-yellow" />
                      <div>
                        <p className="text-sm text-muted-foreground">Synchronisation</p>
                        <p className="font-medium">Attention</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Activity className="h-8 w-8 text-admin-blue" />
                      <div>
                        <p className="text-sm text-muted-foreground">Charge système</p>
                        <p className="font-medium">Normal</p>
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
                      { time: '14:32', message: 'Transaction POS validée - TechRepairer Pro', type: 'success' },
                      { time: '14:30', message: 'Nouveau réparateur connecté - Mobile Fix Expert', type: 'info' },
                      { time: '14:28', message: 'Synchronisation terminée - 47 POS', type: 'success' },
                      { time: '14:25', message: 'Alerte: Délai de synchronisation dépassé', type: 'warning' },
                      { time: '14:22', message: 'Mise à jour système appliquée', type: 'success' },
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
      </div>
    </SuperAdminLayout>
  );
};

export default POSDashboard;
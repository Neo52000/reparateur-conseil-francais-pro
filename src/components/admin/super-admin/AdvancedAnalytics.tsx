import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  CreditCard,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  revenue: any[];
  users: any[];
  transactions: any[];
  modules: any[];
  performance: any[];
}

interface KPIData {
  totalRevenue: number;
  totalUsers: number;
  totalTransactions: number;
  avgTransactionValue: number;
  growthRate: number;
  churnRate: number;
}

const AdvancedAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: [],
    users: [],
    transactions: [],
    modules: [],
    performance: []
  });
  const [kpis, setKPIs] = useState<KPIData>({
    totalRevenue: 0,
    totalUsers: 0,
    totalTransactions: 0,
    avgTransactionValue: 0,
    growthRate: 0,
    churnRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);

      // Données simulées pour la démonstration
      const mockRevenueData = [
        { month: 'Jan', pos: 45000, ecommerce: 32000, total: 77000 },
        { month: 'Fév', pos: 52000, ecommerce: 38000, total: 90000 },
        { month: 'Mar', pos: 48000, ecommerce: 42000, total: 90000 },
        { month: 'Avr', pos: 61000, ecommerce: 45000, total: 106000 },
        { month: 'Mai', pos: 55000, ecommerce: 48000, total: 103000 },
        { month: 'Jun', pos: 67000, ecommerce: 52000, total: 119000 },
      ];

      const mockUsersData = [
        { month: 'Jan', new: 45, active: 234, churned: 12 },
        { month: 'Fév', new: 62, active: 278, churned: 8 },
        { month: 'Mar', new: 38, active: 298, churned: 18 },
        { month: 'Avr', new: 71, active: 341, churned: 14 },
        { month: 'Mai', new: 55, active: 372, churned: 24 },
        { month: 'Jun', new: 83, active: 421, churned: 20 },
      ];

      const mockTransactionsData = [
        { month: 'Jan', count: 1245, value: 77000 },
        { month: 'Fév', count: 1456, value: 90000 },
        { month: 'Mar', count: 1389, value: 90000 },
        { month: 'Avr', count: 1678, value: 106000 },
        { month: 'Mai', count: 1534, value: 103000 },
        { month: 'Jun', count: 1789, value: 119000 },
      ];

      const mockModulesData = [
        { name: 'POS Basic', users: 45, revenue: 22500, color: 'hsl(var(--admin-blue))' },
        { name: 'POS Pro', users: 32, revenue: 48000, color: 'hsl(var(--admin-green))' },
        { name: 'E-commerce Basic', users: 28, revenue: 24920, color: 'hsl(var(--admin-purple))' },
        { name: 'E-commerce Pro', users: 19, revenue: 33820, color: 'hsl(var(--admin-orange))' },
      ];

      const mockPerformanceData = [
        { metric: 'Uptime', value: 99.9, target: 99.5, status: 'excellent' },
        { metric: 'Response Time', value: 245, target: 300, status: 'good', unit: 'ms' },
        { metric: 'Error Rate', value: 0.05, target: 0.1, status: 'excellent', unit: '%' },
        { metric: 'Sync Success', value: 98.7, target: 95, status: 'excellent', unit: '%' },
      ];

      setAnalyticsData({
        revenue: mockRevenueData,
        users: mockUsersData,
        transactions: mockTransactionsData,
        modules: mockModulesData,
        performance: mockPerformanceData
      });

      // Calculer les KPI
      const totalRevenue = mockRevenueData.reduce((sum, item) => sum + item.total, 0);
      const totalUsers = mockUsersData[mockUsersData.length - 1].active;
      const totalTransactions = mockTransactionsData.reduce((sum, item) => sum + item.count, 0);
      const avgTransactionValue = totalRevenue / totalTransactions;
      const growthRate = 12.4; // Calculé à partir des données
      const churnRate = 4.2; // Calculé à partir des données

      setKPIs({
        totalRevenue,
        totalUsers,
        totalTransactions,
        avgTransactionValue,
        growthRate,
        churnRate
      });

    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'analyse",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    toast({
      title: "Export en cours",
      description: "Le rapport d'analyse est en cours de génération...",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-admin-green';
      case 'good': return 'text-admin-blue';
      case 'warning': return 'text-admin-yellow';
      case 'critical': return 'text-admin-red';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Avancées</h2>
          <p className="text-muted-foreground">Analyse approfondie des performances</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-admin-green" />
              <div>
                <p className="text-xs text-muted-foreground">Revenus Total</p>
                <p className="text-lg font-bold">{kpis.totalRevenue.toLocaleString()}€</p>
                <div className="flex items-center text-xs text-admin-green">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{kpis.growthRate}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-admin-blue" />
              <div>
                <p className="text-xs text-muted-foreground">Utilisateurs Actifs</p>
                <p className="text-lg font-bold">{kpis.totalUsers}</p>
                <div className="flex items-center text-xs text-admin-blue">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.3%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-admin-purple" />
              <div>
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="text-lg font-bold">{kpis.totalTransactions.toLocaleString()}</p>
                <div className="flex items-center text-xs text-admin-purple">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15.7%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-admin-orange" />
              <div>
                <p className="text-xs text-muted-foreground">Panier Moyen</p>
                <p className="text-lg font-bold">{kpis.avgTransactionValue.toFixed(2)}€</p>
                <div className="flex items-center text-xs text-admin-green">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3.2%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-admin-green" />
              <div>
                <p className="text-xs text-muted-foreground">Croissance</p>
                <p className="text-lg font-bold">{kpis.growthRate}%</p>
                <p className="text-xs text-muted-foreground">ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-admin-red" />
              <div>
                <p className="text-xs text-muted-foreground">Taux de Churn</p>
                <p className="text-lg font-bold">{kpis.churnRate}%</p>
                <div className="flex items-center text-xs text-admin-green">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -1.2%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Revenus</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsData.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="pos" 
                    stackId="1"
                    stroke="hsl(var(--admin-blue))" 
                    fill="hsl(var(--admin-blue-light))"
                    name="POS"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ecommerce" 
                    stackId="1"
                    stroke="hsl(var(--admin-green))" 
                    fill="hsl(var(--admin-green-light))"
                    name="E-commerce"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.users}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="active" 
                    stroke="hsl(var(--admin-blue))" 
                    name="Actifs"
                    strokeWidth={3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="new" 
                    stroke="hsl(var(--admin-green))" 
                    name="Nouveaux"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="churned" 
                    stroke="hsl(var(--admin-red))" 
                    name="Churned"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Volume des Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.transactions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--admin-purple))" name="Nombre" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Module</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.modules}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="revenue"
                      label={({ name, value }) => `${name}: ${value.toLocaleString()}€`}
                    >
                      {analyticsData.modules.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance par Module</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.modules.map((module, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{module.name}</p>
                        <p className="text-sm text-muted-foreground">{module.users} utilisateurs</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-admin-green">{module.revenue.toLocaleString()}€</p>
                        <p className="text-sm text-muted-foreground">
                          {(module.revenue / module.users).toFixed(0)}€/user
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Indicateurs de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analyticsData.performance.map((perf, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{perf.metric}</h4>
                      <Badge variant={perf.status === 'excellent' ? 'default' : 'secondary'}>
                        {perf.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Actuel</span>
                        <span className={`font-medium ${getStatusColor(perf.status)}`}>
                          {perf.value}{perf.unit || ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Objectif</span>
                        <span className="text-sm">
                          {perf.target}{perf.unit || ''}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            perf.status === 'excellent' ? 'bg-admin-green' :
                            perf.status === 'good' ? 'bg-admin-blue' :
                            perf.status === 'warning' ? 'bg-admin-yellow' :
                            'bg-admin-red'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (perf.value / perf.target) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
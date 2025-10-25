import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingCart, Euro, Package, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AnalyticsStats {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  conversion_rate: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

interface TopStore {
  name: string;
  revenue: number;
  orders: number;
}

interface StatusData {
  name: string;
  value: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

const ShopifyGlobalAnalytics: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats>({
    total_revenue: 0,
    total_orders: 0,
    average_order_value: 0,
    conversion_rate: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [topStores, setTopStores] = useState<TopStore[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>('30');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const daysAgo = parseInt(period);
      const startDate = subDays(new Date(), daysAgo).toISOString();

      // Mock orders data - replace when shopify_orders table exists
      const orders: any[] = [];

      // Calculer les stats globales
      const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_price || '0'), 0) || 0;
      const totalOrders = orders?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setStats({
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        average_order_value: averageOrderValue,
        conversion_rate: 2.5, // Placeholder - à calculer avec les analytics
      });

      // Données mensuelles (agrégées par mois)
      const monthlyMap = new Map<string, { revenue: number; orders: number }>();
      orders?.forEach((order) => {
        const monthKey = format(new Date(order.created_at), 'MMM yyyy', { locale: fr });
        const existing = monthlyMap.get(monthKey) || { revenue: 0, orders: 0 };
        monthlyMap.set(monthKey, {
          revenue: existing.revenue + parseFloat(order.total_price || '0'),
          orders: existing.orders + 1,
        });
      });

      const monthlyArray = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders,
      }));
      setMonthlyData(monthlyArray);

      // Top boutiques
      const storesMap = new Map<string, { revenue: number; orders: number }>();
      orders?.forEach((order: any) => {
        const storeName = order.shopify_stores?.store_name || 'Unknown';
        const existing = storesMap.get(storeName) || { revenue: 0, orders: 0 };
        storesMap.set(storeName, {
          revenue: existing.revenue + parseFloat(order.total_price || '0'),
          orders: existing.orders + 1,
        });
      });

      const topStoresArray = Array.from(storesMap.entries())
        .map(([name, data]) => ({
          name,
          revenue: data.revenue,
          orders: data.orders,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
      setTopStores(topStoresArray);

      // Répartition par statut
      const statusMap = new Map<string, number>();
      orders?.forEach((order) => {
        const status = order.financial_status || 'unknown';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });

      const statusArray = Array.from(statusMap.entries()).map(([name, value]) => ({
        name: name === 'paid' ? 'Payées' : name === 'pending' ? 'En attente' : name === 'refunded' ? 'Remboursées' : name,
        value,
      }));
      setStatusData(statusArray);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
      {/* Period Selector */}
      <div className="flex justify-end">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
            <SelectItem value="365">12 derniers mois</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-2xl font-bold">{stats.total_orders}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Panier Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Euro className="h-4 w-4 mr-2 text-yellow-600" />
              <span className="text-2xl font-bold">{stats.average_order_value.toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-2 text-purple-600" />
              <span className="text-2xl font-bold">{stats.conversion_rate.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>CA Mensuel</CardTitle>
            <CardDescription>Évolution du chiffre d'affaires</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="CA" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition Commandes</CardTitle>
            <CardDescription>Par statut de paiement</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label outerRadius={100} fill="#8884d8" dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        {/* Top Stores Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Boutiques</CardTitle>
            <CardDescription>Par chiffre d'affaires généré</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topStores} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="CA" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShopifyGlobalAnalytics;

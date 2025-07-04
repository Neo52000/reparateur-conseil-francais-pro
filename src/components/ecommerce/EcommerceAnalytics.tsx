import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Euro,
  ShoppingBag,
  Users,
  Package,
  Eye,
  Star,
  Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AnalyticsData {
  revenue: { current: number; previous: number; change: number };
  orders: { current: number; previous: number; change: number };
  customers: { current: number; previous: number; change: number };
  products: { total: number; published: number; outOfStock: number };
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  revenueChart: Array<{ date: string; revenue: number; orders: number }>;
  categoryChart: Array<{ name: string; value: number; color: string }>;
}

export const EcommerceAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const { user } = useAuth();

  // Charger les données analytics
  const loadAnalytics = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const now = new Date();
      const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = subDays(now, periodDays);
      const previousStartDate = subDays(startDate, periodDays);

      // Commandes de la période actuelle
      const { data: currentOrders } = await supabase
        .from('ecommerce_orders')
        .select('total_amount, payment_status, created_at, customer_email')
        .eq('repairer_id', user.id)
        .gte('created_at', startDate.toISOString());

      // Commandes de la période précédente
      const { data: previousOrders } = await supabase
        .from('ecommerce_orders')
        .select('total_amount, payment_status, created_at')
        .eq('repairer_id', user.id)
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      // Produits
      const { data: products } = await supabase
        .from('ecommerce_products')
        .select('status, stock_quantity, category')
        .eq('repairer_id', user.id);

      // Clients
      const { data: customers } = await supabase
        .from('ecommerce_customers')
        .select('created_at')
        .eq('repairer_id', user.id);

      // Calculer les métriques
      const currentPaidOrders = currentOrders?.filter(o => o.payment_status === 'paid') || [];
      const previousPaidOrders = previousOrders?.filter(o => o.payment_status === 'paid') || [];

      const currentRevenue = currentPaidOrders.reduce((sum, o) => sum + o.total_amount, 0);
      const previousRevenue = previousPaidOrders.reduce((sum, o) => sum + o.total_amount, 0);
      
      const currentOrderCount = currentOrders?.length || 0;
      const previousOrderCount = previousOrders?.length || 0;

      const currentCustomerCount = customers?.filter(c => new Date(c.created_at) >= startDate).length || 0;
      const previousCustomerCount = customers?.filter(c => {
        const date = new Date(c.created_at);
        return date >= previousStartDate && date < startDate;
      }).length || 0;

      // Données pour les graphiques
      const revenueChart = [];
      for (let i = periodDays - 1; i >= 0; i--) {
        const date = subDays(now, i);
        const dayOrders = currentOrders?.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate.toDateString() === date.toDateString() && o.payment_status === 'paid';
        }) || [];
        
        revenueChart.push({
          date: format(date, 'dd/MM'),
          revenue: dayOrders.reduce((sum, o) => sum + o.total_amount, 0),
          orders: dayOrders.length
        });
      }

      // Catégories
      const categoryStats = (products || []).reduce((acc, product) => {
        const category = product.category || 'Non catégorisé';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
      const categoryChart = Object.entries(categoryStats).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

      const analytics: AnalyticsData = {
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          change: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
        },
        orders: {
          current: currentOrderCount,
          previous: previousOrderCount,
          change: previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0
        },
        customers: {
          current: currentCustomerCount,
          previous: previousCustomerCount,
          change: previousCustomerCount > 0 ? ((currentCustomerCount - previousCustomerCount) / previousCustomerCount) * 100 : 0
        },
        products: {
          total: products?.length || 0,
          published: products?.filter(p => p.status === 'published').length || 0,
          outOfStock: products?.filter(p => p.stock_quantity === 0).length || 0
        },
        topProducts: [], // À implémenter si nécessaire
        revenueChart,
        categoryChart
      };

      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user?.id, period]);

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-emerald-500';
    if (change < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header avec sélecteur de période */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Analytics E-commerce
          </h2>
          <p className="text-muted-foreground">
            Performances de votre boutique en ligne
          </p>
        </div>
        
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
            <SelectItem value="90d">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">€{analyticsData.revenue.current.toFixed(2)}</p>
                <div className={`flex items-center gap-1 text-sm ${getTrendColor(analyticsData.revenue.change)}`}>
                  {getTrendIcon(analyticsData.revenue.change)}
                  {analyticsData.revenue.change !== 0 && (
                    <span>{Math.abs(analyticsData.revenue.change).toFixed(1)}%</span>
                  )}
                </div>
              </div>
              <Euro className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commandes</p>
                <p className="text-2xl font-bold">{analyticsData.orders.current}</p>
                <div className={`flex items-center gap-1 text-sm ${getTrendColor(analyticsData.orders.change)}`}>
                  {getTrendIcon(analyticsData.orders.change)}
                  {analyticsData.orders.change !== 0 && (
                    <span>{Math.abs(analyticsData.orders.change).toFixed(1)}%</span>
                  )}
                </div>
              </div>
              <ShoppingBag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nouveaux clients</p>
                <p className="text-2xl font-bold">{analyticsData.customers.current}</p>
                <div className={`flex items-center gap-1 text-sm ${getTrendColor(analyticsData.customers.change)}`}>
                  {getTrendIcon(analyticsData.customers.change)}
                  {analyticsData.customers.change !== 0 && (
                    <span>{Math.abs(analyticsData.customers.change).toFixed(1)}%</span>
                  )}
                </div>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Panier moyen</p>
                <p className="text-2xl font-bold">
                  €{analyticsData.orders.current > 0 ? (analyticsData.revenue.current / analyticsData.orders.current).toFixed(2) : '0.00'}
                </p>
                <p className="text-sm text-muted-foreground">par commande</p>
              </div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution du chiffre d'affaires */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution du chiffre d'affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `€${value}` : value,
                    name === 'revenue' ? 'CA' : 'Commandes'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par catégories */}
        <Card>
          <CardHeader>
            <CardTitle>Produits par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.categoryChart.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {analyticsData.categoryChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {analyticsData.categoryChart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Aucune donnée de catégorie disponible
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiques produits */}
      <Card>
        <CardHeader>
          <CardTitle>État des produits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{analyticsData.products.total}</div>
              <p className="text-sm text-muted-foreground">Total produits</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-500">{analyticsData.products.published}</div>
              <p className="text-sm text-muted-foreground">Produits publiés</p>
              <Progress 
                value={analyticsData.products.total > 0 ? (analyticsData.products.published / analyticsData.products.total) * 100 : 0} 
                className="mt-2" 
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{analyticsData.products.outOfStock}</div>
              <p className="text-sm text-muted-foreground">En rupture</p>
              {analyticsData.products.outOfStock > 0 && (
                <Badge variant="destructive" className="mt-2">
                  Action requise
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
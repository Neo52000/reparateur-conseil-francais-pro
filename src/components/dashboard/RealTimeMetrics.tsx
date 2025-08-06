import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Euro, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Package, 
  Users, 
  Star,
  Zap,
  Activity,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RealTimeMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  icon: React.ReactNode;
  color: string;
  target?: number;
  isLive?: boolean;
}

const RealTimeMetrics = () => {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadMetrics();
    
    // Mise à jour en temps réel toutes les 30 secondes
    const interval = setInterval(() => {
      loadMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const loadMetrics = async () => {
    if (!user) return;

    try {
      // Récupérer les données en temps réel
      const today = new Date().toISOString().split('T')[0];
      const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const lastWeek = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

      // Transactions du jour et de la semaine
      const { data: todayTransactions } = await supabase
        .from('pos_transactions')
        .select('total_amount, payment_status')
        .eq('repairer_id', user.id)
        .gte('transaction_date', today);

      const { data: thisWeekTransactions } = await supabase
        .from('pos_transactions')
        .select('total_amount, payment_status')
        .eq('repairer_id', user.id)
        .gte('transaction_date', thisWeek);

      const { data: lastWeekTransactions } = await supabase
        .from('pos_transactions')
        .select('total_amount, payment_status')
        .eq('repairer_id', user.id)
        .gte('transaction_date', lastWeek)
        .lt('transaction_date', thisWeek);

      // Stock et inventaire
      const { data: inventory } = await supabase
        .from('pos_inventory_items')
        .select('current_stock, minimum_stock, cost_price, selling_price')
        .eq('repairer_id', user.id);

      // Commandes en attente (utiliser une table existante)
      const { data: pendingOrders } = await supabase
        .from('pos_transactions')
        .select('id, total_amount, payment_status')
        .eq('repairer_id', user.id)
        .eq('payment_status', 'pending');

      // Calculs
      const todayRevenue = todayTransactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
      const thisWeekRevenue = thisWeekTransactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
      const lastWeekRevenue = lastWeekTransactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
      
      const weeklyChange = lastWeekRevenue > 0 ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0;
      
      const lowStockItems = inventory?.filter(item => item.current_stock <= item.minimum_stock).length || 0;
      const totalStockValue = inventory?.reduce((sum, item) => sum + (item.current_stock * item.cost_price), 0) || 0;
      
      const pendingOrdersValue = pendingOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const completedTodayCount = todayTransactions?.filter(t => t.payment_status === 'completed').length || 0;

      // Génération des métriques
      const realTimeMetrics: RealTimeMetric[] = [
        {
          id: 'daily-revenue',
          label: 'CA Aujourd\'hui',
          value: todayRevenue,
          unit: '€',
          change: weeklyChange,
          changeType: weeklyChange > 0 ? 'increase' : weeklyChange < 0 ? 'decrease' : 'stable',
          icon: <Euro className="h-5 w-5" />,
          color: 'text-green-600',
          isLive: true
        },
        {
          id: 'weekly-revenue',
          label: 'CA Cette Semaine',
          value: thisWeekRevenue,
          unit: '€',
          change: weeklyChange,
          changeType: weeklyChange > 0 ? 'increase' : weeklyChange < 0 ? 'decrease' : 'stable',
          icon: <TrendingUp className="h-5 w-5" />,
          color: 'text-blue-600',
          target: lastWeekRevenue * 1.1
        },
        {
          id: 'pending-orders',
          label: 'Commandes en Attente',
          value: pendingOrders?.length || 0,
          unit: '',
          change: 0,
          changeType: 'stable',
          icon: <Clock className="h-5 w-5" />,
          color: 'text-orange-600',
          isLive: true
        },
        {
          id: 'completed-today',
          label: 'Réparations Finalisées',
          value: completedTodayCount,
          unit: ' aujourd\'hui',
          change: 0,
          changeType: 'stable',
          icon: <Target className="h-5 w-5" />,
          color: 'text-purple-600',
          isLive: true
        },
        {
          id: 'low-stock',
          label: 'Articles Stock Bas',
          value: lowStockItems,
          unit: ' articles',
          change: 0,
          changeType: lowStockItems > 0 ? 'increase' : 'stable',
          icon: <Package className="h-5 w-5" />,
          color: lowStockItems > 0 ? 'text-red-600' : 'text-green-600'
        },
        {
          id: 'stock-value',
          label: 'Valeur Stock Total',
          value: totalStockValue,
          unit: '€',
          change: 0,
          changeType: 'stable',
          icon: <Activity className="h-5 w-5" />,
          color: 'text-indigo-600'
        }
      ];

      setMetrics(realTimeMetrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur chargement métriques temps réel:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'decrease': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <div className="h-3 w-3 rounded-full bg-gray-400"></div>;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '€') {
      return value.toFixed(2);
    }
    return Math.round(value).toString();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Métriques Temps Réel
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Mis à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <Card key={metric.id} className="relative overflow-hidden">
            {metric.isLive && (
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="text-xs">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  LIVE
                </Badge>
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-50 ${metric.color}`}>
                  {metric.icon}
                </div>
                {metric.change !== 0 && (
                  <div className="flex items-center gap-1">
                    {getChangeIcon(metric.changeType)}
                    <span className={`text-xs font-medium ${
                      metric.changeType === 'increase' ? 'text-green-600' : 
                      metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {Math.abs(metric.change).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatValue(metric.value, metric.unit)}{metric.unit}
                </p>
                
                {metric.target && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Objectif</span>
                      <span>{formatValue(metric.target, metric.unit)}{metric.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RealTimeMetrics;
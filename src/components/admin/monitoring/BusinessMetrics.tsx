import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Star,
  Plus,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const BusinessMetrics: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessMetrics();
  }, [user]);

  const fetchBusinessMetrics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('repairer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des métriques:', error);
    } finally {
      setLoading(false);
    }
  };

  // Utiliser les vraies données de la base ou des données par défaut
  const displayMetrics = metrics.length > 0 ? metrics.map(metric => ({
    id: metric.id,
    metric_name: metric.metric_name,
    metric_type: metric.metric_type || 'general',
    current_value: metric.current_value || 0,
    target_value: metric.target_value || 100,
    threshold_warning: metric.threshold_warning || 50,
    threshold_critical: metric.threshold_critical || 25,
    unit: metric.unit || '',
    trend: (metric.current_value && metric.target_value && metric.current_value > metric.target_value * 0.9) ? 'up' : 'down',
    change: '+0%'
  })) : [
    {
      id: '1',
      metric_name: 'Métriques en cours de configuration',
      metric_type: 'setup',
      current_value: 0,
      target_value: 100,
      threshold_warning: 50,
      threshold_critical: 25,
      unit: '%',
      trend: 'up',
      change: '0%'
    }
  ];

  const revenueData = [
    { month: 'Jan', value: 12800 },
    { month: 'Fév', value: 13200 },
    { month: 'Mar', value: 14100 },
    { month: 'Avr', value: 13800 },
    { month: 'Mai', value: 15420 },
    { month: 'Jun', value: 16200 },
  ];

  const ordersData = [
    { month: 'Jan', value: 65 },
    { month: 'Fév', value: 72 },
    { month: 'Mar', value: 78 },
    { month: 'Avr', value: 74 },
    { month: 'Mai', value: 87 },
    { month: 'Jun', value: 92 },
  ];

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <DollarSign className="h-5 w-5" />;
      case 'orders': return <ShoppingCart className="h-5 w-5" />;
      case 'satisfaction': return <Star className="h-5 w-5" />;
      case 'conversion_rate': return <TrendingUp className="h-5 w-5" />;
      default: return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getStatusColor = (current: number, warning: number, critical: number) => {
    if (current <= critical) return 'text-destructive';
    if (current <= warning) return 'text-warning';
    return 'text-success';
  };

  const getProgressValue = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Chargement des métriques business...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Métriques Business</h2>
          <p className="text-muted-foreground">
            Surveillez vos KPIs en temps réel avec des alertes intelligentes
          </p>
          <Badge className="mt-2 bg-primary/10 text-primary">
            Fonctionnalité exclusive TopReparateurs
          </Badge>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle métrique
        </Button>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.metric_name}</CardTitle>
              {getMetricIcon(metric.metric_type)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.current_value.toLocaleString('fr-FR')}{metric.unit}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={`text-sm ${metric.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                  {metric.change}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Objectif</span>
                  <span>{metric.target_value.toLocaleString('fr-FR')}{metric.unit}</span>
                </div>
                <Progress 
                  value={getProgressValue(metric.current_value, metric.target_value)} 
                  className="h-2"
                />
              </div>
              <div className="flex items-center gap-1 mt-2">
                {metric.current_value > metric.threshold_warning ? (
                  <CheckCircle className="h-3 w-3 text-success" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-warning" />
                )}
                <span className={`text-xs ${getStatusColor(metric.current_value, metric.threshold_warning, metric.threshold_critical)}`}>
                  {metric.current_value > metric.threshold_warning ? 'Objectif atteint' : 'Attention requise'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Évolution du CA
            </CardTitle>
            <CardDescription>
              Chiffre d'affaires des 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`${value.toLocaleString('fr-FR')} €`, 'CA']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Commandes mensuelles
            </CardTitle>
            <CardDescription>
              Nombre de commandes des 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`${value} commandes`, 'Commandes']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertes et recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertes et recommandations IA
          </CardTitle>
          <CardDescription>
            Insights automatiques basés sur vos données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-warning/20 bg-warning/5 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning">Taux de conversion en baisse</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Votre taux de conversion a baissé de 0.3% ce mois-ci. 
                    Recommandation: Vérifiez vos prix par rapport à la concurrence et optimisez votre page de paiement.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-success/20 bg-success/5 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-medium text-success">Excellente performance CA</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Votre chiffre d'affaires est en hausse de 12.5% ! 
                    Continuez sur cette lancée en développant vos services les plus populaires.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
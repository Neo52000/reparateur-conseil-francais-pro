import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Package,
  Calendar,
  Target,
  Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Metrics {
  total_users: number;
  total_repairers: number;
  active_repairers: number;
  total_quotes: number;
  total_appointments: number;
  total_revenue: number;
  total_commissions: number;
  conversion_rate: number;
  avg_quote_value: number;
}

export const RealtimeDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_metrics_snapshot')
        .select('*')
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setMetrics(data);
    } catch (error: any) {
      console.error('Error fetching metrics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les métriques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('refresh_admin_metrics');
      if (error) throw error;
      
      await fetchMetrics();
      
      toast({
        title: "Succès",
        description: "Métriques mises à jour",
      });
    } catch (error: any) {
      console.error('Error refreshing metrics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rafraîchir les métriques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Refresh automatique toutes les 5 minutes
    const interval = setInterval(fetchMetrics, 300000);

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_metrics_snapshot'
        },
        () => {
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading && !metrics) {
    return <div className="text-center p-8">Chargement des métriques...</div>;
  }

  const stats = [
    {
      title: "Utilisateurs Total",
      value: metrics?.total_users || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Réparateurs",
      value: `${metrics?.active_repairers || 0}/${metrics?.total_repairers || 0}`,
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
      subtitle: "Actifs / Total"
    },
    {
      title: "Devis",
      value: metrics?.total_quotes || 0,
      icon: Package,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      title: "Rendez-vous",
      value: metrics?.total_appointments || 0,
      icon: Calendar,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
    {
      title: "Revenu Total",
      value: `${(metrics?.total_revenue || 0).toFixed(2)}€`,
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950"
    },
    {
      title: "Commissions",
      value: `${(metrics?.total_commissions || 0).toFixed(2)}€`,
      icon: TrendingUp,
      color: "text-cyan-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950"
    },
    {
      title: "Taux de Conversion",
      value: `${(metrics?.conversion_rate || 0).toFixed(1)}%`,
      icon: Target,
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-950"
    },
    {
      title: "Panier Moyen",
      value: `${(metrics?.avg_quote_value || 0).toFixed(2)}€`,
      icon: Percent,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Dashboard Temps Réel</h2>
          <p className="text-muted-foreground">Métriques et KPIs de la plateforme</p>
        </div>
        <Button onClick={refreshMetrics} disabled={loading}>
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.subtitle}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Insights Clés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
            <div>
              <p className="font-semibold">Performance Globale</p>
              <p className="text-sm text-muted-foreground">
                {metrics && metrics.conversion_rate > 50 
                  ? "Excellent taux de conversion !" 
                  : "Opportunités d'amélioration du taux de conversion"}
              </p>
            </div>
            <TrendingUp className={metrics && metrics.conversion_rate > 50 ? "text-green-500" : "text-orange-500"} />
          </div>
          
          <div className="flex justify-between items-center p-4 bg-secondary/5 rounded-lg">
            <div>
              <p className="font-semibold">Revenus du Jour</p>
              <p className="text-sm text-muted-foreground">
                {(metrics?.total_revenue || 0).toFixed(2)}€ générés
              </p>
            </div>
            <DollarSign className="text-emerald-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

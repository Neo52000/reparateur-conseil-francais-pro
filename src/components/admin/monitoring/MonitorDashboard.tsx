import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { 
  Globe, 
  Zap, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Activity,
  Wifi
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const MonitorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [monitors, setMonitors] = useState<any[]>([]);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitorsAndResults();
  }, [user]);

  const fetchMonitorsAndResults = async () => {
    if (!user) return;

    try {
      // Récupérer les monitors
      const { data: monitorsData } = await supabase
        .from('monitors')
        .select('*')
        .eq('repairer_id', user.id)
        .eq('is_active', true);

      // Récupérer les derniers résultats
      const { data: resultsData } = await supabase
        .from('monitor_results')
        .select(`
          *,
          monitors!inner(name, type)
        `)
        .in('monitor_id', monitorsData?.map(m => m.id) || [])
        .order('checked_at', { ascending: false })
        .limit(50);

      setMonitors(monitorsData || []);
      setRecentResults(resultsData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Données simulées pour les graphiques
  const uptimeData = [
    { time: '00:00', uptime: 100 },
    { time: '04:00', uptime: 99.8 },
    { time: '08:00', uptime: 100 },
    { time: '12:00', uptime: 99.5 },
    { time: '16:00', uptime: 100 },
    { time: '20:00', uptime: 99.9 },
    { time: '24:00', uptime: 100 }
  ];

  const responseTimeData = [
    { time: '00:00', responseTime: 120 },
    { time: '04:00', responseTime: 180 },
    { time: '08:00', responseTime: 150 },
    { time: '12:00', responseTime: 300 },
    { time: '16:00', responseTime: 200 },
    { time: '20:00', responseTime: 160 },
    { time: '24:00', responseTime: 140 }
  ];

  const monitorsByType = [
    { type: 'HTTP', count: 8, status: 'up' },
    { type: 'DNS', count: 2, status: 'up' },
    { type: 'SSL', count: 1, status: 'warning' },
    { type: 'Business', count: 1, status: 'up' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Chargement du dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monitors en cours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Uptime dernières 24h
            </CardTitle>
            <CardDescription>
              Disponibilité de vos services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={uptimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[99, 100]} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="uptime" 
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
              <Clock className="h-5 w-5" />
              Temps de réponse
            </CardTitle>
            <CardDescription>
              Performance de vos services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monitors par type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Monitors par type
          </CardTitle>
          <CardDescription>
            Répartition de vos monitors actifs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {monitorsByType.map((monitor) => (
              <div key={monitor.type} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{monitor.type}</span>
                  {monitor.status === 'up' ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-warning" />
                  )}
                </div>
                <div className="text-2xl font-bold">{monitor.count}</div>
                <Badge 
                  variant={monitor.status === 'up' ? 'default' : 'secondary'}
                  className={monitor.status === 'up' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}
                >
                  {monitor.status === 'up' ? 'Opérationnel' : 'Attention'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statut en temps réel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Statut en temps réel
          </CardTitle>
          <CardDescription>
            État actuel de tous vos monitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monitors.slice(0, 5).map((monitor) => (
              <div key={monitor.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
                  <div>
                    <div className="font-medium">{monitor.name}</div>
                    <div className="text-sm text-muted-foreground">{monitor.url}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-success/10 text-success">
                    UP
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    142ms
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Users, 
  Database, 
  Zap, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useSystemOptimization } from '@/hooks/useSystemOptimization';

const SystemOptimizationPanel: React.FC = () => {
  const {
    metrics,
    rules,
    loading,
    autoOptimization,
    loadMetrics,
    runManualOptimization,
    toggleAutoOptimization
  } = useSystemOptimization();

  const getMetricStatus = (value: number, warning: number, critical: number) => {
    if (value >= critical) return 'critical';
    if (value >= warning) return 'warning';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <Clock className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="p-6">Chargement des métriques système...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Optimisation Système</h2>
          <p className="text-muted-foreground">Surveillance et optimisation automatique des performances</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={autoOptimization}
              onCheckedChange={toggleAutoOptimization}
            />
            <Label>Auto-optimisation</Label>
          </div>
          <Button onClick={loadMetrics}>
            <Activity className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques système */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.cpu_usage.toFixed(1)}%</div>
            <Progress value={metrics?.cpu_usage || 0} className="mt-2" />
            <div className={`flex items-center mt-2 ${getStatusColor(getMetricStatus(metrics?.cpu_usage || 0, 70, 90))}`}>
              {getStatusIcon(getMetricStatus(metrics?.cpu_usage || 0, 70, 90))}
              <span className="ml-1 text-xs">
                {getMetricStatus(metrics?.cpu_usage || 0, 70, 90) === 'good' ? 'Normal' : 
                 getMetricStatus(metrics?.cpu_usage || 0, 70, 90) === 'warning' ? 'Élevé' : 'Critique'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mémoire</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.memory_usage.toFixed(1)}%</div>
            <Progress value={metrics?.memory_usage || 0} className="mt-2" />
            <div className={`flex items-center mt-2 ${getStatusColor(getMetricStatus(metrics?.memory_usage || 0, 80, 95))}`}>
              {getStatusIcon(getMetricStatus(metrics?.memory_usage || 0, 80, 95))}
              <span className="ml-1 text-xs">
                {getMetricStatus(metrics?.memory_usage || 0, 80, 95) === 'good' ? 'Normal' : 
                 getMetricStatus(metrics?.memory_usage || 0, 80, 95) === 'warning' ? 'Élevé' : 'Critique'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disque</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.disk_usage.toFixed(1)}%</div>
            <Progress value={metrics?.disk_usage || 0} className="mt-2" />
            <div className={`flex items-center mt-2 ${getStatusColor(getMetricStatus(metrics?.disk_usage || 0, 85, 95))}`}>
              {getStatusIcon(getMetricStatus(metrics?.disk_usage || 0, 85, 95))}
              <span className="ml-1 text-xs">Espace libre</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.active_users}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Connexions simultanées
            </p>
            <div className="flex items-center mt-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="ml-1 text-xs">En ligne</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance détaillée */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Performance Base de Données
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Connexions actives</span>
              <Badge variant="secondary">{metrics?.database_connections}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Taux de cache</span>
              <Badge variant={metrics && metrics.cache_hit_ratio > 85 ? "default" : "destructive"}>
                {metrics?.cache_hit_ratio.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Temps de réponse moyen</span>
              <Badge variant={metrics && metrics.response_time < 200 ? "default" : "secondary"}>
                {metrics?.response_time.toFixed(0)}ms
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Taux d'erreur</span>
              <Badge variant={metrics && metrics.error_rate < 1 ? "default" : "destructive"}>
                {metrics?.error_rate.toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Actions d'Optimisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => runManualOptimization('clear_cache')}
            >
              <Database className="w-4 h-4 mr-2" />
              Vider le cache
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => runManualOptimization('cleanup_logs')}
            >
              <HardDrive className="w-4 h-4 mr-2" />
              Nettoyer les logs
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => runManualOptimization('optimize_database')}
            >
              <Database className="w-4 h-4 mr-2" />
              Optimiser la BDD
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => runManualOptimization('compress_assets')}
            >
              <Zap className="w-4 h-4 mr-2" />
              Compresser les assets
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Règles d'optimisation */}
      <Card>
        <CardHeader>
          <CardTitle>Règles d'optimisation automatique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? "Actif" : "Inactif"}
                    </Badge>
                    <span className="font-medium">{rule.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Condition: {rule.condition} → Action: {rule.action}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {rule.trigger_count} déclenchements
                  </div>
                  {rule.last_triggered && (
                    <div className="text-xs text-muted-foreground">
                      Dernier: {new Date(rule.last_triggered).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOptimizationPanel;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAIAnalytics } from '@/hooks/useAIAnalytics';
import { Activity, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AIAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = React.useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const { analytics, loading, error, refresh } = useAIAnalytics(timeRange);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Activity className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8 text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Erreur: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📊 Analytics IA</h2>
        <div className="flex gap-2">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={refresh}>
            🔄 Actualiser
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Appels IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.overall.total_calls}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de Succès
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {analytics.overall.success_rate}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Latence Moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.overall.avg_latency_ms}ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Erreurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {analytics.overall.failed_calls}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By Provider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance par Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.by_provider).map(([provider, stats]) => (
              <div key={provider} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{provider}</h3>
                  <Badge variant={stats.success_rate >= 95 ? 'default' : 'destructive'}>
                    {stats.success_rate}% succès
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Appels</p>
                    <p className="font-semibold">{stats.total_calls}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Latence</p>
                    <p className="font-semibold">{stats.avg_latency}ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Erreurs</p>
                    <p className="font-semibold text-red-600">{stats.error_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Modèles</p>
                    <p className="font-semibold">{stats.models_used.length}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {stats.models_used.map(model => (
                    <Badge key={model} variant="outline" className="text-xs">
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Function */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Performance par Fonction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.by_function).map(([fn, stats]) => (
              <div key={fn} className="flex items-center justify-between border-b pb-3">
                <div className="flex-1">
                  <p className="font-medium">{fn}</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.total_calls} appels · {stats.avg_latency}ms
                  </p>
                </div>
                <Badge variant={stats.success_rate >= 95 ? 'default' : 'destructive'}>
                  {stats.success_rate}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Errors */}
      {analytics.recent_errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Erreurs Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recent_errors.map((error, idx) => (
                <div key={idx} className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{error.function}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(error.timestamp).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Provider: {error.provider}</p>
                  <p className="text-sm text-red-600 mt-1">{error.error}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIAnalyticsDashboard;

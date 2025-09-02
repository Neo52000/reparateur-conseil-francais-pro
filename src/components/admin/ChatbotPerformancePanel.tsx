import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useChatbotPerformance } from '@/hooks/useChatbotPerformance';
import { Activity, Zap, Shield, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

const ChatbotPerformancePanel: React.FC = () => {
  const { metrics, getPerformanceInsights } = useChatbotPerformance();
  const insights = getPerformanceInsights();

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'excellent': return 'bg-success text-success-foreground';
      case 'good': return 'bg-warning text-warning-foreground';
      default: return 'bg-destructive text-destructive-foreground';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'fast': return 'bg-success text-success-foreground';
      case 'acceptable': return 'bg-warning text-warning-foreground';
      default: return 'bg-destructive text-destructive-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fiabilité */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fiabilité</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={getReliabilityColor(insights.reliability)}>
                {insights.reliability === 'excellent' ? 'Excellente' : 
                 insights.reliability === 'good' ? 'Bonne' : 'Médiocre'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Taux d'erreur: {Math.round(metrics.errorRate)}%
            </p>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={getPerformanceColor(insights.performance)}>
                {insights.performance === 'fast' ? 'Rapide' : 
                 insights.performance === 'acceptable' ? 'Correcte' : 'Lente'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Temps moyen: {Math.round(metrics.averageResponseTime)}ms
            </p>
          </CardContent>
        </Card>

        {/* Disponibilité IA */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibilité IA</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={insights.aiAvailability === 'high' ? 'default' : 'secondary'}>
                {insights.aiAvailability === 'high' ? 'Élevée' : 
                 insights.aiAvailability === 'medium' ? 'Moyenne' : 'Faible'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fallback: {insights.fallbackPercentage}%
            </p>
          </CardContent>
        </Card>

        {/* Messages totaux */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Réussis: {metrics.successfulResponses}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Détails des providers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Utilisation des Providers IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Provider le plus utilisé */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Provider principal</span>
                <Badge variant="outline">{insights.mostUsedProvider || 'Aucun'}</Badge>
              </div>
              
              {/* Statistiques par provider */}
              <div className="space-y-2">
                {Object.entries(metrics.aiProviderUsage).map(([provider, count]) => (
                  <div key={provider} className="flex items-center space-x-2">
                    <span className="text-xs min-w-0 flex-1">{provider}</span>
                    <div className="flex-1 max-w-24">
                      <Progress 
                        value={(count / insights.totalAiMessages) * 100} 
                        className="h-2" 
                      />
                    </div>
                    <span className="text-xs text-muted-foreground min-w-0">
                      {count}
                    </span>
                  </div>
                ))}
                
                {metrics.fallbackUsage > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs min-w-0 flex-1">Fallback Local</span>
                    <div className="flex-1 max-w-24">
                      <Progress 
                        value={(metrics.fallbackUsage / metrics.totalMessages) * 100} 
                        className="h-2" 
                      />
                    </div>
                    <span className="text-xs text-muted-foreground min-w-0">
                      {metrics.fallbackUsage}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Métriques de temps */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Temps de réponse</span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(metrics.averageResponseTime)}ms moyen
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Rapide (&lt;1s)</span>
                  <span className="text-xs text-success">
                    {metrics.averageResponseTime < 1000 ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Acceptable (&lt;3s)</span>
                  <span className="text-xs text-warning">
                    {metrics.averageResponseTime < 3000 ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Lent (&gt;3s)</span>
                  <span className="text-xs text-destructive">
                    {metrics.averageResponseTime >= 3000 ? '!' : '○'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Alertes de performance */}
          {(insights.recentErrorRate > 20 || insights.performance === 'slow') && (
            <div className="border-l-4 border-l-warning bg-warning/10 p-3 rounded">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="font-medium text-sm">Attention</span>
              </div>
              <div className="text-xs space-y-1">
                {insights.recentErrorRate > 20 && (
                  <p>Taux d'erreur récent élevé ({Math.round(insights.recentErrorRate)}%)</p>
                )}
                {insights.performance === 'slow' && (
                  <p>Temps de réponse élevé détecté</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        Dernière mise à jour: {metrics.lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ChatbotPerformancePanel;
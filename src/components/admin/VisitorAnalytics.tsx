import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVisitorAnalytics } from '@/hooks/useVisitorAnalytics';
import { 
  Eye, 
  Users, 
  TrendingUp, 
  Monitor, 
  Smartphone, 
  Globe,
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VisitorAnalytics() {
  const { stats, loading, error, refreshStats } = useVisitorAnalytics();

  if (loading && !stats.totalPageViews) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <p className="text-destructive">Erreur: {error}</p>
          <Button onClick={refreshStats} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const growthRate = stats.yesterday > 0 
    ? ((stats.today - stats.yesterday) / stats.yesterday * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header avec bouton refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Visiteurs</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshStats}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aujourd'hui</p>
                <p className="text-2xl font-bold">{stats.today}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className={`h-3 w-3 ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-xs ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Eye className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cette semaine</p>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats.thisWeek / 7).toFixed(0)} visites/jour
                </p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ce mois</p>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats.thisMonth / 30).toFixed(0)} visites/jour
                </p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visiteurs uniques</p>
                <p className="text-2xl font-bold">{stats.uniqueVisitors}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalPageViews} pages vues total
                </p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pages les plus visitées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Pages populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topPages.length > 0 ? (
                stats.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {page.page_path === '/' ? 'Accueil' : page.page_path}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {page.views} vues
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Types d'appareils */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Appareils
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.deviceStats.length > 0 ? (
                stats.deviceStats.map((device, index) => {
                  const getDeviceIcon = (type: string) => {
                    if (type.toLowerCase().includes('mobile')) return <Smartphone className="h-4 w-4" />;
                    if (type.toLowerCase().includes('desktop')) return <Monitor className="h-4 w-4" />;
                    return <Globe className="h-4 w-4" />;
                  };
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.device_type)}
                        <span className="text-sm font-medium">
                          {device.device_type || 'Inconnu'}
                        </span>
                      </div>
                      <Badge variant="outline">
                        {device.count}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sources de trafic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Sources de trafic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.trafficSources.length > 0 ? (
                stats.trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {source.referrer || 'Direct'}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {source.count}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, Globe, Search, Zap, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MonitoringStats {
  total_urls: number;
  active_alerts: number;
  avg_response_time: number;
  uptime_percentage: number;
  last_sitemap_update: string;
  google_indexed_pages: number;
}

interface SEOAlert {
  id: string;
  alert_type: string;
  url: string;
  severity: string;
  message: string;
  created_at: string;
  status: string;
}

interface MonitoredUrl {
  id: string;
  url: string;
  url_type: string;
  priority: number;
  last_check: string;
  is_active: boolean;
}

const SEOMonitoringDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [alerts, setAlerts] = useState<SEOAlert[]>([]);
  const [monitoredUrls, setMonitoredUrls] = useState<MonitoredUrl[]>([]);
  const [config, setConfig] = useState({
    monitoring_enabled: true,
    sitemap_auto_update: true,
    google_search_console_token: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Récupérer la configuration
      const { data: configData } = await supabase
        .from('seo_monitoring_config')
        .select('*')
        .single();

      if (configData) {
        setConfig({
          monitoring_enabled: configData.monitoring_enabled,
          sitemap_auto_update: configData.sitemap_auto_update,
          google_search_console_token: configData.google_search_console_token || ''
        });
      }

      // Récupérer les URLs surveillées
      const { data: urlsData } = await supabase
        .from('monitored_urls')
        .select('*')
        .order('priority', { ascending: false })
        .limit(50);

      if (urlsData) {
        setMonitoredUrls(urlsData);
      }

      // Récupérer les alertes actives
      const { data: alertsData } = await supabase
        .from('seo_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertsData) {
        setAlerts(alertsData);
      }

      // Calculer les statistiques
      const totalUrls = urlsData?.length || 0;
      const activeAlerts = alertsData?.length || 0;

      // Récupérer les dernières vérifications pour le temps de réponse moyen
      const { data: healthChecks } = await supabase
        .from('url_health_checks')
        .select('response_time_ms, http_status')
        .gte('check_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .not('response_time_ms', 'is', null);

      const avgResponseTime = healthChecks?.length > 0 
        ? Math.round(healthChecks.reduce((sum, check) => sum + (check.response_time_ms || 0), 0) / healthChecks.length)
        : 0;

      const successfulChecks = healthChecks?.filter(check => check.http_status >= 200 && check.http_status < 400).length || 0;
      const uptimePercentage = healthChecks?.length > 0 
        ? Math.round((successfulChecks / healthChecks.length) * 100)
        : 100;

      // Récupérer la dernière mise à jour du sitemap
      const { data: sitemapData } = await supabase
        .from('sitemap_history')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setStats({
        total_urls: totalUrls,
        active_alerts: activeAlerts,
        avg_response_time: avgResponseTime,
        uptime_percentage: uptimePercentage,
        last_sitemap_update: sitemapData?.created_at || '',
        google_indexed_pages: 0 // À implémenter avec l'API Google
      });

    } catch (error) {
      console.error('Erreur chargement dashboard SEO:', error);
      toast.error('Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  const runHealthCheck = async () => {
    try {
      toast.info('Lancement du monitoring SEO...');
      
      const { error } = await supabase.functions.invoke('seo-health-monitor');
      
      if (error) {
        toast.error('Erreur lors du monitoring');
        console.error(error);
      } else {
        toast.success('Monitoring SEO terminé');
        await fetchDashboardData();
      }
    } catch (error) {
      toast.error('Erreur lors du monitoring');
      console.error(error);
    }
  };

  const updateSitemap = async () => {
    try {
      toast.info('Génération du sitemap...');
      
      const { error } = await supabase.functions.invoke('dynamic-sitemap-manager');
      
      if (error) {
        toast.error('Erreur lors de la génération du sitemap');
        console.error(error);
      } else {
        toast.success('Sitemap généré et soumis');
        await fetchDashboardData();
      }
    } catch (error) {
      toast.error('Erreur lors de la génération du sitemap');
      console.error(error);
    }
  };

  const updateConfig = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('seo_monitoring_config')
        .update({ [key]: value })
        .eq('id', (await supabase.from('seo_monitoring_config').select('id').single()).data?.id);

      if (error) {
        toast.error('Erreur mise à jour configuration');
        console.error(error);
      } else {
        setConfig(prev => ({ ...prev, [key]: value }));
        toast.success('Configuration mise à jour');
      }
    } catch (error) {
      toast.error('Erreur mise à jour configuration');
      console.error(error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('seo_alerts')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) {
        toast.error('Erreur résolution alerte');
      } else {
        toast.success('Alerte résolue');
        await fetchDashboardData();
      }
    } catch (error) {
      toast.error('Erreur résolution alerte');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement du monitoring SEO...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex flex-row items-center justify-between space-y-0 p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">URLs Surveillées</p>
              <div className="text-2xl font-bold">{stats?.total_urls || 0}</div>
            </div>
            <Globe className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center justify-between space-y-0 p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Alertes Actives</p>
              <div className="text-2xl font-bold text-red-600">{stats?.active_alerts || 0}</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center justify-between space-y-0 p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Temps Réponse Moyen</p>
              <div className="text-2xl font-bold">{stats?.avg_response_time || 0}ms</div>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center justify-between space-y-0 p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Disponibilité</p>
              <div className="text-2xl font-bold text-green-600">{stats?.uptime_percentage || 0}%</div>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="flex gap-4">
        <Button onClick={runHealthCheck} className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Lancer Monitoring
        </Button>
        <Button onClick={updateSitemap} variant="outline" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Générer Sitemap
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="urls">URLs Surveillées</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Santé Globale SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Disponibilité</span>
                    <span className="font-bold text-green-600">{stats?.uptime_percentage}%</span>
                  </div>
                  <Progress value={stats?.uptime_percentage || 0} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Performance</span>
                    <span className="font-bold">{stats?.avg_response_time}ms</span>
                  </div>
                  <Progress value={Math.min(100, Math.max(0, 100 - (stats?.avg_response_time || 0) / 20))} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dernières Alertes</CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.created_at).toLocaleString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">{alert.url}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Résoudre
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Aucune alerte active</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les Alertes</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline">{alert.alert_type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.created_at).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground break-all">{alert.url}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Résoudre
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucune alerte</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>URLs Surveillées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monitoredUrls.map((url) => (
                  <div key={url.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium break-all">{url.url}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{url.url_type}</Badge>
                        <span>Priorité: {url.priority}/10</span>
                        {url.last_check && (
                          <span>Dernière vérif: {new Date(url.last_check).toLocaleString('fr-FR')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {url.is_active ? (
                        <Badge variant="default">Actif</Badge>
                      ) : (
                        <Badge variant="secondary">Inactif</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Monitoring Activé</Label>
                    <p className="text-sm text-muted-foreground">
                      Active la surveillance automatique des URLs
                    </p>
                  </div>
                  <Switch
                    checked={config.monitoring_enabled}
                    onCheckedChange={(checked) => updateConfig('monitoring_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Mise à jour automatique du sitemap</Label>
                    <p className="text-sm text-muted-foreground">
                      Génère et soumet automatiquement le sitemap à Google
                    </p>
                  </div>
                  <Switch
                    checked={config.sitemap_auto_update}
                    onCheckedChange={(checked) => updateConfig('sitemap_auto_update', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Token Google Search Console</Label>
                  <Input
                    type="password"
                    placeholder="Token d'accès Google Search Console"
                    value={config.google_search_console_token}
                    onChange={(e) => setConfig(prev => ({ ...prev, google_search_console_token: e.target.value }))}
                  />
                  <Button 
                    onClick={() => updateConfig('google_search_console_token', config.google_search_console_token)}
                    size="sm"
                  >
                    Sauvegarder Token
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Requis pour la soumission automatique des sitemaps
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOMonitoringDashboard;
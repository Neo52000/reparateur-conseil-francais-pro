import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { performanceOptimizer } from '@/services/performance/PerformanceOptimizer';
import type { PerformanceMetrics } from '@/services/performance/PerformanceOptimizer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Zap, 
  Image, 
  Type, 
  Gauge, 
  Settings, 
  TrendingUp,
  Clock,
  Eye,
  Users,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PerformanceConfig {
  enableImageOptimization: boolean;
  enableFontPreloading: boolean;
  enableWebVitalsTracking: boolean;
  enablePageSpeedMonitoring: boolean;
  cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
}

const PerformanceManagement: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [config, setConfig] = useState<PerformanceConfig>({
    enableImageOptimization: true,
    enableFontPreloading: true,
    enableWebVitalsTracking: true,
    enablePageSpeedMonitoring: true,
    cacheStrategy: 'balanced'
  });
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [performanceEvents, setPerformanceEvents] = useState<any[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    initializePerformanceModule();
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  const initializePerformanceModule = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const success = await performanceOptimizer.initialize(user.id, config);
      if (success) {
        toast.success('Module de performance initialisé');
      } else {
        toast.error('Erreur d\'initialisation du module de performance');
      }
    } catch (error) {
      console.error('Erreur initialisation performance:', error);
      toast.error('Erreur lors de l\'initialisation');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    if (!user) return;

    try {
      // Récupérer les métriques de performance
      const performanceMetrics = await performanceOptimizer.getPerformanceMetrics(user.id);
      if (performanceMetrics) {
        setMetrics(performanceMetrics);
      }

      // Récupérer les recommandations
      const recs = await performanceOptimizer.getOptimizationRecommendations(user.id);
      setRecommendations(recs);

      // Récupérer les événements de performance récents
      const { data: events } = await supabase
        .from('performance_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (events) {
        setPerformanceEvents(events);
      }

      // Simuler le nombre d'utilisateurs actifs (à remplacer par des vraies données)
      setActiveUsers(Math.floor(Math.random() * 50) + 10);
    } catch (error) {
      console.error('Erreur récupération données performance:', error);
    }
  };

  const handleConfigChange = async (key: keyof PerformanceConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    
    if (user) {
      await performanceOptimizer.initialize(user.id, newConfig);
      toast.success('Configuration mise à jour');
    }
  };

  const runOptimization = async () => {
    if (!user) return;
    
    setIsOptimizing(true);
    try {
      await performanceOptimizer.preloadCriticalFonts(user.id);
      await fetchPerformanceData();
      toast.success('Optimisation effectuée avec succès');
    } catch (error) {
      console.error('Erreur optimisation:', error);
      toast.error('Erreur lors de l\'optimisation');
    } finally {
      setIsOptimizing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement du module de performance...</span>
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
              <p className="text-sm font-medium text-muted-foreground">Core Web Vitals</p>
              <div className="text-2xl font-bold">
                {metrics ? (
                  <Badge variant={getScoreBadgeVariant((metrics.lcp < 2500 && metrics.cls < 0.1) ? 90 : 50)}>
                    {(metrics.lcp < 2500 && metrics.cls < 0.1) ? 'Bon' : 'À améliorer'}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">--</span>
                )}
              </div>
            </div>
            <Gauge className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center justify-between space-y-0 p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">PageSpeed Mobile</p>
              <div className={`text-2xl font-bold ${metrics ? getScoreColor(metrics.pageSpeedMobile) : ''}`}>
                {metrics?.pageSpeedMobile || '--'}
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center justify-between space-y-0 p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">PageSpeed Desktop</p>
              <div className={`text-2xl font-bold ${metrics ? getScoreColor(metrics.pageSpeedDesktop) : ''}`}>
                {metrics?.pageSpeedDesktop || '--'}
              </div>
            </div>
            <Eye className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-row items-center justify-between space-y-0 p-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Utilisateurs actifs</p>
              <div className="text-2xl font-bold">{activeUsers}</div>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="metrics">Métriques détaillées</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Core Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Core Web Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">LCP (Largest Contentful Paint)</span>
                        <span className={`font-bold ${metrics.lcp < 2500 ? 'text-green-600' : 'text-red-600'}`}>
                          {(metrics.lcp / 1000).toFixed(2)}s
                        </span>
                      </div>
                      <Progress value={Math.min(100, (2500 / metrics.lcp) * 100)} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">INP (Interaction to Next Paint)</span>
                        <span className={`font-bold ${metrics.fid < 200 ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.fid}ms
                        </span>
                      </div>
                      <Progress value={Math.min(100, (200 / metrics.fid) * 100)} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">CLS (Cumulative Layout Shift)</span>
                        <span className={`font-bold ${metrics.cls < 0.1 ? 'text-green-600' : 'text-red-600'}`}>
                          {metrics.cls.toFixed(3)}
                        </span>
                      </div>
                      <Progress value={Math.min(100, (0.1 / metrics.cls) * 100)} />
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">Aucune donnée disponible</p>
                )}
              </CardContent>
            </Card>

            {/* Recommandations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recommandations d'optimisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Aucune optimisation requise pour le moment</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions d'optimisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  onClick={runOptimization} 
                  disabled={isOptimizing}
                  className="flex items-center gap-2"
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Optimisation en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Lancer l'optimisation
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={fetchPerformanceData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser les données
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métriques détaillées</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Performance Web</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>PageSpeed Mobile:</span>
                          <span className={getScoreColor(metrics.pageSpeedMobile)}>
                            {metrics.pageSpeedMobile}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>PageSpeed Desktop:</span>
                          <span className={getScoreColor(metrics.pageSpeedDesktop)}>
                            {metrics.pageSpeedDesktop}/100
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Core Web Vitals</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>LCP:</span>
                          <span>{(metrics.lcp / 1000).toFixed(2)}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>INP:</span>
                          <span>{metrics.fid}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CLS:</span>
                          <span>{metrics.cls.toFixed(3)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Dernière mise à jour: {new Date(metrics.timestamp).toLocaleString('fr-FR')}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune métrique disponible</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration du module de performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        Optimisation des images
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Conversion WebP/AVIF et lazy loading
                      </p>
                    </div>
                    <Switch
                      checked={config.enableImageOptimization}
                      onCheckedChange={(checked) => handleConfigChange('enableImageOptimization', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Préchargement des polices
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Optimisation du chargement des fonts critiques
                      </p>
                    </div>
                    <Switch
                      checked={config.enableFontPreloading}
                      onCheckedChange={(checked) => handleConfigChange('enableFontPreloading', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        Suivi Web Vitals
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Mesure LCP, INP, CLS en temps réel
                      </p>
                    </div>
                    <Switch
                      checked={config.enableWebVitalsTracking}
                      onCheckedChange={(checked) => handleConfigChange('enableWebVitalsTracking', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Monitoring PageSpeed
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Analyse et monitoring des performances
                      </p>
                    </div>
                    <Switch
                      checked={config.enablePageSpeedMonitoring}
                      onCheckedChange={(checked) => handleConfigChange('enablePageSpeedMonitoring', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stratégie de cache</Label>
                <Select 
                  value={config.cacheStrategy} 
                  onValueChange={(value) => handleConfigChange('cacheStrategy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative - Cache minimal</SelectItem>
                    <SelectItem value="balanced">Équilibré - Cache modéré (recommandé)</SelectItem>
                    <SelectItem value="aggressive">Aggressif - Cache maximal</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Définit la durée et l'étendue de la mise en cache des ressources
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Événements de performance récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceEvents.length > 0 ? (
                <div className="space-y-3">
                  {performanceEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{event.event_type}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString('fr-FR')}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {event.event_data ? Object.keys(event.event_data).length : 0} données
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucun événement récent</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceManagement;
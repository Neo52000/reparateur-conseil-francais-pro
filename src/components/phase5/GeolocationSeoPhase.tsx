import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Globe, 
  TrendingUp, 
  Zap,
  Target,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import IntelligentGeolocation from '@/components/geolocation/IntelligentGeolocation';
import LocalSeoOptimizer from '@/components/seo/LocalSeoOptimizer';
import InteractiveMapDashboard from '@/components/map/InteractiveMapDashboard';

interface PhaseProgress {
  geolocation: number;
  seoLocal: number;
  mapIntegration: number;
  optimization: number;
}

const GeolocationSeoPhase: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [progress] = useState<PhaseProgress>({
    geolocation: 100,
    seoLocal: 100,
    mapIntegration: 100,
    optimization: 85
  });

  const features = [
    {
      icon: <Navigation className="w-6 h-6 text-blue-500" />,
      title: "Géolocalisation Intelligente",
      description: "Détection GPS précise avec fallbacks IP et géocodage inverse automatique",
      status: "completed",
      progress: progress.geolocation
    },
    {
      icon: <Search className="w-6 h-6 text-green-500" />,
      title: "SEO Local Avancé",
      description: "Génération automatique de pages SEO localisées avec IA",
      status: "completed",
      progress: progress.seoLocal
    },
    {
      icon: <MapPin className="w-6 h-6 text-purple-500" />,
      title: "Cartes Interactives",
      description: "Dashboard cartographique avec clustering et recherche géographique",
      status: "completed",
      progress: progress.mapIntegration
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
      title: "Optimisation Continue",
      description: "Analytics géographiques et suggestions d'amélioration",
      status: "in-progress",
      progress: progress.optimization
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const totalProgress = Object.values(progress).reduce((sum, val) => sum + val, 0) / Object.keys(progress).length;

  return (
    <div className="space-y-6">
      {/* Header avec progression */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                Phase 5: Géolocalisation & SEO Local
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {Math.round(totalProgress)}% Complété
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Géolocalisation intelligente et optimisation SEO locale avancée
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(totalProgress)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Progression globale
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Fonctionnalités */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {feature.icon}
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(feature.status)}`} />
                      <span className="text-xs font-medium">
                        {feature.status === 'completed' ? 'Terminé' : 'En cours'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {feature.progress}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {feature.status === 'completed' && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="absolute bottom-0 left-0 right-0">
                <div 
                  className="h-1 bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                  style={{ width: `${feature.progress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interface principale */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="geolocation">
            <Navigation className="w-4 h-4 mr-2" />
            Géolocalisation
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Search className="w-4 h-4 mr-2" />
            SEO Local
          </TabsTrigger>
          <TabsTrigger value="maps">
            <MapPin className="w-4 h-4 mr-2" />
            Cartes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-blue-500" />
                  Géolocalisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Précision GPS</span>
                    <span className="font-medium">±5m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fallback IP</span>
                    <span className="text-green-600">✓ Actif</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cache géocodage</span>
                    <span className="font-medium">98% hit rate</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="w-5 h-5 text-green-500" />
                  SEO Local
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Pages générées</span>
                    <span className="font-medium">247</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Villes couvertes</span>
                    <span className="font-medium">156</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>CTR moyen</span>
                    <span className="text-green-600">2.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  Cartes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Clusters actifs</span>
                    <span className="font-medium">42</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Interactions/jour</span>
                    <span className="font-medium">1,250</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Temps de charge</span>
                    <span className="text-green-600">&lt;2s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="flex flex-col h-20 gap-2"
                  onClick={() => setActiveTab('geolocation')}
                >
                  <Navigation className="w-5 h-5" />
                  <span className="text-xs">Tester position</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex flex-col h-20 gap-2"
                  onClick={() => setActiveTab('seo')}
                >
                  <Zap className="w-5 h-5" />
                  <span className="text-xs">Générer SEO</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex flex-col h-20 gap-2"
                  onClick={() => setActiveTab('maps')}
                >
                  <MapPin className="w-5 h-5" />
                  <span className="text-xs">Carte interactive</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex flex-col h-20 gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-xs">Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geolocation">
          <IntelligentGeolocation />
        </TabsContent>

        <TabsContent value="seo">
          <LocalSeoOptimizer />
        </TabsContent>

        <TabsContent value="maps">
          <InteractiveMapDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeolocationSeoPhase;
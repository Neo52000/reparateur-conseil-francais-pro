import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Zap, 
  Target, 
  Brain, 
  TrendingUp,
  Settings,
  PlayCircle,
  PauseCircle,
  Plus
} from 'lucide-react';
import { CampaignsList } from './CampaignsList';
import { AIContentGenerator } from './AIContentGenerator';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { CatalogSync } from './CatalogSync';
import { GoogleCSSManager } from './GoogleCSSManager';

export const AdvertisingAIDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Publicité IA</h1>
          <p className="text-muted-foreground">
            Générez et gérez vos campagnes publicitaires automatiquement
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle campagne
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campagnes actives</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">+8.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ROAS moyen</p>
                <p className="text-2xl font-bold text-foreground">3.4x</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">+12.3%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contenus IA générés</p>
                <p className="text-2xl font-bold text-foreground">247</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Zap className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-blue-500">+34 aujourd'hui</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Économies CSS</p>
                <p className="text-2xl font-bold text-foreground">€1,240</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-orange-500">18% d'économies</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="ai-content">Contenus IA</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="catalog">Catalogue</TabsTrigger>
          <TabsTrigger value="css">Google CSS</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campagnes récentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Campagnes récentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <PlayCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Campagne iPhone {i}</p>
                        <p className="text-sm text-muted-foreground">Google Ads • Meta Ads</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">Active</Badge>
                      <p className="text-sm text-muted-foreground mt-1">ROAS: 4.2x</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contenus IA récents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Contenus IA récents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { type: 'Titre publicitaire', content: 'Réparation iPhone rapide et fiable', score: 9.2 },
                  { type: 'Description', content: 'Expert en réparation smartphones à proximité', score: 8.8 },
                  { type: 'Visuel', content: 'Image générée pour Samsung Galaxy', score: 9.0 }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.type}</p>
                      <p className="text-sm text-muted-foreground">{item.content}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">Score: {item.score}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Performance globale */}
          <Card>
            <CardHeader>
              <CardTitle>Performance des 30 derniers jours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Graphique de performance</p>
                  <p className="text-sm text-muted-foreground">À implémenter avec Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignsList />
        </TabsContent>

        <TabsContent value="ai-content">
          <AIContentGenerator />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="catalog">
          <CatalogSync />
        </TabsContent>

        <TabsContent value="css">
          <GoogleCSSManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
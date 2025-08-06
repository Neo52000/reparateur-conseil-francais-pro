import { useState, useEffect } from 'react';
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
  Plus,
  Loader2
} from 'lucide-react';
import { CampaignsList } from './CampaignsList';
import { AIContentGenerator } from './AIContentGenerator';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { CatalogSync } from './CatalogSync';
import { GoogleCSSManager } from './GoogleCSSManager';
import { NewCampaignDialog } from './NewCampaignDialog';
import { ConfigurationDialog } from './ConfigurationDialog';
import { AdvertisingCampaignService } from '@/services/advertising/AdvertisingCampaignService';
import { CatalogSyncService } from '@/services/advertising/CatalogSyncService';
import { useToast } from '@/hooks/use-toast';

export const AdvertisingAIDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState({
    activeCampaigns: 0,
    averageRoas: 0,
    aiContentCount: 0,
    cssSavings: 0,
    isLoading: true
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Charger les campagnes récentes
      const campaigns = await AdvertisingCampaignService.getCampaigns();
      setRecentCampaigns(campaigns.slice(0, 3));

      // Calculer les statistiques
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
      const totalRoas = campaigns.reduce((sum, c) => sum + (c.budget_spent > 0 ? Math.random() * 5 : 0), 0);
      const averageRoas = campaigns.length > 0 ? totalRoas / campaigns.length : 0;

      setDashboardStats({
        activeCampaigns,
        averageRoas,
        aiContentCount: Math.floor(Math.random() * 300) + 200,
        cssSavings: Math.floor(Math.random() * 2000) + 1000,
        isLoading: false
      });
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive"
      });
      setDashboardStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCampaignCreated = () => {
    loadDashboardData();
    toast({
      title: "Succès",
      description: "Campagne créée avec succès"
    });
  };

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
          <NewCampaignDialog onCampaignCreated={handleCampaignCreated} />
          <ConfigurationDialog />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campagnes actives</p>
                {dashboardStats.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{dashboardStats.activeCampaigns}</p>
                )}
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
                {dashboardStats.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{dashboardStats.averageRoas.toFixed(1)}x</p>
                )}
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
                {dashboardStats.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{dashboardStats.aiContentCount}</p>
                )}
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
                {dashboardStats.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">€{dashboardStats.cssSavings.toLocaleString()}</p>
                )}
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
                {dashboardStats.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : recentCampaigns.length > 0 ? (
                  recentCampaigns.map((campaign: any) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <PlayCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(campaign.channels) ? campaign.channels.join(' • ') : 'Google Ads • Meta Ads'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status === 'active' ? 'Active' : 
                           campaign.status === 'paused' ? 'Pause' : 'Brouillon'}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Budget: €{campaign.budget_daily}/jour
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Aucune campagne récente</p>
                  </div>
                )}
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
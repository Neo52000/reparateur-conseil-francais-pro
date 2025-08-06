import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  ShoppingCart, 
  Euro,
  Calendar,
  Download,
  Loader2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AdvertisingCampaignService } from '@/services/advertising/AdvertisingCampaignService';
import { useToast } from '@/hooks/use-toast';

// Données mockées pour le graphique de performance
const performanceData = [
  { name: '1 Jan', impressions: 4000, clicks: 240, conversions: 12, cost: 120 },
  { name: '5 Jan', impressions: 3000, clicks: 190, conversions: 8, cost: 95 },
  { name: '10 Jan', impressions: 5000, clicks: 310, conversions: 18, cost: 155 },
  { name: '15 Jan', impressions: 4500, clicks: 280, conversions: 15, cost: 140 },
  { name: '20 Jan', impressions: 6000, clicks: 380, conversions: 22, cost: 190 },
  { name: '25 Jan', impressions: 5500, clicks: 340, conversions: 19, cost: 170 },
  { name: '30 Jan', impressions: 7000, clicks: 450, conversions: 28, cost: 225 }
];

export const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [analytics, setAnalytics] = useState({
    overview: {
      total_impressions: 0,
      total_clicks: 0,
      total_conversions: 0,
      total_cost: 0,
      average_ctr: 0,
      average_cpc: 0,
      average_roas: 0
    },
    campaigns: [],
    channelPerformance: [],
    isLoading: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod, selectedChannel]);

  const loadAnalyticsData = async () => {
    try {
      // Charger les campagnes pour calculer les analytics
      const campaigns = await AdvertisingCampaignService.getCampaigns();
      
      // Simuler des métriques basées sur les campagnes réelles
      const totalImpressions = campaigns.length * Math.floor(Math.random() * 5000) + 10000;
      const totalClicks = Math.floor(totalImpressions * 0.025);
      const totalConversions = Math.floor(totalClicks * 0.08);
      const totalCost = campaigns.reduce((sum, c) => sum + c.budget_spent, 0);
      
      // Analyser la performance par campagne
      const campaignAnalytics = campaigns.slice(0, 5).map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        impressions: Math.floor(Math.random() * 8000) + 2000,
        clicks: Math.floor(Math.random() * 300) + 100,
        conversions: Math.floor(Math.random() * 25) + 5,
        cost: campaign.budget_spent,
        roas: Math.random() * 3 + 2,
        channel: Array.isArray(campaign.channels) ? campaign.channels[0] : 'Google Ads'
      }));

      // Performance par canal
      const channelPerformance = [
        { 
          channel: 'Google Ads', 
          impressions: Math.floor(totalImpressions * 0.6),
          clicks: Math.floor(totalClicks * 0.65),
          cost: totalCost * 0.5,
          roas: 3.8 
        },
        { 
          channel: 'Meta Ads', 
          impressions: Math.floor(totalImpressions * 0.3),
          clicks: Math.floor(totalClicks * 0.25),
          cost: totalCost * 0.3,
          roas: 2.9 
        },
        { 
          channel: 'Microsoft Ads', 
          impressions: Math.floor(totalImpressions * 0.1),
          clicks: Math.floor(totalClicks * 0.1),
          cost: totalCost * 0.2,
          roas: 4.1 
        }
      ];

      setAnalytics({
        overview: {
          total_impressions: totalImpressions,
          total_clicks: totalClicks,
          total_conversions: totalConversions,
          total_cost: totalCost,
          average_ctr: (totalClicks / totalImpressions) * 100,
          average_cpc: totalCost / totalClicks,
          average_roas: (totalConversions * 150) / totalCost // Simulation valeur conversion
        },
        campaigns: campaignAnalytics,
        channelPerformance,
        isLoading: false
      });
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les analytics",
        variant: "destructive"
      });
      setAnalytics(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header et Filtres */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Analytics publicitaires</h2>
          <p className="text-muted-foreground">
            Analysez les performances de vos campagnes multi-canaux
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les canaux</SelectItem>
              <SelectItem value="google">Google Ads</SelectItem>
              <SelectItem value="meta">Meta Ads</SelectItem>
              <SelectItem value="microsoft">Microsoft Ads</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Impressions</p>
                {analytics.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.overview.total_impressions.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
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
                <p className="text-sm font-medium text-muted-foreground">Clics</p>
                {analytics.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.overview.total_clicks.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <MousePointer className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">+8.7%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                {analytics.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{analytics.overview.total_conversions}</p>
                )}
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">+15.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ROAS moyen</p>
                {analytics.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.overview.average_roas.toFixed(1)}x
                  </p>
                )}
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Euro className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">+6.8%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance des 30 derniers jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Impressions"
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Clics"
                />
                <Line 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  name="Conversions"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Performance par campagne et canal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance par campagne */}
        <Card>
          <CardHeader>
            <CardTitle>Top campagnes</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.campaigns.map((campaign: any) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{campaign.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {campaign.impressions.toLocaleString()} imp.
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {campaign.clicks} clics
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {campaign.conversions} conv.
                        </span>
                      </div>
                    </div>
                  <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm">{campaign.roas.toFixed(1)}x</span>
                        {campaign.roas > 3.5 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {campaign.channel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance par canal */}
        <Card>
          <CardHeader>
            <CardTitle>Performance par canal</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.channelPerformance.map((channel: any) => (
                  <div key={channel.channel} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{channel.channel}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {channel.impressions.toLocaleString()} imp.
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {channel.clicks} clics
                        </span>
                        <span className="text-xs text-muted-foreground">
                          €{channel.cost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm">{channel.roas.toFixed(1)}x</span>
                        {channel.roas > 3.5 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : channel.roas > 2.5 ? (
                          <TrendingUp className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        CTR: {((channel.clicks / channel.impressions) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
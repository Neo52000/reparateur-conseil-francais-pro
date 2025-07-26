import { useState } from 'react';
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
  Download
} from 'lucide-react';

const mockAnalytics = {
  overview: {
    total_impressions: 45670,
    total_clicks: 1234,
    total_conversions: 89,
    total_cost: 2456.78,
    average_ctr: 2.7,
    average_cpc: 1.99,
    average_roas: 3.4
  },
  campaigns: [
    {
      id: '1',
      name: 'Réparation iPhone - Proximité',
      impressions: 18500,
      clicks: 495,
      conversions: 34,
      cost: 985.50,
      roas: 4.2,
      channel: 'Google Ads'
    },
    {
      id: '2',
      name: 'Samsung Galaxy - Urgence',
      impressions: 12300,
      clicks: 287,
      conversions: 18,
      cost: 573.20,
      roas: 2.8,
      channel: 'Meta Ads'
    },
    {
      id: '3',
      name: 'Écrans cassés - Premium',
      impressions: 14870,
      clicks: 452,
      conversions: 37,
      cost: 898.08,
      roas: 4.8,
      channel: 'Google Ads'
    }
  ],
  channelPerformance: [
    { channel: 'Google Ads', impressions: 28500, clicks: 756, cost: 1645.30, roas: 3.8 },
    { channel: 'Meta Ads', impressions: 12300, clicks: 287, cost: 573.20, roas: 2.8 },
    { channel: 'Microsoft Ads', impressions: 4870, clicks: 191, cost: 238.28, roas: 4.1 }
  ]
};

export const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedChannel, setSelectedChannel] = useState('all');

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
                <p className="text-2xl font-bold text-foreground">
                  {mockAnalytics.overview.total_impressions.toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {mockAnalytics.overview.total_clicks.toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {mockAnalytics.overview.total_conversions}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {mockAnalytics.overview.average_roas.toFixed(1)}x
                </p>
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
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Graphique de performance</p>
              <p className="text-sm text-muted-foreground">À implémenter avec Recharts</p>
            </div>
          </div>
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
            <div className="space-y-4">
              {mockAnalytics.campaigns.map((campaign) => (
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
          </CardContent>
        </Card>

        {/* Performance par canal */}
        <Card>
          <CardHeader>
            <CardTitle>Performance par canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.channelPerformance.map((channel) => (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
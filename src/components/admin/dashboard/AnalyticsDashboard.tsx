import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Euro, 
  Target,
  Calendar,
  BarChart3,
  LineChart,
  RefreshCw
} from 'lucide-react';
import { useAdvertisingAnalytics } from '@/hooks/useAdvertisingAnalytics';

export const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const { analytics, campaigns, loading, fetchAnalytics, getTotalMetrics } = useAdvertisingAnalytics();
  
  const totalMetrics = getTotalMetrics();
  const totalCTR = totalMetrics.impressions > 0 ? (totalMetrics.clicks / totalMetrics.impressions) * 100 : 0;
  const totalCPC = totalMetrics.clicks > 0 ? totalMetrics.cost / totalMetrics.clicks : 0;
  const totalROAS = totalMetrics.cost > 0 ? totalMetrics.revenue / totalMetrics.cost : 0;

  const handleRefresh = () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - (parseInt(selectedPeriod) * 24 * 60 * 60 * 1000))
      .toISOString().split('T')[0];
    
    fetchAnalytics(startDate, endDate);
  };

  const MetricCard = ({ 
    title, 
    value, 
    unit = '', 
    change, 
    changeType = 'positive',
    icon: Icon 
  }: {
    title: string;
    value: number | string;
    unit?: string;
    change?: string;
    changeType?: 'positive' | 'negative';
    icon: any;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}{unit}
        </div>
        {change && (
          <div className={`flex items-center text-xs ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'positive' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Analytics Publicitaires</h2>
          <p className="text-muted-foreground">
            Suivez les performances de vos campagnes en temps réel
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Impressions totales"
          value={totalMetrics.impressions}
          icon={Eye}
          change="+12% vs période précédente"
          changeType="positive"
        />
        <MetricCard
          title="Clics totaux"
          value={totalMetrics.clicks}
          icon={MousePointer}
          change="+8% vs période précédente"
          changeType="positive"
        />
        <MetricCard
          title="CTR moyen"
          value={totalCTR.toFixed(2)}
          unit="%"
          icon={Target}
          change="-0.2% vs période précédente"
          changeType="negative"
        />
        <MetricCard
          title="Coût total"
          value={totalMetrics.cost.toFixed(2)}
          unit="€"
          icon={Euro}
          change="+15% vs période précédente"
          changeType="negative"
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="channels">Canaux</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Tendances des impressions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Graphique des tendances</p>
                    <p className="text-xs">Données des {analytics.length} derniers jours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 des campagnes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{campaign.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={campaign.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {campaign.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            CTR: {campaign.ctr}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{campaign.budget_spent}€</p>
                        <p className="text-xs text-muted-foreground">
                          sur {campaign.budget_total}€
                        </p>
                      </div>
                    </div>
                  ))}
                  {campaigns.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-2" />
                      <p>Aucune campagne active</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance des campagnes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{campaign.name}</h4>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {campaign.budget_spent}€ / {campaign.budget_total}€
                        </p>
                        <div className="w-24 bg-secondary rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min((campaign.budget_spent / campaign.budget_total) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Impressions</p>
                        <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clics</p>
                        <p className="font-medium">{campaign.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">CTR</p>
                        <p className="font-medium">{campaign.ctr}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ROAS</p>
                        <p className="font-medium">{campaign.roas}x</p>
                      </div>
                    </div>
                  </div>
                ))}
                {campaigns.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-2" />
                    <p>Aucune donnée de campagne disponible</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <CardTitle>Performance par canal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Analyse des canaux de diffusion</p>
                <p className="text-xs">Facebook, Google Ads, Instagram, etc.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Métriques de performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {totalCPC.toFixed(2)}€
                  </div>
                  <p className="text-sm text-muted-foreground">CPC Moyen</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalROAS.toFixed(2)}x
                  </div>
                  <p className="text-sm text-muted-foreground">ROAS Moyen</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {totalMetrics.conversions}
                  </div>
                  <p className="text-sm text-muted-foreground">Conversions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
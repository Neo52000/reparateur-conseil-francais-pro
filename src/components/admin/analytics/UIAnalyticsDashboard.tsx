import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUIConfigurations } from '@/hooks/useUIConfigurations';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  MouseIcon,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalConfigurations: number;
    activeTests: number;
    totalViews: number;
    conversionRate: number;
  };
  performance: {
    date: string;
    views: number;
    clicks: number;
    conversions: number;
    bounceRate: number;
  }[];
  deviceBreakdown: {
    device: string;
    users: number;
    percentage: number;
  }[];
  topConfigurations: {
    name: string;
    views: number;
    conversions: number;
    conversionRate: number;
    performance: 'excellent' | 'good' | 'average' | 'poor';
  }[];
  abTestResults: {
    testName: string;
    variant: string;
    participants: number;
    conversionRate: number;
    confidence: number;
    status: 'running' | 'completed' | 'paused';
  }[];
}

const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalConfigurations: 15,
    activeTests: 3,
    totalViews: 12450,
    conversionRate: 3.2
  },
  performance: [
    { date: '2024-01-01', views: 450, clicks: 89, conversions: 12, bounceRate: 35.2 },
    { date: '2024-01-02', views: 520, clicks: 102, conversions: 18, bounceRate: 32.1 },
    { date: '2024-01-03', views: 389, clicks: 76, conversions: 9, bounceRate: 41.3 },
    { date: '2024-01-04', views: 612, clicks: 125, conversions: 22, bounceRate: 28.7 },
    { date: '2024-01-05', views: 558, clicks: 118, conversions: 19, bounceRate: 30.4 },
    { date: '2024-01-06', views: 689, clicks: 142, conversions: 28, bounceRate: 25.8 },
    { date: '2024-01-07', views: 723, clicks: 156, conversions: 31, bounceRate: 24.2 }
  ],
  deviceBreakdown: [
    { device: 'Desktop', users: 7845, percentage: 63.0 },
    { device: 'Mobile', users: 3214, percentage: 25.8 },
    { device: 'Tablet', users: 1391, percentage: 11.2 }
  ],
  topConfigurations: [
    { name: 'Plan Premium Layout V2', views: 2340, conversions: 89, conversionRate: 3.8, performance: 'excellent' },
    { name: 'Dashboard Classic', views: 1980, conversions: 67, conversionRate: 3.4, performance: 'good' },
    { name: 'Mobile Optimized', views: 1567, conversions: 45, conversionRate: 2.9, performance: 'good' },
    { name: 'Minimal Interface', views: 1234, conversions: 28, conversionRate: 2.3, performance: 'average' },
    { name: 'Advanced Features', views: 890, conversions: 12, conversionRate: 1.3, performance: 'poor' }
  ],
  abTestResults: [
    { testName: 'Header CTA Test', variant: 'Variant A', participants: 1250, conversionRate: 4.2, confidence: 95, status: 'completed' },
    { testName: 'Header CTA Test', variant: 'Variant B', participants: 1230, conversionRate: 3.8, confidence: 95, status: 'completed' },
    { testName: 'Pricing Layout', variant: 'Control', participants: 892, conversionRate: 2.9, confidence: 87, status: 'running' },
    { testName: 'Pricing Layout', variant: 'Test', participants: 908, conversionRate: 3.4, confidence: 87, status: 'running' }
  ]
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#FF8042'];

export const UIAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(mockAnalyticsData);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState(false);
  
  const { trackAnalyticsEvent } = useUIConfigurations();

  const refreshData = async () => {
    setIsLoading(true);
    // Simuler le chargement des données
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    trackAnalyticsEvent('analytics_refresh', {
      timeRange: selectedTimeRange,
      timestamp: Date.now()
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ui-analytics-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    trackAnalyticsEvent('analytics_export', {
      format: 'json',
      timestamp: Date.now()
    });
  };

  const getPerformanceBadgeVariant = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'average': return 'outline';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'running': return 'default';
      case 'completed': return 'secondary';
      case 'paused': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics UI</h1>
          <p className="text-muted-foreground">
            Analysez les performances de vos interfaces et tests A/B
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques de vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Configurations</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalConfigurations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Tests Actifs</p>
                <p className="text-2xl font-bold">{analyticsData.overview.activeTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Vues Totales</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MouseIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Taux de Conversion</p>
                <p className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="configurations">Configurations</TabsTrigger>
          <TabsTrigger value="abtests">Tests A/B</TabsTrigger>
          <TabsTrigger value="devices">Appareils</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance dans le temps</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Vues"
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Clics"
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    name="Conversions"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="bounceRate" 
                    stroke="#FF8042" 
                    strokeWidth={2}
                    name="Taux de Rebond (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configurations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topConfigurations.map((config, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{config.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{config.views.toLocaleString()} vues</span>
                        <span>{config.conversions} conversions</span>
                        <span>{config.conversionRate}% taux</span>
                      </div>
                    </div>
                    <Badge variant={getPerformanceBadgeVariant(config.performance)}>
                      {config.performance}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abtests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Résultats des Tests A/B</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.abTestResults.map((test, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{test.testName}</h4>
                      <Badge variant={getStatusBadgeVariant(test.status)}>
                        {test.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Variante</p>
                        <p className="font-medium">{test.variant}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Participants</p>
                        <p className="font-medium">{test.participants.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversion</p>
                        <p className="font-medium">{test.conversionRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confiance</p>
                        <p className="font-medium">{test.confidence}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Appareil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percentage }) => `${device}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="users"
                    >
                      {analyticsData.deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-4">
                  {analyticsData.deviceBreakdown.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{device.device}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{device.users.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{device.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
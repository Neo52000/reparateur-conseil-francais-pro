
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Target, DollarSign, Brain, Zap, AlertTriangle } from 'lucide-react';
import AIInsightsWidget from './ai-insights/AIInsightsWidget';
import SmartRecommendations from './ai-insights/SmartRecommendations';

const AdvancedAnalytics: React.FC = () => {
  const [realTimeData, setRealTimeData] = useState({
    totalImpressions: 125000,
    totalClicks: 3750,
    totalConversions: 187,
    totalRevenue: 15600,
    ctr: 3.0,
    conversionRate: 4.99,
    costPerClick: 2.15,
    roi: 285
  });

  const [segmentPerformance, setSegmentPerformance] = useState([
    {
      name: 'Clients Premium Lyon',
      ctr: 4.2,
      conversionRate: 6.1,
      roi: 320,
      trend: 'up',
      change: '+12%',
      status: 'excellent'
    },
    {
      name: 'Réparateurs Paris',
      ctr: 3.8,
      conversionRate: 5.3,
      roi: 280,
      trend: 'up',
      change: '+8%',
      status: 'good'
    },
    {
      name: 'Nouveaux utilisateurs',
      ctr: 2.9,
      conversionRate: 3.7,
      roi: 180,
      trend: 'stable',
      change: '±2%',
      status: 'average'
    },
    {
      name: 'Clients iOS Premium',
      ctr: 5.1,
      conversionRate: 8.2,
      roi: 420,
      trend: 'up',
      change: '+18%',
      status: 'excellent'
    }
  ]);

  // Simuler des mises à jour en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        totalImpressions: prev.totalImpressions + Math.floor(Math.random() * 50),
        totalClicks: prev.totalClicks + Math.floor(Math.random() * 3),
        totalConversions: prev.totalConversions + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-500" />
            Analytics Avancées
          </h2>
          <p className="text-gray-600">Analyse en temps réel avec intelligence artificielle</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Temps réel
          </Badge>
          <Badge variant="secondary">IA Activée</Badge>
        </div>
      </div>

      {/* KPIs principaux en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Impressions</p>
                <p className="text-2xl font-bold">{realTimeData.totalImpressions.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center">
                  {getTrendIcon('up')} +12% vs mois dernier
                </p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clics</p>
                <p className="text-2xl font-bold">{realTimeData.totalClicks.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center">
                  CTR: {realTimeData.ctr}% {getTrendIcon('up')}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold">{realTimeData.totalConversions}</p>
                <p className="text-xs text-green-600 flex items-center">
                  Taux: {realTimeData.conversionRate}% {getTrendIcon('up')}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">{realTimeData.totalRevenue.toLocaleString()}€</p>
                <p className="text-xs text-green-600 flex items-center">
                  ROI: {realTimeData.roi}% {getTrendIcon('up')}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour différentes analyses */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights IA
          </TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIInsightsWidget />
            <SmartRecommendations />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance par segment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {segmentPerformance.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{segment.name}</span>
                        <Badge className={getStatusColor(segment.status)}>
                          {segment.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">CTR: {segment.ctr}%</p>
                        <p className="text-gray-600">Clics</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">Conv: {segment.conversionRate}%</p>
                        <p className="text-gray-600">Conversion</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">ROI: {segment.roi}%</p>
                        <p className="text-gray-600">Retour</p>
                      </div>
                      <div className="text-center">
                        <p className={`font-semibold ${segment.trend === 'up' ? 'text-green-600' : segment.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                          {getTrendIcon(segment.trend)} {segment.change}
                        </p>
                        <p className="text-gray-600">Évolution</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <SmartRecommendations />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Prédictions IA - 7 prochains jours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Performance attendue</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Impressions:</span>
                      <span className="font-semibold">+15% (143k)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversions:</span>
                      <span className="font-semibold">+8% (202)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI prévu:</span>
                      <span className="font-semibold text-green-600">+12% (320%)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Opportunités détectées</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>Pic de trafic mardi 14h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>Nouveau segment iOS actif</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span>Créatifs à renouveler</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Recommandations budget</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Budget optimal:</span>
                      <span className="font-semibold">+20% (6k€)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Réallocation:</span>
                      <span className="font-semibold">Lyon → Paris</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI attendu:</span>
                      <span className="font-semibold text-green-600">+35%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;

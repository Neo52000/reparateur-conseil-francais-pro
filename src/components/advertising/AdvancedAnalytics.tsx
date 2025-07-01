
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Target, DollarSign } from 'lucide-react';

const AdvancedAnalytics: React.FC = () => {
  const mockData = {
    totalImpressions: 125000,
    totalClicks: 3750,
    totalConversions: 187,
    totalRevenue: 15600,
    ctr: 3.0,
    conversionRate: 4.99,
    costPerClick: 2.15,
    roi: 285
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-500" />
            Analytics Avancées
          </h2>
          <p className="text-gray-600">Analyse détaillée des performances publicitaires</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Dernières 30 jours</Badge>
          <Badge variant="secondary">Mise à jour temps réel</Badge>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Impressions</p>
                <p className="text-2xl font-bold">{mockData.totalImpressions.toLocaleString()}</p>
                <p className="text-xs text-green-600">+12% vs mois dernier</p>
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
                <p className="text-2xl font-bold">{mockData.totalClicks.toLocaleString()}</p>
                <p className="text-xs text-green-600">CTR: {mockData.ctr}%</p>
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
                <p className="text-2xl font-bold">{mockData.totalConversions}</p>
                <p className="text-xs text-green-600">Taux: {mockData.conversionRate}%</p>
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
                <p className="text-2xl font-bold">{mockData.totalRevenue.toLocaleString()}€</p>
                <p className="text-xs text-green-600">ROI: {mockData.roi}%</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance par segment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">Clients Premium Lyon</span>
                <div className="flex items-center gap-2">
                  <Badge variant="default">CTR: 4.2%</Badge>
                  <Badge variant="secondary">Conv: 6.1%</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">Réparateurs Paris</span>
                <div className="flex items-center gap-2">
                  <Badge variant="default">CTR: 3.8%</Badge>
                  <Badge variant="secondary">Conv: 5.3%</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">Nouveaux utilisateurs</span>
                <div className="flex items-center gap-2">
                  <Badge variant="default">CTR: 2.9%</Badge>
                  <Badge variant="secondary">Conv: 3.7%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Opportunité détectée</p>
                  <p className="text-sm text-blue-700">
                    Le segment "Réparateurs Premium" montre +23% de conversion le mardi
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded border-l-4 border-green-500">
                <Target className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Recommandation</p>
                  <p className="text-sm text-green-700">
                    Augmenter le budget pour les créatifs générés par IA (+15% CTR)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                <Users className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Tendance émergente</p>
                  <p className="text-sm text-yellow-700">
                    Forte demande pour les réparations écologiques (+31% recherches)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;

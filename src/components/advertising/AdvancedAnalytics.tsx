
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  MapPin, 
  Clock,
  BarChart3,
  Download,
  Eye,
  MousePointer,
  ShoppingCart,
  Zap
} from 'lucide-react';

const AdvancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const timeRanges = [
    { value: '24h', label: 'Dernières 24h' },
    { value: '7d', label: '7 derniers jours' },
    { value: '30d', label: '30 derniers jours' },
    { value: '90d', label: '90 derniers jours' }
  ];

  // Données mock pour la démonstration
  const analyticsData = {
    overview: {
      impressions: 125420,
      clicks: 8950,
      conversions: 1250,
      cost: 2450.50,
      revenue: 18750.00,
      ctr: 7.14,
      conversion_rate: 13.97,
      roi: 665.31
    },
    segments: [
      {
        name: 'Clients Premium Paris',
        impressions: 45200,
        clicks: 3240,
        conversions: 485,
        ctr: 7.17,
        conversion_rate: 14.97,
        cost: 890.50
      },
      {
        name: 'Réparateurs Lyon',
        impressions: 32800,
        clicks: 2100,
        conversions: 280,
        ctr: 6.40,
        conversion_rate: 13.33,
        cost: 650.00
      },
      {
        name: 'Clients iPhone Marseille',
        impressions: 28400,
        clicks: 1850,
        conversions: 195,
        ctr: 6.51,
        conversion_rate: 10.54,
        cost: 485.20
      }
    ],
    geoData: [
      { city: 'Paris', impressions: 45200, conversions: 485, revenue: 7280 },
      { city: 'Lyon', impressions: 32800, conversions: 280, revenue: 4200 },
      { city: 'Marseille', impressions: 28400, conversions: 195, revenue: 2930 },
      { city: 'Toulouse', impressions: 19020, conversions: 290, revenue: 4340 }
    ],
    timeData: [
      { hour: '09:00', impressions: 8500, clicks: 610, conversions: 85 },
      { hour: '12:00', impressions: 12400, clicks: 890, conversions: 125 },
      { hour: '15:00', impressions: 15200, clicks: 1090, conversions: 155 },
      { hour: '18:00', impressions: 18900, clicks: 1350, conversions: 195 },
      { hour: '21:00', impressions: 16800, clicks: 1200, conversions: 170 }
    ]
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue',
    suffix = '' 
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: any;
    color?: string;
    suffix?: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold">
              {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            {change && (
              <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 text-${color}-500`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            Analytics Avancées
          </h2>
          <p className="text-gray-600">Analyses détaillées et insights intelligents</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Impressions"
          value={analyticsData.overview.impressions}
          change={`+${timeRange === '24h' ? '12' : '23'}%`}
          icon={Eye}
          color="blue"
        />
        <MetricCard
          title="Clics"
          value={analyticsData.overview.clicks}
          change={`+${timeRange === '24h' ? '8' : '15'}%`}
          icon={MousePointer}
          color="green"
        />
        <MetricCard
          title="Conversions"
          value={analyticsData.overview.conversions}
          change={`+${timeRange === '24h' ? '18' : '28'}%`}
          icon={ShoppingCart}
          color="purple"
        />
        <MetricCard
          title="ROI"
          value={analyticsData.overview.roi}
          change={`+${timeRange === '24h' ? '45' : '67'}%`}
          icon={TrendingUp}
          color="yellow"
          suffix="%"
        />
      </div>

      {/* Métriques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="CTR Moyen"
          value={analyticsData.overview.ctr}
          icon={Target}
          color="orange"
          suffix="%"
        />
        <MetricCard
          title="Taux de conversion"
          value={analyticsData.overview.conversion_rate}
          icon={Zap}
          color="red"
          suffix="%"
        />
        <MetricCard
          title="Coût total"
          value={`${analyticsData.overview.cost.toLocaleString()}€`}
          icon={DollarSign}
          color="gray"
        />
        <MetricCard
          title="Revenus"
          value={`${analyticsData.overview.revenue.toLocaleString()}€`}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Analyses détaillées */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="geo">Géographie</TabsTrigger>
          <TabsTrigger value="time">Temporel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des performances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Impressions</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-blue-200 rounded-full h-2">
                        <div className="w-3/4 bg-blue-500 rounded-full h-2"></div>
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Clics</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-green-200 rounded-full h-2">
                        <div className="w-4/5 bg-green-500 rounded-full h-2"></div>
                      </div>
                      <span className="text-sm font-medium">80%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Conversions</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-purple-200 rounded-full h-2">
                        <div className="w-5/6 bg-purple-500 rounded-full h-2"></div>
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Insights IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Performance optimale</p>
                      <p className="text-sm text-blue-700">
                        Les campagnes génèrent 23% plus de conversions le mardi
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded border-l-4 border-green-500">
                    <Users className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">Nouveau segment détecté</p>
                      <p className="text-sm text-green-700">
                        "Clients iPhone premium" : potentiel de +15% de ROI
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Optimisation horaire</p>
                      <p className="text-sm text-yellow-700">
                        Augmenter le budget entre 18h-21h recommandé
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance par segment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.segments.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{segment.name}</h4>
                      <div className="flex gap-6 text-sm text-gray-600 mt-1">
                        <span>{segment.impressions.toLocaleString()} impressions</span>
                        <span>{segment.clicks.toLocaleString()} clics</span>
                        <span>{segment.conversions} conversions</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">CTR</p>
                        <p className="font-medium">{segment.ctr}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Conversion</p>
                        <p className="font-medium">{segment.conversion_rate}%</p>
                      </div>
                      <Badge variant={segment.conversion_rate > 14 ? "default" : "secondary"}>
                        {segment.conversion_rate > 14 ? 'Excellent' : 'Bon'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geo" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Performance géographique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.geoData.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">{location.city}</h4>
                        <p className="text-sm text-gray-600">
                          {location.impressions.toLocaleString()} impressions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Conversions</p>
                        <p className="font-medium">{location.conversions}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Revenus</p>
                        <p className="font-medium">{location.revenue.toLocaleString()}€</p>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 rounded-full h-2"
                          style={{ width: `${(location.revenue / Math.max(...analyticsData.geoData.map(l => l.revenue))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Analyse temporelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.timeData.map((timeSlot, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-16 text-center">
                        <p className="font-medium">{timeSlot.hour}</p>
                      </div>
                      <div>
                        <p className="font-medium">{timeSlot.impressions.toLocaleString()} impressions</p>
                        <p className="text-sm text-gray-600">
                          {timeSlot.clicks} clics • {timeSlot.conversions} conversions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">CTR</p>
                        <p className="font-medium">
                          {((timeSlot.clicks / timeSlot.impressions) * 100).toFixed(2)}%
                        </p>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 rounded-full h-2"
                          style={{ 
                            width: `${(timeSlot.conversions / Math.max(...analyticsData.timeData.map(t => t.conversions))) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;

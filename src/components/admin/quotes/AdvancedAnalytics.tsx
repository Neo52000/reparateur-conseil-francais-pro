import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserCheck, 
  Clock, 
  TrendingUp, 
  Star, 
  AlertTriangle,
  Timer,
  Target,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { format, differenceInHours, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Quote {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  device_brand: string;
  device_model: string;
  repair_type: string;
  issue_description: string;
  status: string;
  created_at: string;
  updated_at: string;
  repairer_id?: string;
  estimated_price?: number;
  client_id?: string;
  repairer_name?: string;
  repairer_business_name?: string;
}

interface RepairerStats {
  repairer_id: string;
  repairer_name: string;
  business_name: string;
  total_quotes: number;
  accepted_quotes: number;
  completed_quotes: number;
  rejected_quotes: number;
  pending_quotes: number;
  conversion_rate: number;
  avg_response_time: number;
  avg_price: number;
  performance_score: number;
}

interface AdvancedAnalyticsProps {
  quotes: Quote[];
  loading: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ quotes, loading }) => {
  const [repairerStats, setRepairerStats] = useState<RepairerStats[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [deviceAnalytics, setDeviceAnalytics] = useState<any[]>([]);
  const [geographicData, setGeographicData] = useState<any[]>([]);
  const [timeAnalytics, setTimeAnalytics] = useState<any[]>([]);

  useEffect(() => {
    if (quotes.length > 0) {
      calculateRepairerStats();
      calculateDeviceAnalytics();
      calculateGeographicAnalytics();
      calculateTimeAnalytics();
    }
  }, [quotes, selectedTimeframe]);

  const calculateRepairerStats = () => {
    const stats = new Map<string, RepairerStats>();
    
    quotes.forEach(quote => {
      if (!quote.repairer_id) return;
      
      const key = quote.repairer_id;
      if (!stats.has(key)) {
        stats.set(key, {
          repairer_id: quote.repairer_id,
          repairer_name: quote.repairer_name || 'Inconnu',
          business_name: quote.repairer_business_name || 'Inconnu',
          total_quotes: 0,
          accepted_quotes: 0,
          completed_quotes: 0,
          rejected_quotes: 0,
          pending_quotes: 0,
          conversion_rate: 0,
          avg_response_time: 0,
          avg_price: 0,
          performance_score: 0
        });
      }
      
      const stat = stats.get(key)!;
      stat.total_quotes++;
      
      switch (quote.status) {
        case 'accepted':
          stat.accepted_quotes++;
          break;
        case 'completed':
          stat.completed_quotes++;
          break;
        case 'rejected':
          stat.rejected_quotes++;
          break;
        case 'pending':
          stat.pending_quotes++;
          break;
      }
    });
    
    // Calculer les métriques dérivées
    stats.forEach(stat => {
      stat.conversion_rate = stat.total_quotes > 0 
        ? ((stat.accepted_quotes + stat.completed_quotes) / stat.total_quotes) * 100 
        : 0;
      
      // Calculer le temps de réponse moyen
      const repairerQuotes = quotes.filter(q => q.repairer_id === stat.repairer_id && q.status !== 'pending');
      if (repairerQuotes.length > 0) {
        const responseTimes = repairerQuotes.map(q => {
          const created = new Date(q.created_at);
          const updated = new Date(q.updated_at);
          return differenceInHours(updated, created);
        });
        stat.avg_response_time = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      }
      
      // Prix moyen
      const quotesWithPrice = quotes.filter(q => q.repairer_id === stat.repairer_id && q.estimated_price);
      if (quotesWithPrice.length > 0) {
        stat.avg_price = quotesWithPrice.reduce((sum, q) => sum + (q.estimated_price || 0), 0) / quotesWithPrice.length;
      }
      
      // Score de performance (combinaison de taux de conversion, temps de réponse, etc.)
      const conversionScore = Math.min(stat.conversion_rate / 80 * 40, 40); // Max 40 points
      const responseScore = Math.max(0, 30 - (stat.avg_response_time / 24) * 30); // Max 30 points
      const volumeScore = Math.min(stat.total_quotes / 10 * 30, 30); // Max 30 points
      stat.performance_score = conversionScore + responseScore + volumeScore;
    });
    
    setRepairerStats(Array.from(stats.values()).sort((a, b) => b.performance_score - a.performance_score));
  };

  const calculateDeviceAnalytics = () => {
    const brandCounts = new Map<string, number>();
    const modelCounts = new Map<string, number>();
    
    quotes.forEach(quote => {
      brandCounts.set(quote.device_brand, (brandCounts.get(quote.device_brand) || 0) + 1);
      const model = `${quote.device_brand} ${quote.device_model}`;
      modelCounts.set(model, (modelCounts.get(model) || 0) + 1);
    });
    
    const brandData = Array.from(brandCounts.entries())
      .map(([brand, count]) => ({ name: brand, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    
    setDeviceAnalytics(brandData);
  };

  const calculateGeographicAnalytics = () => {
    // Simulation de données géographiques (à remplacer par de vraies données)
    const cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier'];
    const geoData = cities.map(city => ({
      city,
      quotes: Math.floor(Math.random() * 50) + 10,
      avg_response_time: Math.floor(Math.random() * 24) + 2
    })).sort((a, b) => b.quotes - a.quotes);
    
    setGeographicData(geoData);
  };

  const calculateTimeAnalytics = () => {
    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);
    
    quotes.forEach(quote => {
      const date = new Date(quote.created_at);
      hourCounts[date.getHours()]++;
      dayCounts[date.getDay()]++;
    });
    
    const timeData = hourCounts.map((count, hour) => ({
      hour: `${hour}h`,
      count
    }));
    
    setTimeAnalytics(timeData);
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-blue-100 text-blue-800">Bon</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Moyen</Badge>;
    return <Badge className="bg-red-100 text-red-800">À améliorer</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtre temporel */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Analyses Avancées</h3>
          <p className="text-sm text-muted-foreground">Insights détaillés sur les performances</p>
        </div>
        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
            <SelectItem value="365">Année complète</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="repairers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="repairers">Suivi Réparateurs</TabsTrigger>
          <TabsTrigger value="devices">Analyse Appareils</TabsTrigger>
          <TabsTrigger value="geography">Géographique</TabsTrigger>
          <TabsTrigger value="temporal">Analyse Temporelle</TabsTrigger>
        </TabsList>

        <TabsContent value="repairers" className="space-y-4">
          {/* Vue d'ensemble des réparateurs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Réparateurs actifs</p>
                    <p className="text-2xl font-bold">{repairerStats.length}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux conversion moyen</p>
                    <p className="text-2xl font-bold">
                      {repairerStats.length > 0 
                        ? (repairerStats.reduce((sum, r) => sum + r.conversion_rate, 0) / repairerStats.length).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Temps réponse moyen</p>
                    <p className="text-2xl font-bold">
                      {repairerStats.length > 0 
                        ? (repairerStats.reduce((sum, r) => sum + r.avg_response_time, 0) / repairerStats.length).toFixed(1)
                        : 0}h
                    </p>
                  </div>
                  <Timer className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Score performance moyen</p>
                    <p className="text-2xl font-bold">
                      {repairerStats.length > 0 
                        ? (repairerStats.reduce((sum, r) => sum + r.performance_score, 0) / repairerStats.length).toFixed(0)
                        : 0}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau détaillé des réparateurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance par Réparateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repairerStats.map((repairer, index) => (
                  <div key={repairer.repairer_id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{repairer.business_name}</h4>
                          {getPerformanceBadge(repairer.performance_score)}
                          {index < 3 && <Badge variant="outline">Top {index + 1}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{repairer.repairer_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{repairer.performance_score.toFixed(0)}/100</p>
                        <p className="text-xs text-muted-foreground">Score Performance</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total devis</p>
                        <p className="font-medium">{repairer.total_quotes}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Taux conversion</p>
                        <p className="font-medium text-green-600">{repairer.conversion_rate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Temps réponse</p>
                        <p className="font-medium">{repairer.avg_response_time.toFixed(1)}h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Prix moyen</p>
                        <p className="font-medium">{repairer.avg_price.toFixed(0)}€</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">En attente</p>
                        <p className="font-medium text-yellow-600">{repairer.pending_quotes}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Terminés</p>
                        <p className="font-medium text-blue-600">{repairer.completed_quotes}</p>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Répartition des statuts</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full flex">
                          <div 
                            className="bg-green-500"
                            style={{ width: `${(repairer.completed_quotes / repairer.total_quotes) * 100}%` }}
                          />
                          <div 
                            className="bg-blue-500"
                            style={{ width: `${(repairer.accepted_quotes / repairer.total_quotes) * 100}%` }}
                          />
                          <div 
                            className="bg-yellow-500"
                            style={{ width: `${(repairer.pending_quotes / repairer.total_quotes) * 100}%` }}
                          />
                          <div 
                            className="bg-red-500"
                            style={{ width: `${(repairer.rejected_quotes / repairer.total_quotes) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Marque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceAnalytics}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceAnalytics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Marques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deviceAnalytics.map((device, index) => (
                    <div key={device.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{device.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{device.value}</span>
                        <span className="text-sm text-muted-foreground ml-1">devis</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Analyse Géographique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Volume par Ville</h4>
                  <div className="space-y-2">
                    {geographicData.map((city, index) => (
                      <div key={city.city} className="flex items-center justify-between p-2 border rounded">
                        <span>{city.city}</span>
                        <div className="text-right">
                          <span className="font-bold">{city.quotes}</span>
                          <span className="text-xs text-muted-foreground block">
                            {city.avg_response_time}h réponse
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={geographicData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="city" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="quotes" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temporal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Analyse Temporelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Insights Temporels</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pic d'activité</p>
                    <p className="font-medium">
                      {timeAnalytics.reduce((max, curr) => 
                        curr.count > max.count ? curr : max, 
                        timeAnalytics[0] || { hour: 'N/A', count: 0 }
                      ).hour}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Période calme</p>
                    <p className="font-medium">
                      {timeAnalytics.reduce((min, curr) => 
                        curr.count < min.count ? curr : min, 
                        timeAnalytics[0] || { hour: 'N/A', count: 0 }
                      ).hour}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Moyenne horaire</p>
                    <p className="font-medium">
                      {timeAnalytics.length > 0 
                        ? (timeAnalytics.reduce((sum, t) => sum + t.count, 0) / timeAnalytics.length).toFixed(1)
                        : 0} devis/h
                    </p>
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
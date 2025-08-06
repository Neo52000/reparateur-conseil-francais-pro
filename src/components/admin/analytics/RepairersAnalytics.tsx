import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  MapPin, 
  Users, 
  Clock, 
  TrendingUp,
  Phone,
  Mail,
  Star,
  Activity,
  DollarSign
} from 'lucide-react';

interface RepairerStats {
  id: string;
  name: string;
  city: string;
  total_requests: number;
  completed_requests: number;
  pending_requests: number;
  average_rating: number;
  total_revenue: number;
  response_time_hours: number;
  phone: string;
  email: string;
  created_at: string;
}

interface LocationStats {
  city: string;
  count: number;
  percentage: number;
}

export const RepairersAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [repairersStats, setRepairersStats] = useState<RepairerStats[]>([]);
  const [locationStats, setLocationStats] = useState<LocationStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeFilter]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Charger les statistiques des réparateurs
      const { data: repairers, error: repairersError } = await supabase
        .from('repairers')
        .select(`
          id,
          name,
          city,
          phone,
          email,
          created_at,
          rating
        `)
        .limit(50);

      if (repairersError) throw repairersError;

      // Simuler des statistiques pour chaque réparateur
      const repairersWithStats: RepairerStats[] = (repairers || []).map(repairer => ({
        ...repairer,
        total_requests: Math.floor(Math.random() * 100) + 10,
        completed_requests: Math.floor(Math.random() * 80) + 5,
        pending_requests: Math.floor(Math.random() * 15) + 1,
        average_rating: repairer.rating || Math.round((Math.random() * 2 + 3) * 10) / 10,
        total_revenue: Math.floor(Math.random() * 5000) + 500,
        response_time_hours: Math.floor(Math.random() * 24) + 1
      }));

      setRepairersStats(repairersWithStats);

      // Calculer les statistiques par localisation
      const cityGroups = repairersWithStats.reduce((acc, repairer) => {
        const city = repairer.city || 'Non spécifié';
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalRepairers = repairersWithStats.length;
      const locationStatsData: LocationStats[] = Object.entries(cityGroups)
        .map(([city, count]) => ({
          city,
          count,
          percentage: Math.round((count / totalRepairers) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setLocationStats(locationStatsData);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStats = repairersStats.reduce(
    (acc, repairer) => ({
      totalRepairers: acc.totalRepairers + 1,
      totalRequests: acc.totalRequests + repairer.total_requests,
      totalRevenue: acc.totalRevenue + repairer.total_revenue,
      avgRating: acc.avgRating + repairer.average_rating
    }),
    { totalRepairers: 0, totalRequests: 0, totalRevenue: 0, avgRating: 0 }
  );

  if (repairersStats.length > 0) {
    totalStats.avgRating = totalStats.avgRating / repairersStats.length;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Réparateurs</h2>
          <p className="text-muted-foreground">
            Statistiques détaillées des réparateurs et leurs performances
          </p>
        </div>

        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
            <SelectItem value="90d">90 derniers jours</SelectItem>
            <SelectItem value="1y">1 an</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Réparateurs</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.totalRepairers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Demandes Totales</p>
                <p className="text-2xl font-bold text-foreground">{totalStats.totalRequests}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'Affaires</p>
                <p className="text-2xl font-bold text-foreground">€{totalStats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Note Moyenne</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold text-foreground">
                    {totalStats.avgRating.toFixed(1)}
                  </p>
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="performance">Performances</TabsTrigger>
          <TabsTrigger value="locations">Localisations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Top réparateurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Réparateurs par Demandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repairersStats
                  .sort((a, b) => b.total_requests - a.total_requests)
                  .slice(0, 10)
                  .map((repairer) => (
                    <div key={repairer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-medium text-foreground">{repairer.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {repairer.city}
                              </div>
                              {repairer.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {repairer.phone}
                                </div>
                              )}
                              {repairer.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {repairer.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Demandes</p>
                          <p className="font-semibold">{repairer.total_requests}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Complétées</p>
                          <p className="font-semibold text-green-600">{repairer.completed_requests}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Note</p>
                          <div className="flex items-center gap-1">
                            <p className="font-semibold">{repairer.average_rating}</p>
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          </div>
                        </div>
                        <Badge variant={repairer.pending_requests > 5 ? "destructive" : "secondary"}>
                          {repairer.pending_requests} en attente
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performances par Réparateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repairersStats
                  .sort((a, b) => b.total_revenue - a.total_revenue)
                  .slice(0, 15)
                  .map((repairer) => (
                    <div key={repairer.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                      <div className="col-span-2">
                        <h3 className="font-medium text-foreground">{repairer.name}</h3>
                        <p className="text-sm text-muted-foreground">{repairer.city}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Chiffre d'Affaires</p>
                        <p className="font-semibold text-green-600">€{repairer.total_revenue}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Taux de Réussite</p>
                        <p className="font-semibold">
                          {Math.round((repairer.completed_requests / repairer.total_requests) * 100)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Temps de Réponse</p>
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" />
                          <p className="font-semibold">{repairer.response_time_hours}h</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Note Client</p>
                        <div className="flex items-center justify-center gap-1">
                          <p className="font-semibold">{repairer.average_rating}</p>
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Répartition Géographique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationStats.map((location) => (
                  <div key={location.city} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-foreground">{location.city}</h3>
                      <p className="text-sm text-muted-foreground">
                        {location.count} réparateur{location.count > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${location.percentage}%` }}
                        />
                      </div>
                      <Badge variant="secondary">{location.percentage}%</Badge>
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
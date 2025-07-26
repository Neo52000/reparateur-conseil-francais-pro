/**
 * Dashboard Analytics pour les réparateurs
 * Affiche les statistiques par réparateur : demandes, localisations, performances
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  MapPin, 
  User, 
  TrendingUp,
  Clock,
  Star,
  Phone,
  Search,
  Download,
  Filter
} from 'lucide-react';
import { useRepairersAnalytics } from '@/hooks/analytics/useRepairersAnalytics';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export const RepairerAnalyticsDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [sortBy, setSortBy] = useState('requests_count');
  
  const { repairers, stats, loading, cities } = useRepairersAnalytics();

  // Filtrage et tri des réparateurs
  const filteredRepairers = useMemo(() => {
    return repairers
      .filter(repairer => {
        const matchesSearch = repairer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            repairer.city?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCity = selectedCity === 'all' || repairer.city === selectedCity;
        return matchesSearch && matchesCity;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'requests_count':
            return (b.requests_count || 0) - (a.requests_count || 0);
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'name':
            return (a.name || '').localeCompare(b.name || '');
          default:
            return 0;
        }
      });
  }, [repairers, searchTerm, selectedCity, sortBy]);

  // Données pour les graphiques globaux
  const cityStats = useMemo(() => {
    const cityMap = new Map();
    repairers.forEach(repairer => {
      const city = repairer.city || 'Non spécifié';
      const current = cityMap.get(city) || { city, count: 0, requests: 0 };
      cityMap.set(city, {
        ...current,
        count: current.count + 1,
        requests: current.requests + (repairer.requests_count || 0)
      });
    });
    return Array.from(cityMap.values()).sort((a, b) => b.count - a.count);
  }, [repairers]);

  const monthlyRequests = useMemo(() => {
    // Simulation de données mensuelles - à remplacer par de vraies données
    return [
      { month: 'Jan', requests: 245 },
      { month: 'Fév', requests: 312 },
      { month: 'Mar', requests: 289 },
      { month: 'Avr', requests: 434 },
      { month: 'Mai', requests: 378 },
      { month: 'Jun', requests: 456 }
    ];
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Réparateurs</h2>
          <p className="text-muted-foreground">
            Suivi des performances et statistiques par réparateur
          </p>
        </div>
        
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Métriques globales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Réparateurs</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRepairers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newThisMonth} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgRequestsPerRepairer.toFixed(1)} par réparateur
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Sur {stats.totalRatings} avis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Villes Couvertes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.citiesCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.departmentsCount} départements
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="locations">Localisations</TabsTrigger>
          <TabsTrigger value="detailed">Détail par réparateur</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Évolution des demandes */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des Demandes</CardTitle>
                <CardDescription>
                  Demandes reçues par mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyRequests}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="requests" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top villes */}
            <Card>
              <CardHeader>
                <CardTitle>Top Villes</CardTitle>
                <CardDescription>
                  Répartition des réparateurs par ville
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cityStats.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Réparateurs" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition Géographique</CardTitle>
              <CardDescription>
                Distribution des réparateurs par localisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={cityStats.slice(0, 10)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ city, percent }) => `${city} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {cityStats.slice(0, 10).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Statistiques par ville</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {cityStats.map((city, index) => (
                      <div key={city.city} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{city.city}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{city.count} réparateurs</div>
                          <div className="text-sm text-muted-foreground">{city.requests} demandes</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres et recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <Input
                    placeholder="Rechercher par nom ou ville..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Toutes les villes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Trier par..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requests_count">Nombre de demandes</SelectItem>
                    <SelectItem value="rating">Note moyenne</SelectItem>
                    <SelectItem value="name">Nom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste détaillée des réparateurs */}
          <Card>
            <CardHeader>
              <CardTitle>Réparateurs ({filteredRepairers.length})</CardTitle>
              <CardDescription>
                Liste détaillée avec statistiques individuelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRepairers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun réparateur trouvé avec ces critères
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Réparateur</th>
                          <th className="text-left p-2">Localisation</th>
                          <th className="text-right p-2">Demandes</th>
                          <th className="text-right p-2">Note</th>
                          <th className="text-left p-2">Contact</th>
                          <th className="text-left p-2">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRepairers.map((repairer) => (
                          <tr key={repairer.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">
                              <div>
                                <div className="font-medium">{repairer.name}</div>
                                {repairer.description && (
                                  <div className="text-xs text-muted-foreground line-clamp-1">
                                    {repairer.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{repairer.city}</span>
                              </div>
                              {repairer.postal_code && (
                                <div className="text-xs text-muted-foreground">
                                  {repairer.postal_code}
                                </div>
                              )}
                            </td>
                            <td className="p-2 text-right">
                              <div className="font-semibold">{repairer.requests_count || 0}</div>
                            </td>
                            <td className="p-2 text-right">
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{repairer.rating?.toFixed(1) || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="p-2">
                              {repairer.phone && (
                                <div className="flex items-center space-x-1 text-xs">
                                  <Phone className="h-3 w-3" />
                                  <span>{repairer.phone}</span>
                                </div>
                              )}
                            </td>
                            <td className="p-2">
                              <Badge variant={repairer.is_verified ? 'default' : 'secondary'}>
                                {repairer.is_verified ? 'Vérifié' : 'Non vérifié'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
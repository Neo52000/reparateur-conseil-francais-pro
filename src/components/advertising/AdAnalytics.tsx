
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { AdBanner, AdCampaignStats } from '@/types/advertising';
import { Eye, MousePointer, TrendingUp, Euro } from 'lucide-react';

const AdAnalytics: React.FC = () => {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [selectedBanner, setSelectedBanner] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [stats, setStats] = useState<AdCampaignStats[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les bannières
  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Caster le type pour correspondre à notre interface
      const typedBanners = (data || []).map(banner => ({
        ...banner,
        target_type: banner.target_type as 'client' | 'repairer'
      })) as AdBanner[];
      
      setBanners(typedBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  // Charger les statistiques
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Calculer la date de début selon la période sélectionnée
      const now = new Date();
      const startDate = new Date();
      switch (dateRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }

      // Requête pour les impressions
      let impressionsQuery = supabase
        .from('ad_impressions')
        .select('banner_id, created_at')
        .gte('created_at', startDate.toISOString());

      if (selectedBanner !== 'all') {
        impressionsQuery = impressionsQuery.eq('banner_id', selectedBanner);
      }

      const { data: impressions, error: impressionsError } = await impressionsQuery;
      if (impressionsError) throw impressionsError;

      // Requête pour les clics
      let clicksQuery = supabase
        .from('ad_clicks')
        .select('banner_id, created_at')
        .gte('created_at', startDate.toISOString());

      if (selectedBanner !== 'all') {
        clicksQuery = clicksQuery.eq('banner_id', selectedBanner);
      }

      const { data: clicks, error: clicksError } = await clicksQuery;
      if (clicksError) throw clicksError;

      // Calculer les statistiques par bannière
      const statsMap = new Map<string, AdCampaignStats>();
      
      // Initialiser avec les bannières
      banners.forEach(banner => {
        if (selectedBanner === 'all' || selectedBanner === banner.id) {
          statsMap.set(banner.id, {
            banner_id: banner.id,
            impressions: 0,
            clicks: 0,
            ctr: 0,
            cost: 0,
            conversions: 0
          });
        }
      });

      // Compter les impressions
      impressions?.forEach(impression => {
        const stat = statsMap.get(impression.banner_id);
        if (stat) {
          stat.impressions++;
        }
      });

      // Compter les clics
      clicks?.forEach(click => {
        const stat = statsMap.get(click.banner_id);
        if (stat) {
          stat.clicks++;
        }
      });

      // Calculer le CTR
      statsMap.forEach(stat => {
        stat.ctr = stat.impressions > 0 ? (stat.clicks / stat.impressions) * 100 : 0;
      });

      setStats(Array.from(statsMap.values()));

      // Calculer les statistiques quotidiennes
      const dailyStatsMap = new Map<string, { date: string; impressions: number; clicks: number }>();
      
      // Initialiser tous les jours de la période
      for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dailyStatsMap.set(dateStr, {
          date: dateStr,
          impressions: 0,
          clicks: 0
        });
      }

      // Compter les impressions par jour
      impressions?.forEach(impression => {
        const date = impression.created_at.split('T')[0];
        const stat = dailyStatsMap.get(date);
        if (stat) {
          stat.impressions++;
        }
      });

      // Compter les clics par jour
      clicks?.forEach(click => {
        const date = click.created_at.split('T')[0];
        const stat = dailyStatsMap.get(date);
        if (stat) {
          stat.clicks++;
        }
      });

      setDailyStats(Array.from(dailyStatsMap.values()).sort((a, b) => a.date.localeCompare(b.date)));

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 0) {
      fetchStats();
    }
  }, [banners, selectedBanner, dateRange]);

  // Calculer les totaux
  const totalImpressions = stats.reduce((sum, stat) => sum + stat.impressions, 0);
  const totalClicks = stats.reduce((sum, stat) => sum + stat.clicks, 0);
  const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics publicitaires</h2>
          <p className="text-gray-600">Performances de vos campagnes publicitaires</p>
        </div>
        <div className="flex space-x-4">
          <Select value={selectedBanner} onValueChange={setSelectedBanner}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les bannières</SelectItem>
              {banners.map(banner => (
                <SelectItem key={banner.id} value={banner.id}>
                  {banner.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Impressions</p>
                <p className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MousePointer className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clics</p>
                <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CTR moyen</p>
                <p className="text-2xl font-bold text-gray-900">{overallCTR.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Euro className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Coût estimé</p>
                <p className="text-2xl font-bold text-gray-900">€0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique des performances quotidiennes */}
      <Card>
        <CardHeader>
          <CardTitle>Performances quotidiennes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="impressions" stroke="#3b82f6" name="Impressions" />
              <Line type="monotone" dataKey="clicks" stroke="#10b981" name="Clics" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tableau des performances par bannière */}
      <Card>
        <CardHeader>
          <CardTitle>Performances par bannière</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.map(stat => {
              const banner = banners.find(b => b.id === stat.banner_id);
              if (!banner) return null;

              return (
                <div key={stat.banner_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-16 h-10 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <div>
                      <h3 className="font-medium">{banner.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                          {banner.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Badge variant="outline">
                          {banner.target_type === 'client' ? 'Clients' : 'Réparateurs'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Impressions</p>
                        <p className="font-medium">{stat.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Clics</p>
                        <p className="font-medium">{stat.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">CTR</p>
                        <p className="font-medium">{stat.ctr.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {stats.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Aucune donnée disponible pour la période sélectionnée.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdAnalytics;

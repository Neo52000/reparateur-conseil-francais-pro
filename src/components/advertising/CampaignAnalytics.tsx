
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { AdCampaign } from '@/types/advertising';
import { Eye, MousePointer, TrendingUp, Euro, Target, Users } from 'lucide-react';

interface CampaignPerformance {
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  ctr: number;
  cpc: number;
  roi: number;
  budget_used: number;
  budget_total: number;
}

const CampaignAnalytics: React.FC = () => {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [performance, setPerformance] = useState<CampaignPerformance[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [targetingBreakdown, setTargetingBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Charger les campagnes
  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  // Charger les statistiques
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
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

      // Récupérer les impressions avec les campagnes associées
      const { data: impressionsData, error: impressionsError } = await supabase
        .from('ad_impressions')
        .select(`
          *,
          ad_banners!inner(
            id,
            title,
            campaign_id
          )
        `)
        .gte('created_at', startDate.toISOString());

      if (impressionsError) throw impressionsError;

      // Récupérer les clics avec les campagnes associées
      const { data: clicksData, error: clicksError } = await supabase
        .from('ad_clicks')
        .select(`
          *,
          ad_banners!inner(
            id,
            title,
            campaign_id
          )
        `)
        .gte('created_at', startDate.toISOString());

      if (clicksError) throw clicksError;

      // Calculer les performances par campagne
      const campaignStats = new Map<string, CampaignPerformance>();
      
      // Initialiser les stats pour chaque campagne
      campaigns.forEach(campaign => {
        if (selectedCampaign === 'all' || selectedCampaign === campaign.id) {
          campaignStats.set(campaign.id, {
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            cost: 0,
            ctr: 0,
            cpc: 0,
            roi: 0,
            budget_used: campaign.budget_spent,
            budget_total: campaign.budget_total
          });
        }
      });

      // Compter les impressions par campagne
      impressionsData?.forEach((impression: any) => {
        const campaignId = impression.ad_banners?.campaign_id;
        if (campaignId && campaignStats.has(campaignId)) {
          const stats = campaignStats.get(campaignId)!;
          stats.impressions++;
        }
      });

      // Compter les clics par campagne
      clicksData?.forEach((click: any) => {
        const campaignId = click.ad_banners?.campaign_id;
        if (campaignId && campaignStats.has(campaignId)) {
          const stats = campaignStats.get(campaignId)!;
          stats.clicks++;
        }
      });

      // Calculer les métriques dérivées
      campaignStats.forEach(stats => {
        stats.ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;
        stats.cpc = stats.clicks > 0 ? stats.cost / stats.clicks : 0;
        stats.roi = stats.cost > 0 ? ((stats.conversions * 100 - stats.cost) / stats.cost) * 100 : 0;
      });

      setPerformance(Array.from(campaignStats.values()));

      // Calculer les stats quotidiennes
      const dailyStatsMap = new Map<string, { date: string; impressions: number; clicks: number; cost: number }>();
      
      for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dailyStatsMap.set(dateStr, {
          date: dateStr,
          impressions: 0,
          clicks: 0,
          cost: 0
        });
      }

      // Remplir les stats quotidiennes
      impressionsData?.forEach((impression: any) => {
        const date = impression.created_at.split('T')[0];
        const stat = dailyStatsMap.get(date);
        if (stat) {
          stat.impressions++;
        }
      });

      clicksData?.forEach((click: any) => {
        const date = click.created_at.split('T')[0];
        const stat = dailyStatsMap.get(date);
        if (stat) {
          stat.clicks++;
          stat.cost += 0.1; // Coût simulé par clic
        }
      });

      setDailyStats(Array.from(dailyStatsMap.values()).sort((a, b) => a.date.localeCompare(b.date)));

      // Analyse du ciblage
      const targetingStats = new Map<string, number>();
      campaigns.forEach(campaign => {
        const targeting = campaign.targeting_config as any;
        if (targeting.user_types) {
          targeting.user_types.forEach((type: string) => {
            targetingStats.set(type, (targetingStats.get(type) || 0) + 1);
          });
        }
      });

      setTargetingBreakdown(
        Array.from(targetingStats.entries()).map(([name, value]) => ({ name, value }))
      );

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (campaigns.length > 0) {
      fetchAnalytics();
    }
  }, [campaigns, selectedCampaign, dateRange]);

  // Calculer les totaux
  const totalImpressions = performance.reduce((sum, p) => sum + p.impressions, 0);
  const totalClicks = performance.reduce((sum, p) => sum + p.clicks, 0);
  const totalCost = performance.reduce((sum, p) => sum + p.cost, 0);
  const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const averageCPC = totalClicks > 0 ? totalCost / totalClicks : 0;

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des analytics des campagnes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics des campagnes</h2>
          <p className="text-gray-600">Performances détaillées de vos campagnes publicitaires</p>
        </div>
        <div className="flex space-x-4">
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les campagnes</SelectItem>
              {campaigns.map(campaign => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Impressions</p>
                <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
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
                <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CTR</p>
                <p className="text-2xl font-bold">{overallCTR.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Euro className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Coût total</p>
                <p className="text-2xl font-bold">{totalCost.toFixed(2)}€</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CPC moyen</p>
                <p className="text-2xl font-bold">{averageCPC.toFixed(3)}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performances quotidiennes */}
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

        {/* Répartition du ciblage */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition du ciblage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={targetingBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {targetingBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performances par campagne */}
      <Card>
        <CardHeader>
          <CardTitle>Performances par campagne</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="campaign_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="impressions" fill="#3b82f6" name="Impressions" />
              <Bar dataKey="clicks" fill="#10b981" name="Clics" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tableau détaillé */}
      <Card>
        <CardHeader>
          <CardTitle>Détails des campagnes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performance.map(perf => (
              <div key={perf.campaign_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{perf.campaign_name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">
                      Budget: {perf.budget_used}€ / {perf.budget_total}€
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Impressions</p>
                      <p className="font-medium">{perf.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Clics</p>
                      <p className="font-medium">{perf.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">CTR</p>
                      <p className="font-medium">{perf.ctr.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Coût</p>
                      <p className="font-medium">{perf.cost.toFixed(2)}€</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {performance.length === 0 && (
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

export default CampaignAnalytics;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
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

  // Données mock pour la démo
  const mockCampaigns: AdCampaign[] = [
    {
      id: '1',
      name: 'Campagne Réparateurs Premium',
      description: 'Ciblage des réparateurs avec abonnement premium',
      budget_total: 1000,
      budget_daily: 50,
      budget_spent: 250,
      start_date: new Date().toISOString(),
      status: 'active',
      targeting_config: {
        user_types: ['repairer'],
        subscription_tiers: ['premium'],
        global: false
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  const mockPerformance: CampaignPerformance[] = [
    {
      campaign_id: '1',
      campaign_name: 'Campagne Réparateurs Premium',
      impressions: 5420,
      clicks: 234,
      conversions: 12,
      cost: 125.50,
      ctr: 4.32,
      cpc: 0.54,
      roi: 15.2,
      budget_used: 250,
      budget_total: 1000
    }
  ];

  const mockDailyStats = [
    { date: '2024-01-01', impressions: 120, clicks: 8, cost: 4.32 },
    { date: '2024-01-02', impressions: 150, clicks: 12, cost: 6.48 },
    { date: '2024-01-03', impressions: 180, clicks: 15, cost: 8.10 },
    { date: '2024-01-04', impressions: 160, clicks: 11, cost: 5.94 },
    { date: '2024-01-05', impressions: 200, clicks: 18, cost: 9.72 },
    { date: '2024-01-06', impressions: 140, clicks: 9, cost: 4.86 },
    { date: '2024-01-07', impressions: 190, clicks: 16, cost: 8.64 }
  ];

  const mockTargetingBreakdown = [
    { name: 'Réparateurs', value: 65 },
    { name: 'Clients', value: 35 }
  ];

  // Charger les campagnes (mock pour l'instant)
  const fetchCampaigns = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  // Charger les statistiques (mock pour l'instant)
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPerformance(mockPerformance);
      setDailyStats(mockDailyStats);
      setTargetingBreakdown(mockTargetingBreakdown);

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

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

interface RepairersAnalyticsProps {
  repairers: any[];
  subscriptions: any[];
}

const RepairersAnalytics: React.FC<RepairersAnalyticsProps> = ({ repairers, subscriptions }) => {
  const [timeRange, setTimeRange] = useState('30');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [loading, setLoading] = useState(false);

  // Données pour graphiques
  const registrationsByMonth = React.useMemo(() => {
    const monthsData: Record<string, number> = {};
    const now = new Date();
    
    // Créer les 12 derniers mois
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const key = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      monthsData[key] = 0;
    }

    // Compter les inscriptions par mois
    repairers.forEach(repairer => {
      const date = new Date(repairer.created_at);
      const key = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      if (monthsData.hasOwnProperty(key)) {
        monthsData[key]++;
      }
    });

    return Object.entries(monthsData).map(([month, count]) => ({
      month,
      inscriptions: count,
      actifs: Math.floor(count * 0.7) // Simulation
    }));
  }, [repairers]);

  const subscriptionsByTier = React.useMemo(() => {
    const tierCount = subscriptions.reduce((acc, sub) => {
      const tier = sub.subscription_tier || 'free';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      free: '#94a3b8',
      basic: '#3b82f6', 
      premium: '#8b5cf6',
      enterprise: '#f59e0b'
    };

    return Object.entries(tierCount).map(([tier, count]) => ({
      name: tier.charAt(0).toUpperCase() + tier.slice(1),
      value: count,
      color: colors[tier as keyof typeof colors] || '#6b7280'
    }));
  }, [subscriptions]);

  const performanceData = React.useMemo(() => {
    return repairers
      .map(repairer => ({
        name: repairer.name.length > 15 ? repairer.name.substring(0, 15) + '...' : repairer.name,
        reparations: repairer.total_repairs || 0,
        note: repairer.rating || 0,
        city: repairer.city
      }))
      .sort((a, b) => b.reparations - a.reparations)
      .slice(0, 10);
  }, [repairers]);

  const cityDistribution = React.useMemo(() => {
    const cityCount = repairers.reduce((acc, repairer) => {
      const city = repairer.city || 'Non spécifié';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cityCount)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 8)
      .map(([city, count]) => ({
        ville: city.length > 12 ? city.substring(0, 12) + '...' : city,
        reparateurs: count as number
      }));
  }, [repairers]);

  const exportData = () => {
    setLoading(true);
    const data = {
      summary: {
        totalRepairers: repairers.length,
        activeSubscriptions: subscriptions.filter(s => s.subscribed).length,
        averageRating: repairers.reduce((sum, r) => sum + (r.rating || 0), 0) / repairers.length
      },
      repairers: repairers.map(r => ({
        name: r.name,
        email: r.email,
        city: r.city,
        rating: r.rating,
        totalRepairs: r.total_repairs,
        subscribed: r.subscribed
      })),
      analytics: {
        registrationsByMonth,
        subscriptionsByTier,
        cityDistribution
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repairers-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Avancées
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="90">90 jours</SelectItem>
                  <SelectItem value="365">1 an</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportData}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Graphiques en grille */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inscriptions par mois */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inscriptions par Mois</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={registrationsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="inscriptions" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="actifs" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition abonnements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répartition Abonnements</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriptionsByTier}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionsByTier.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance par réparateur */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Réparateurs (Réparations)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="reparations" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution géographique */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répartition Géographique</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ville" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reparateurs" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights détaillés */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Détaillés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Taux de croissance */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Croissance</span>
              </div>
            <div className="text-2xl font-bold text-blue-900">
              +{repairers.length > 0 ? Math.round((repairers.length / 12) * 100) / 100 : 0}
            </div>
              <p className="text-sm text-blue-700">réparateurs/mois</p>
            </div>

            {/* Engagement */}
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Engagement</span>
              </div>
            <div className="text-2xl font-bold text-green-900">
              {repairers.length > 0 
                ? Math.round((subscriptions.filter(s => s.subscribed).length / repairers.length) * 100)
                : 0}%
            </div>
              <p className="text-sm text-green-700">taux d'abonnement</p>
            </div>

            {/* Ville principale */}
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-900">Ville Top</span>
              </div>
              <div className="text-lg font-bold text-purple-900">
                {cityDistribution[0]?.ville || 'N/A'}
              </div>
              <p className="text-sm text-purple-700">
                {cityDistribution[0]?.reparateurs || 0} réparateurs
              </p>
            </div>

            {/* Note moyenne */}
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-900">Qualité</span>
              </div>
            <div className="text-2xl font-bold text-yellow-900">
              {repairers.length > 0 
                ? (repairers.reduce((sum, r) => sum + (r.rating || 0), 0) / repairers.length).toFixed(1)
                : '0.0'}/5
            </div>
              <p className="text-sm text-yellow-700">note moyenne</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairersAnalytics;
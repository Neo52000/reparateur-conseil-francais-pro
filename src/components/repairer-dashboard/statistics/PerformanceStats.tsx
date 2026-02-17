
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Clock, Star, Euro, Wrench, Calendar, Eye, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useRepairerAnalytics } from '@/hooks/useRepairerAnalytics';

interface PerformanceData {
  totalRepairs: number;
  monthlyRevenue: number;
  averageRating: number;
  completionTime: number;
  clientSatisfaction: number;
  repeatClients: number;
}

interface ChartData {
  name: string;
  value: number;
  revenue?: number;
  repairs?: number;
}

const PerformanceStats: React.FC = () => {
  const { profile } = useAuth();
  const { data: analyticsData } = useRepairerAnalytics();
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    totalRepairs: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    completionTime: 0,
    clientSatisfaction: 0,
    repeatClients: 0,
  });

  const [chartData, setChartData] = useState<{
    monthly: ChartData[];
    deviceTypes: ChartData[];
    repairTypes: ChartData[];
  }>({
    monthly: [],
    deviceTypes: [],
    repairTypes: [],
  });

  useEffect(() => {
    if (profile?.id) {
      loadPerformanceData();
    }
  }, [profile?.id]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Charger les données de performance réelles
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes_with_timeline')
        .select('*')
        .eq('repairer_id', profile?.id)
        .in('status', ['completed', 'accepted']);

      if (quotesError) throw quotesError;

      // Charger les avis clients
      const { data: reviews, error: reviewsError } = await supabase
        .from('client_reviews')
        .select('overall_rating')
        .eq('repairer_id', profile?.id)
        .eq('status', 'approved');

      if (reviewsError) throw reviewsError;

      // Calculer les statistiques
      const totalRepairs = quotes?.length || 0;
      const monthlyRevenue = quotes?.reduce((sum, quote) => sum + (quote.estimated_price || 0), 0) || 0;
      const averageRating = reviews && reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.overall_rating, 0) / reviews.length 
        : 0;

      // Données mockées pour la démo (à remplacer par des calculs réels)
      setPerformanceData({
        totalRepairs,
        monthlyRevenue,
        averageRating,
        completionTime: 2.5, // jours
        clientSatisfaction: 96, // %
        repeatClients: 35, // %
      });

      // Données pour les graphiques (mockées pour la démo)
      setChartData({
        monthly: [
          { name: 'Jan', value: 2500, repairs: 15 },
          { name: 'Fév', value: 3200, repairs: 18 },
          { name: 'Mar', value: 2800, repairs: 16 },
          { name: 'Avr', value: 3800, repairs: 22 },
          { name: 'Mai', value: 4200, repairs: 25 },
          { name: 'Jun', value: 3600, repairs: 20 },
        ],
        deviceTypes: [
          { name: 'iPhone', value: 45 },
          { name: 'Samsung', value: 30 },
          { name: 'Xiaomi', value: 15 },
          { name: 'Autres', value: 10 },
        ],
        repairTypes: [
          { name: 'Écran', value: 40 },
          { name: 'Batterie', value: 25 },
          { name: 'Connecteur', value: 20 },
          { name: 'Caméra', value: 15 },
        ],
      });

    } catch (error) {
      console.error('Erreur chargement données performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, unit, icon: Icon, trend, trendValue }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {value}{unit}
            </p>
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {trendValue}%
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 text-blue-600" />
        </div>
      </CardContent>
    </Card>
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics réelles (30 derniers jours) */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Vues du profil" value={analyticsData.profileViews} unit="" icon={Eye} trend="up" trendValue={0} />
          <StatCard title="Demandes de devis" value={analyticsData.quoteRequests} unit="" icon={MessageSquare} trend="up" trendValue={0} />
          <StatCard title="Clics contact" value={analyticsData.contactClicks} unit="" icon={Users} trend="up" trendValue={0} />
          <StatCard title="Taux de conversion" value={analyticsData.conversionRate} unit="%" icon={TrendingUp} trend={analyticsData.conversionRate > 5 ? 'up' : 'down'} trendValue={analyticsData.conversionRate} />
        </div>
      )}

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Réparations totales"
          value={performanceData.totalRepairs}
          unit=""
          icon={Wrench}
          trend="up"
          trendValue={12}
        />
        <StatCard
          title="CA mensuel"
          value={performanceData.monthlyRevenue.toLocaleString()}
          unit="€"
          icon={Euro}
          trend="up"
          trendValue={8}
        />
        <StatCard
          title="Note moyenne"
          value={performanceData.averageRating.toFixed(1)}
          unit="/5"
          icon={Star}
          trend="up"
          trendValue={3}
        />
        <StatCard
          title="Temps moyen"
          value={performanceData.completionTime}
          unit="j"
          icon={Clock}
          trend="down"
          trendValue={5}
        />
        <StatCard
          title="Satisfaction"
          value={performanceData.clientSatisfaction}
          unit="%"
          icon={Users}
          trend="up"
          trendValue={2}
        />
        <StatCard
          title="Clients fidèles"
          value={performanceData.repeatClients}
          unit="%"
          icon={Calendar}
          trend="up"
          trendValue={7}
        />
      </div>

      {/* Graphiques détaillés */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="devices">Appareils</TabsTrigger>
          <TabsTrigger value="repairs">Réparations</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution mensuelle du chiffre d'affaires</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}€`, 'Revenus']} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par type d'appareil</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.deviceTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.deviceTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repairs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Types de réparations les plus fréquents</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.repairTypes} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value) => [`${value}%`, 'Pourcentage']} />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceStats;

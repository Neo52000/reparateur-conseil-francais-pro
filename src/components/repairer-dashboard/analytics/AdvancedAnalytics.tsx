
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Star, Clock, Euro, Users, Award } from 'lucide-react';

interface AdvancedAnalyticsProps {}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = () => {
  // Données de démonstration enrichies
  const revenueData = [
    { month: 'Jan', revenue: 2800, repairs: 45 },
    { month: 'Fév', revenue: 3200, repairs: 52 },
    { month: 'Mar', revenue: 3800, repairs: 61 },
    { month: 'Avr', revenue: 4200, repairs: 68 },
    { month: 'Mai', revenue: 3900, repairs: 64 },
    { month: 'Jun', revenue: 4500, repairs: 72 },
  ];

  const satisfactionData = [
    { name: '5 étoiles', value: 68, color: '#10B981' },
    { name: '4 étoiles', value: 22, color: '#F59E0B' },
    { name: '3 étoiles', value: 8, color: '#EF4444' },
    { name: '2 étoiles', value: 2, color: '#6B7280' },
  ];

  const deviceTypeData = [
    { type: 'iPhone', count: 45, revenue: 2250 },
    { type: 'Samsung', count: 32, revenue: 1680 },
    { type: 'iPad', count: 18, revenue: 1890 },
    { type: 'Android', count: 25, revenue: 1200 },
  ];

  const timeSlotData = [
    { hour: '9h', appointments: 8 },
    { hour: '10h', appointments: 12 },
    { hour: '11h', appointments: 15 },
    { hour: '14h', appointments: 18 },
    { hour: '15h', appointments: 22 },
    { hour: '16h', appointments: 16 },
    { hour: '17h', appointments: 10 },
  ];

  return (
    <div className="space-y-6">

      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de satisfaction</p>
                <p className="text-2xl font-bold text-green-600">96%</p>
                <p className="text-xs text-gray-500">+5% ce mois</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Temps moyen</p>
                <p className="text-2xl font-bold text-blue-600">2.5h</p>
                <p className="text-xs text-gray-500">-30min ce mois</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clients fidèles</p>
                <p className="text-2xl font-bold text-purple-600">34</p>
                <p className="text-xs text-gray-500">+8 ce mois</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Classement</p>
                <p className="text-2xl font-bold text-orange-600">#3</p>
                <p className="text-xs text-gray-500">Top 5 région</p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des revenus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution des revenus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Répartition des avis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={satisfactionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {satisfactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Réparations par type d'appareil */}
        <Card>
          <CardHeader>
            <CardTitle>Réparations par appareil</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deviceTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Créneaux les plus demandés */}
        <Card>
          <CardHeader>
            <CardTitle>Créneaux populaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeSlotData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;

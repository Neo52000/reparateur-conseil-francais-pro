
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Heart, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

interface DashboardOverviewProps {
  stats: {
    totalRepairers: number;
    totalSubscriptions: number;
    totalInterests: number;
    revenue: number;
  };
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Réparateurs totaux',
      value: stats.totalRepairers.toLocaleString(),
      icon: Users,
      trend: '+12%',
      trendUp: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Abonnements actifs',
      value: stats.totalSubscriptions.toLocaleString(),
      icon: UserCheck,
      trend: '+8%',
      trendUp: true,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Demandes d\'intérêt',
      value: stats.totalInterests.toLocaleString(),
      icon: Heart,
      trend: '+15%',
      trendUp: true,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Revenus (€)',
      value: `${stats.revenue.toLocaleString()}€`,
      icon: DollarSign,
      trend: '+22%',
      trendUp: true,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trendUp ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Activité récente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune activité récente</p>
                <p className="text-sm">Les activités s'afficheront ici en temps réel</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default DashboardOverview;

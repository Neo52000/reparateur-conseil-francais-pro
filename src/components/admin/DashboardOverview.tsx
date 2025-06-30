
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
              {[
                { action: 'Nouveau réparateur inscrit', time: 'Il y a 5 min', type: 'success' },
                { action: 'Abonnement Premium souscrit', time: 'Il y a 12 min', type: 'info' },
                { action: 'Demande d\'intérêt approuvée', time: 'Il y a 25 min', type: 'warning' },
                { action: 'Scraping terminé - 45 nouveaux résultats', time: 'Il y a 1h', type: 'success' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'info' ? 'bg-blue-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'Nouveau scraping', color: 'bg-blue-500', icon: '🕷️' },
                { title: 'Code promo', color: 'bg-green-500', icon: '🏷️' },
                { title: 'Article blog', color: 'bg-purple-500', icon: '📝' },
                { title: 'Publicité', color: 'bg-orange-500', icon: '📢' }
              ].map((action, index) => (
                <button
                  key={index}
                  className={`p-4 rounded-lg text-white hover:opacity-90 transition-opacity ${action.color}`}
                >
                  <div className="text-2xl mb-2">{action.icon}</div>
                  <div className="text-sm font-medium">{action.title}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;

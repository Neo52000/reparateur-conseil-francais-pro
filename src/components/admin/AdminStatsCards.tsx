
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Heart, TrendingUp, Activity, DollarSign } from 'lucide-react';

interface AdminStatsCardsProps {
  stats: {
    totalRepairers: number;
    totalSubscriptions: number;
    totalInterests: number;
    totalRevenue?: number;
  };
}

const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Réparateurs',
      value: stats.totalRepairers?.toLocaleString() || '0',
      description: 'Total inscrits',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+12%'
    },
    {
      title: 'Abonnements',
      value: stats.totalSubscriptions?.toLocaleString() || '0',
      description: 'Actifs',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+8%'
    },
    {
      title: 'Intérêts',
      value: stats.totalInterests?.toLocaleString() || '0',
      description: 'Demandes clients',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      trend: '+15%'
    },
    {
      title: 'Revenus',
      value: `${stats.totalRevenue?.toLocaleString() || '0'}€`,
      description: 'Ce mois',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: '+22%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-sm"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                {card.trend}
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </h3>
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <p className="text-xs text-gray-500">{card.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStatsCards;

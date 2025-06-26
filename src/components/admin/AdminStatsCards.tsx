
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Star, Users, TrendingUp } from 'lucide-react';

interface Stats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalRepairers: number;
  activeRepairers: number;
}

interface AdminStatsCardsProps {
  stats: Stats;
}

const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Réparateurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRepairers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Réparateurs Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeRepairers}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Mensuels</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monthlyRevenue.toFixed(2)}€</p>
            </div>
            <Crown className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Annuels</p>
              <p className="text-2xl font-bold text-gray-900">{stats.yearlyRevenue.toFixed(2)}€</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatsCards;

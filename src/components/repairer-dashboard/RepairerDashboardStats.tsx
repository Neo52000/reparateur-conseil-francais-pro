
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Euro, Clock, TrendingUp, Star } from 'lucide-react';

interface StatsData {
  monthlyRevenue: number;
  pendingOrders: number;
  completedThisMonth: number;
  avgRepairTime: number;
}

interface ProfileData {
  rating: number;
}

interface RepairerDashboardStatsProps {
  stats: StatsData;
  profile: ProfileData;
}

const RepairerDashboardStats: React.FC<RepairerDashboardStatsProps> = ({
  stats,
  profile
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Euro className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">CA mensuel</p>
              <p className="text-2xl font-bold text-gray-900">{stats.monthlyRevenue}€</p>
              {demoModeEnabled && (
                <p className="text-xs text-blue-600">Donnée de démo</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Commandes en attente</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              {demoModeEnabled && (
                <p className="text-xs text-blue-600">Donnée de démo</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Réparations ce mois</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedThisMonth}</p>
              {demoModeEnabled && (
                <p className="text-xs text-blue-600">Donnée de démo</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Note moyenne</p>
              <p className="text-2xl font-bold text-gray-900">{profile.rating}/5</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairerDashboardStats;

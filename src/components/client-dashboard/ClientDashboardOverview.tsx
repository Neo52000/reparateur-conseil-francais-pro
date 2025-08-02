
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageCircle, Bell } from 'lucide-react';
import ClientStatsCards from './ClientStatsCards';

interface ClientDashboardOverviewProps {
  stats: {
    totalRepairs: number;
    totalSpent: number;
    loyaltyPoints: number;
    avgRating: number;
  };
  appointments: any[];
}

const ClientDashboardOverview = ({ stats, appointments }: ClientDashboardOverviewProps) => {
  return (
    <div className="space-y-6">
      <ClientStatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prochains rendez-vous */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Prochains rendez-vous</CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">Aucun rendez-vous planifié</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 2).map((appointment) => (
                   <div key={appointment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                     <div>
                       <p className="font-medium">{appointment.service}</p>
                       <p className="text-sm text-gray-600">{appointment.date} à {appointment.time}</p>
                     </div>
                     <Badge variant="secondary">{appointment.status}</Badge>
                   </div>
                 ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages récents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Messages récents</CardTitle>
            <MessageCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">Aucun message récent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune activité récente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboardOverview;

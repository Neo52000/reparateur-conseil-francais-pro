
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageCircle, Bell } from 'lucide-react';
import { ClientDemoDataService } from '@/services/clientDemoDataService';
import ClientStatsCards from './ClientStatsCards';

interface ClientDashboardOverviewProps {
  stats: {
    totalRepairs: number;
    totalSpent: number;
    loyaltyPoints: number;
    avgRating: number;
  };
  appointments: any[];
  demoModeEnabled: boolean;
}

const ClientDashboardOverview = ({ stats, appointments, demoModeEnabled }: ClientDashboardOverviewProps) => {
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
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg relative">
                    {ClientDemoDataService.isDemoData(appointment) && (
                      <Badge variant="outline" className="absolute top-1 right-1 text-xs">
                        Démo
                      </Badge>
                    )}
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
            {demoModeEnabled ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg relative">
                  <Badge variant="outline" className="absolute top-1 right-1 text-xs">
                    Démo
                  </Badge>
                  <div>
                    <p className="font-medium">TechRepair Pro</p>
                    <p className="text-sm text-gray-600">Votre iPhone est prêt !</p>
                  </div>
                  <Badge variant="default">Nouveau</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg relative">
                  <Badge variant="outline" className="absolute top-1 right-1 text-xs">
                    Démo
                  </Badge>
                  <div>
                    <p className="font-medium">Mobile Expert</p>
                    <p className="text-sm text-gray-600">Diagnostic terminé</p>
                  </div>
                  <Badge variant="outline">Lu</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">Aucun message récent</p>
              </div>
            )}
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
          {demoModeEnabled ? (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1 relative">
                  <Badge variant="outline" className="absolute top-0 right-0 text-xs">
                    Démo
                  </Badge>
                  <p className="text-sm font-medium">Nouveau devis reçu</p>
                  <p className="text-xs text-gray-600">Réparation iPhone 13 - 89€ • Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div className="flex-1 relative">
                  <Badge variant="outline" className="absolute top-0 right-0 text-xs">
                    Démo
                  </Badge>
                  <p className="text-sm font-medium">Message reçu</p>
                  <p className="text-xs text-gray-600">TechRepair Pro • Il y a 3 heures</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div className="flex-1 relative">
                  <Badge variant="outline" className="absolute top-0 right-0 text-xs">
                    Démo
                  </Badge>
                  <p className="text-sm font-medium">Rendez-vous confirmé</p>
                  <p className="text-xs text-gray-600">Demain à 14h30 • Hier</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune activité récente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboardOverview;

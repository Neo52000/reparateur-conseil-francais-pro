
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/hooks/useDemoMode';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  FileText, 
  Shield, 
  MessageCircle, 
  Star, 
  User,
  Settings,
  Bell,
  History,
  TestTube
} from 'lucide-react';
import { ClientDemoDataService } from '@/services/clientDemoDataService';

// Import des composants existants
import ClientStatsCards from './ClientStatsCards';
import ClientAppointmentsTab from './ClientAppointmentsTab';
import ClientRepairsTab from './ClientRepairsTab';
import ClientProfileTab from './ClientProfileTab';
import ClientFavoritesTab from './ClientFavoritesTab';

// Import des nouveaux composants
import ClientInvoicesTab from './ClientInvoicesTab';
import ClientWarrantiesTab from './ClientWarrantiesTab';
import ClientReviewsTab from './ClientReviewsTab';
import ClientMessagingTab from './ClientMessagingTab';

const ClientEnhancedDashboard = () => {
  const { user, profile } = useAuth();
  const { demoModeEnabled } = useDemoMode();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalRepairs: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    avgRating: 0
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, demoModeEnabled]);

  const loadDashboardData = async () => {
    try {
      // Charger les vraies statistiques (pour l'instant simulées)
      const realStats = {
        totalRepairs: 0,
        totalSpent: 0,
        loyaltyPoints: 0,
        avgRating: 0
      };

      // Obtenir les statistiques de démo
      const demoStats = ClientDemoDataService.getDemoStats();
      
      // Utiliser les stats de démo si le mode est activé, sinon les vraies stats
      const finalStats = demoModeEnabled ? demoStats : realStats;
      setStats(finalStats);

      // Charger les rendez-vous
      const realAppointments = [];
      const demoAppointments = ClientDemoDataService.getDemoAppointments();
      
      const combinedAppointments = ClientDemoDataService.combineWithDemoData(
        realAppointments,
        demoAppointments,
        demoModeEnabled
      );
      
      setAppointments(combinedAppointments);
    } catch (error) {
      console.error('Erreur chargement données dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform profile data to match ClientProfileTab interface
  const transformedProfile = profile ? {
    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur',
    email: profile.email,
    phone: 'Non renseigné', // This would come from user profile when extended
    address: 'Non renseignée', // This would come from user profile when extended
    memberSince: 'Janvier 2024' // This could be calculated from created_at when available
  } : {
    name: 'Utilisateur',
    email: user?.email || '',
    phone: 'Non renseigné',
    address: 'Non renseignée',
    memberSince: 'Récent'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour {profile?.first_name || 'Client'} 👋
          </h1>
          <p className="text-gray-600">
            Gérez vos réparations et suivez vos appareils
          </p>
        </div>
        <div className="flex items-center gap-2">
          {demoModeEnabled && (
            <Badge variant="outline" className="flex items-center gap-1">
              <TestTube className="h-3 w-3" />
              Mode Démo
            </Badge>
          )}
          <Badge variant="secondary" className="text-sm">
            Client Premium
          </Badge>
        </div>
      </div>

      {/* Navigation par onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8 lg:grid-cols-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Rendez-vous</span>
          </TabsTrigger>
          <TabsTrigger value="repairs" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Réparations</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Factures</span>
          </TabsTrigger>
          <TabsTrigger value="warranties" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Garanties</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Avis</span>
          </TabsTrigger>
          <TabsTrigger value="messaging" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Messages</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
        </TabsList>

        {/* Contenu des onglets */}
        <TabsContent value="overview" className="space-y-6">
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
                    {demoModeEnabled ? (
                      <p className="text-sm">Aucun rendez-vous planifié</p>
                    ) : (
                      <p className="text-sm">Aucun rendez-vous planifié</p>
                    )}
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
        </TabsContent>

        <TabsContent value="appointments">
          <ClientAppointmentsTab appointments={appointments} />
        </TabsContent>

        <TabsContent value="repairs">
          <ClientRepairsTab repairs={[]} />
        </TabsContent>

        <TabsContent value="invoices">
          <ClientInvoicesTab />
        </TabsContent>

        <TabsContent value="warranties">
          <ClientWarrantiesTab />
        </TabsContent>

        <TabsContent value="reviews">
          <ClientReviewsTab />
        </TabsContent>

        <TabsContent value="messaging">
          <ClientMessagingTab />
        </TabsContent>

        <TabsContent value="profile">
          <ClientProfileTab profile={transformedProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientEnhancedDashboard;

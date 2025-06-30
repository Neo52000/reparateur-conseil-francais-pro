
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  Calendar, 
  FileText, 
  Shield, 
  MessageCircle, 
  Star, 
  Gift,
  User,
  Settings,
  Bell,
  History
} from 'lucide-react';

// Import des composants existants
import ClientStatsCards from './ClientStatsCards';
import ClientAppointmentsTab from './ClientAppointmentsTab';
import ClientRepairsTab from './ClientRepairsTab';
import ClientProfileTab from './ClientProfileTab';
import ClientFavoritesTab from './ClientFavoritesTab';
import ClientLoyaltyTab from './ClientLoyaltyTab';

// Import des nouveaux composants
import ClientInvoicesTab from './ClientInvoicesTab';
import ClientWarrantiesTab from './ClientWarrantiesTab';
import ClientReviewsTab from './ClientReviewsTab';

const ClientEnhancedDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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
        <Badge variant="secondary" className="text-sm">
          Client Premium
        </Badge>
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
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Avis</span>
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Fidélité</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
        </TabsList>

        {/* Contenu des onglets */}
        <TabsContent value="overview" className="space-y-6">
          <ClientStatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prochains rendez-vous */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">Prochains rendez-vous</CardTitle>
                <Calendar className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Réparation écran iPhone 13</p>
                      <p className="text-sm text-gray-600">Demain à 14h30</p>
                    </div>
                    <Badge variant="secondary">Confirmé</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Diagnostic Samsung Galaxy</p>
                      <p className="text-sm text-gray-600">Vendredi à 10h00</p>
                    </div>
                    <Badge variant="outline">En attente</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Garanties actives */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">Garanties actives</CardTitle>
                <Shield className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">iPhone 13 - Écran</p>
                      <p className="text-sm text-gray-600">Expire dans 67 jours</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium">MacBook Pro - Batterie</p>
                      <p className="text-sm text-gray-600">Expire dans 12 jours</p>
                    </div>
                    <Badge variant="secondary">Expire bientôt</Badge>
                  </div>
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
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nouveau devis reçu</p>
                    <p className="text-xs text-gray-600">Réparation iPhone 13 - 89€ • Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Rendez-vous confirmé</p>
                    <p className="text-xs text-gray-600">Demain à 14h30 • Il y a 5 heures</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Points de fidélité gagnés</p>
                    <p className="text-xs text-gray-600">+150 points • Hier</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <ClientAppointmentsTab />
        </TabsContent>

        <TabsContent value="repairs">
          <ClientRepairsTab />
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

        <TabsContent value="loyalty">
          <ClientLoyaltyTab />
        </TabsContent>

        <TabsContent value="profile">
          <ClientProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientEnhancedDashboard;

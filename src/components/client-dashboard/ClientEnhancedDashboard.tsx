
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/hooks/useDemoMode';
import { 
  Calendar, 
  FileText, 
  Shield, 
  MessageCircle, 
  Star, 
  User,
  Settings,
  History
} from 'lucide-react';
import { ClientDemoDataService } from '@/services/clientDemoDataService';

// Import des composants
import ClientDashboardHeader from './ClientDashboardHeader';
import ClientDashboardOverview from './ClientDashboardOverview';
import ClientAppointmentsTab from './ClientAppointmentsTab';
import ClientRepairsTab from './ClientRepairsTab';
import ClientProfileTab from './ClientProfileTab';
import ClientFavoritesTab from './ClientFavoritesTab';
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
    phone: 'Non renseigné',
    address: 'Non renseignée',
    memberSince: 'Janvier 2024'
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
      <ClientDashboardHeader 
        firstName={profile?.first_name} 
        demoModeEnabled={demoModeEnabled} 
      />

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

        <TabsContent value="overview">
          <ClientDashboardOverview 
            stats={stats} 
            appointments={appointments} 
            demoModeEnabled={demoModeEnabled} 
          />
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

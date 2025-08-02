import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import ClientDashboardHeader from './ClientDashboardHeader';
import ClientDashboardOverview from './ClientDashboardOverview';
import ClientFavoritesTab from './ClientFavoritesTab';
import ClientMessagingTab from './ClientMessagingTab';
import ClientReviewsTab from './ClientReviewsTab';
import ClientAppointmentsTab from './ClientAppointmentsTab';
import QuoteForm from '../QuoteForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ClientEnhancedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [clientData, setClientData] = useState({
    stats: {
      totalRepairs: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      avgRating: 0
    },
    appointments: [],
    favorites: []
  });

  useEffect(() => {
    if (user) {
      loadClientData();
    }
  }, [user]);

  const loadClientData = async () => {
    try {
      setDashboardLoading(true);
      
      // Charger les vraies données (pour l'instant vides car pas encore implémentées)
      const realStats = {
        totalRepairs: 0,
        totalSpent: 0,
        loyaltyPoints: 0,
        avgRating: 0
      };

      const realAppointments: any[] = [];

      // Utiliser uniquement les données réelles
      const finalStats = realStats;
      const finalAppointments: any[] = [];
      
      setClientData({
        stats: finalStats,
        appointments: finalAppointments,
        favorites: []
      });

    } catch (error) {
      console.error('Erreur chargement données client:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ClientDashboardHeader 
          firstName={user?.user_metadata?.first_name || user?.email?.split('@')[0] || ''}
        />

        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
            <TabsTrigger value="quotes">Devis</TabsTrigger>
            <TabsTrigger value="messaging">Messages</TabsTrigger>
            <TabsTrigger value="reviews">Mes avis</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <ClientDashboardOverview
              stats={clientData.stats}
              appointments={clientData.appointments}
            />
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <ClientAppointmentsTab appointments={clientData.appointments} />
          </TabsContent>

          <TabsContent value="quotes" className="mt-6">
            <QuoteForm onSuccess={() => console.log('Quote requested')} />
          </TabsContent>

          <TabsContent value="messaging" className="mt-6">
            <ClientMessagingTab />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ClientReviewsTab />
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <ClientFavoritesTab favorites={clientData.favorites} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientEnhancedDashboard;
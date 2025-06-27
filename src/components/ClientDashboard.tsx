
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuoteForm from './QuoteForm';
import ChatInterface from './ChatInterface';
import ClientStatsCards from './client-dashboard/ClientStatsCards';
import ClientProfileTab from './client-dashboard/ClientProfileTab';
import ClientRepairsTab from './client-dashboard/ClientRepairsTab';
import ClientAppointmentsTab from './client-dashboard/ClientAppointmentsTab';
import ClientFavoritesTab from './client-dashboard/ClientFavoritesTab';
import ClientLoyaltyTab from './client-dashboard/ClientLoyaltyTab';

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // Données mockées pour la démo
  const clientData = {
    profile: {
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33 6 12 34 56 78',
      address: '123 Rue de la Paix, 75001 Paris',
      memberSince: '2024-01-15'
    },
    stats: {
      totalRepairs: 8,
      totalSpent: 450,
      loyaltyPoints: 120,
      avgRating: 4.8
    },
    recentRepairs: [
      {
        id: '1',
        device: 'iPhone 14 Pro',
        issue: 'Écran cassé',
        repairer: 'TechRepair Pro',
        date: '2024-12-10',
        status: 'Terminé',
        rating: 5
      },
      {
        id: '2',
        device: 'Samsung Galaxy S23',
        issue: 'Batterie',
        repairer: 'Phone Fix Express',
        date: '2024-11-25',
        status: 'Terminé',
        rating: 4
      }
    ],
    appointments: [
      {
        id: '1',
        repairer: 'TechRepair Pro',
        date: '2024-12-20',
        time: '14:00',
        service: 'Diagnostic',
        status: 'Confirmé'
      }
    ],
    favorites: [
      {
        id: '1',
        name: 'TechRepair Pro',
        rating: 4.9,
        specialty: 'iPhone'
      },
      {
        id: '2',
        name: 'Phone Fix Express',
        rating: 4.7,
        specialty: 'Samsung'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon espace client</h1>
          <p className="text-gray-600 mt-2">Gérez vos réparations et votre profil</p>
        </div>

        <ClientStatsCards stats={clientData.stats} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="repairs">Réparations</TabsTrigger>
            <TabsTrigger value="appointments">RDV</TabsTrigger>
            <TabsTrigger value="quote">Devis</TabsTrigger>
            <TabsTrigger value="chat">Messages</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
            <TabsTrigger value="loyalty">Fidélité</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ClientProfileTab profile={clientData.profile} />
          </TabsContent>

          <TabsContent value="repairs">
            <ClientRepairsTab repairs={clientData.recentRepairs} />
          </TabsContent>

          <TabsContent value="appointments">
            <ClientAppointmentsTab appointments={clientData.appointments} />
          </TabsContent>

          <TabsContent value="quote">
            <QuoteForm onSuccess={() => console.log('Quote requested')} />
          </TabsContent>

          <TabsContent value="chat">
            <ChatInterface 
              conversationId="client-conversation"
              userType="user"
              subscription="premium"
            />
          </TabsContent>

          <TabsContent value="favorites">
            <ClientFavoritesTab favorites={clientData.favorites} />
          </TabsContent>

          <TabsContent value="loyalty">
            <ClientLoyaltyTab loyaltyPoints={clientData.stats.loyaltyPoints} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;

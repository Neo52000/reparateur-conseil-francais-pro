import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuoteForm from '@/components/QuoteForm';
import AppointmentBooking from '@/components/AppointmentBooking';
import PricingGrid from '@/components/PricingGrid';
import ChatInterface from '@/components/ChatInterface';
import RepairTracking from '@/components/RepairTracking';
import PriceComparator from '@/components/PriceComparator';
import AdvancedSearch from '@/components/AdvancedSearch';

const QuotesAndAppointments = () => {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');
  
  // Simulation d'un abonnement - à remplacer par la vraie logique d'abonnement
  const userSubscription = 'premium'; // ou 'basic', 'enterprise'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Devis et Rendez-vous</h1>
          <p className="text-gray-600 mt-2">Gérez vos demandes de réparation</p>
        </div>

        <Tabs defaultValue="quote" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="quote">Demander un devis</TabsTrigger>
            <TabsTrigger value="appointment">Prendre RDV</TabsTrigger>
            <TabsTrigger value="pricing">Tarifs</TabsTrigger>
            <TabsTrigger value="comparator">Comparateur</TabsTrigger>
            <TabsTrigger value="search">Recherche avancée</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="tracking">Suivi</TabsTrigger>
          </TabsList>

          <TabsContent value="quote">
            <QuoteForm onSuccess={() => console.log('Quote created')} />
          </TabsContent>

          <TabsContent value="appointment">
            <AppointmentBooking 
              repairerId="demo-repairer" 
              quoteId={selectedQuoteId}
              onSuccess={() => console.log('Appointment booked')} 
            />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingGrid />
          </TabsContent>

          <TabsContent value="comparator">
            <PriceComparator />
          </TabsContent>

          <TabsContent value="search">
            <AdvancedSearch onSearch={(filters) => console.log('Search filters:', filters)} />
          </TabsContent>

          <TabsContent value="chat">
            <ChatInterface 
              conversationId="demo-conversation"
              userType="user"
              subscription={userSubscription}
            />
          </TabsContent>

          <TabsContent value="tracking">
            <RepairTracking 
              quoteId={selectedQuoteId || 'demo-quote'}
              subscription={userSubscription}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QuotesAndAppointments;

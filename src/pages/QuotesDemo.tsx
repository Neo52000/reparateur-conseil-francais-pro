import React from 'react';
import { QuoteRequestForm } from '@/components/quotes/QuoteRequestForm';
import { RepairerQuotesDashboard } from '@/components/quotes/RepairerQuotesDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, UserCheck, Calendar, Euro } from 'lucide-react';

export const QuotesDemo: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Système de Devis/RDV Complet</h1>
        <p className="text-xl text-muted-foreground">
          Le cœur métier de votre plateforme "Doctolib de la réparation"
        </p>
      </div>

      {/* Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Complet</CardTitle>
          <CardDescription>
            Processus automatisé de la demande à la réparation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium">1. Demande de devis</h3>
              <p className="text-sm text-muted-foreground">Client décrit son problème</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium">2. Devis professionnel</h3>
              <p className="text-sm text-muted-foreground">Réparateur envoie un devis détaillé</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium">3. Validation client</h3>
              <p className="text-sm text-muted-foreground">Client accepte et valide</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-medium">4. Rendez-vous</h3>
              <p className="text-sm text-muted-foreground">Planification automatique</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Démonstration */}
      <Tabs defaultValue="client" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="client">Vue Client</TabsTrigger>
          <TabsTrigger value="repairer">Vue Réparateur</TabsTrigger>
        </TabsList>

        <TabsContent value="client" className="space-y-4">
          <QuoteRequestForm 
            repairerId="demo-repairer-id"
            repairerName="TechRepair Pro"
            onSuccess={() => console.log('Devis envoyé')}
          />
        </TabsContent>

        <TabsContent value="repairer" className="space-y-4">
          <RepairerQuotesDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
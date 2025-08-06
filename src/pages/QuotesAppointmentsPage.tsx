import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Phone, Star, Plus } from 'lucide-react';

// Mock data
const mockQuotes = [
  {
    id: '1',
    repairerName: 'TechRepair Pro',
    deviceModel: 'iPhone 13',
    issueDescription: 'Écran cassé',
    price: 150,
    status: 'pending',
    estimatedDuration: '1h30',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    repairerName: 'Mobile Fix Express',
    deviceModel: 'Samsung Galaxy S21',
    issueDescription: 'Batterie défectueuse',
    price: 85,
    status: 'accepted',
    estimatedDuration: '45min',
    createdAt: '2024-01-14',
  }
];

const mockAppointments = [
  {
    id: '1',
    repairerName: 'SmartPhone Clinic',
    deviceModel: 'iPhone 12',
    issueDescription: 'Réparation écran',
    appointmentDate: '2024-01-20T14:00:00',
    address: '123 rue de la République, Paris',
    phone: '01 23 45 67 89',
    status: 'confirmed',
  }
];

const QuotesAppointmentsPage: React.FC = () => {
  const [quotesFilter, setQuotesFilter] = useState('all');
  const [appointmentsFilter, setAppointmentsFilter] = useState('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepté</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Refusé</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredQuotes = quotesFilter === 'all' 
    ? mockQuotes 
    : mockQuotes.filter(quote => quote.status === quotesFilter);

  const filteredAppointments = appointmentsFilter === 'all' 
    ? mockAppointments 
    : mockAppointments.filter(appointment => appointment.status === appointmentsFilter);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Devis et Rendez-vous</h1>
        <p className="text-muted-foreground">
          Gérez vos demandes de devis et vos rendez-vous avec les réparateurs
        </p>
      </div>

      <Tabs defaultValue="quotes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quotes">Mes Devis</TabsTrigger>
          <TabsTrigger value="appointments">Mes Rendez-vous</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Filtrer par statut:</span>
              <Select value={quotesFilter} onValueChange={setQuotesFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tous les devis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="accepted">Acceptés</SelectItem>
                  <SelectItem value="rejected">Refusés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau devis
            </Button>
          </div>

          <div className="space-y-4">
            {filteredQuotes.map((quote) => (
              <Card key={quote.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{quote.repairerName}</CardTitle>
                      <CardDescription>
                        {quote.deviceModel} - {quote.issueDescription}
                      </CardDescription>
                    </div>
                    {getStatusBadge(quote.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Prix estimé</p>
                      <p className="text-2xl font-bold">{quote.price}€</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Durée estimée</p>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{quote.estimatedDuration}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Demandé le</p>
                      <p>{new Date(quote.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    {quote.status === 'accepted' && (
                      <Button>Prendre rendez-vous</Button>
                    )}
                    <Button variant="outline">Voir détails</Button>
                    {quote.status === 'pending' && (
                      <Button variant="outline" className="text-red-600">
                        Annuler
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Filtrer par statut:</span>
              <Select value={appointmentsFilter} onValueChange={setAppointmentsFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tous les RDV" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="confirmed">Confirmés</SelectItem>
                  <SelectItem value="completed">Terminés</SelectItem>
                  <SelectItem value="cancelled">Annulés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{appointment.repairerName}</CardTitle>
                      <CardDescription>
                        {appointment.deviceModel} - {appointment.issueDescription}
                      </CardDescription>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="font-medium">
                        {new Date(appointment.appointmentDate).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <Clock className="w-4 h-4 ml-4 mr-1" />
                      <span>
                        {new Date(appointment.appointmentDate).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{appointment.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{appointment.phone}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline">Voir sur la carte</Button>
                    <Button variant="outline">Contacter</Button>
                    {appointment.status === 'confirmed' && (
                      <Button variant="outline" className="text-red-600">
                        Annuler
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuotesAppointmentsPage;
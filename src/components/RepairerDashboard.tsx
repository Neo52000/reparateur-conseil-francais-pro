
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Package, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Euro,
  TrendingUp,
  Users,
  Clock,
  Star
} from 'lucide-react';

const RepairerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Données mockées pour la démo
  const repairerData = {
    profile: {
      name: 'TechRepair Pro',
      rating: 4.9,
      totalRepairs: 156,
      joinDate: '2023-03-15'
    },
    stats: {
      monthlyRevenue: 3450,
      pendingOrders: 8,
      completedThisMonth: 24,
      avgRepairTime: 2.5
    },
    orders: [
      {
        id: '1',
        client: 'Jean Dupont',
        device: 'iPhone 14 Pro',
        issue: 'Écran cassé',
        status: 'En cours',
        priority: 'Urgente',
        estimatedPrice: 180
      },
      {
        id: '2',
        client: 'Marie Martin',
        device: 'Samsung Galaxy S23',
        issue: 'Batterie',
        status: 'Diagnostic',
        priority: 'Normale',
        estimatedPrice: 85
      }
    ],
    inventory: [
      {
        id: '1',
        part: 'Écran iPhone 14 Pro',
        stock: 5,
        minStock: 2,
        price: 150
      },
      {
        id: '2',
        part: 'Batterie Samsung S23',
        stock: 1,
        minStock: 3,
        price: 65
      }
    ],
    appointments: [
      {
        id: '1',
        client: 'Paul Durand',
        time: '14:00',
        service: 'Diagnostic iPhone',
        phone: '+33 6 12 34 56 78'
      },
      {
        id: '2',
        client: 'Sophie Legrand',
        time: '16:30',
        service: 'Réparation écran',
        phone: '+33 6 98 76 54 32'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Réparateur</h1>
          <p className="text-gray-600 mt-2">{repairerData.profile.name}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Euro className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">CA mensuel</p>
                  <p className="text-2xl font-bold text-gray-900">{repairerData.stats.monthlyRevenue}€</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Commandes en attente</p>
                  <p className="text-2xl font-bold text-gray-900">{repairerData.stats.pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Réparations ce mois</p>
                  <p className="text-2xl font-bold text-gray-900">{repairerData.stats.completedThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">{repairerData.profile.rating}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="calendar">Planning</TabsTrigger>
            <TabsTrigger value="inventory">Stock</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="billing">Facturation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commandes récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {repairerData.orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{order.client}</h3>
                          <p className="text-sm text-gray-600">{order.device} • {order.issue}</p>
                          <p className="text-sm text-green-600 font-medium">{order.estimatedPrice}€</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={order.status === 'En cours' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                          <Badge 
                            variant={order.priority === 'Urgente' ? 'destructive' : 'outline'}
                            className="ml-1"
                          >
                            {order.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rendez-vous aujourd'hui</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {repairerData.appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{appointment.client}</h3>
                          <p className="text-sm text-gray-600">{appointment.service}</p>
                          <p className="text-sm text-gray-500">{appointment.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">{appointment.time}</p>
                          <Button size="sm" variant="outline">Contacter</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Gestion des commandes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {repairerData.orders.map((order) => (
                    <div key={order.id} className="p-6 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{order.client}</h3>
                          <p className="text-gray-600">{order.device} • {order.issue}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">{order.estimatedPrice}€</p>
                          <Badge variant={order.status === 'En cours' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm">Mettre à jour le statut</Button>
                        <Button size="sm" variant="outline">Envoyer message</Button>
                        <Button size="sm" variant="outline">Générer facture</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Planning des rendez-vous
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Calendrier interactif pour la gestion des rendez-vous</p>
                  <Button className="mt-4">Configurer les créneaux</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Gestion des stocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {repairerData.inventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{item.part}</h3>
                        <p className="text-sm text-gray-600">Prix: {item.price}€</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">Stock: {item.stock}</p>
                        <Badge variant={item.stock <= item.minStock ? 'destructive' : 'default'}>
                          {item.stock <= item.minStock ? 'Stock faible' : 'En stock'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">Ajouter une pièce</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Analyses de performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Graphiques et statistiques détaillées</p>
                  <div className="grid grid-cols-2 gap-4 mt-6 text-left">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Temps moyen de réparation</p>
                      <p className="text-2xl font-bold">{repairerData.stats.avgRepairTime}j</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Taux de satisfaction</p>
                      <p className="text-2xl font-bold">96%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Facturation intégrée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Système de facturation automatisé</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Button>Créer une facture</Button>
                    <Button variant="outline">Voir les paiements</Button>
                    <Button variant="outline">Rapports financiers</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RepairerDashboard;

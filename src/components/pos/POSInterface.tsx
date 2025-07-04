import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Package, 
  Users, 
  Calendar,
  Receipt,
  BarChart3,
  Settings,
  Printer,
  Wifi,
  WifiOff
} from 'lucide-react';

/**
 * Interface POS principale qui "absorbe" certaines fonctionnalités du dashboard
 * et les présente dans un format optimisé pour la vente en magasin
 */
const POSInterface: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('sale');

  // Données de session simulées
  const sessionData = {
    sessionNumber: 'S001',
    startTime: '09:00',
    totalAmount: 2847.50,
    transactionCount: 23,
    cashDrawer: 500.00
  };

  // Données synchronisées du dashboard (simulées)
  const dashboardData = {
    todayAppointments: [
      {
        id: '1',
        time: '10:30',
        client: 'Marie Dubois',
        service: 'Réparation écran iPhone 13',
        status: 'confirmed'
      },
      {
        id: '2',  
        time: '14:00',
        client: 'Pierre Martin',
        service: 'Changement batterie Samsung S21',
        status: 'pending'
      }
    ],
    inventory: [
      {
        id: '1',
        name: 'Écran iPhone 13',
        sku: 'SCR-IP13-001',
        stock: 5,
        price: 149.90
      },
      {
        id: '2',
        name: 'Batterie Samsung S21',
        sku: 'BAT-SS21-001', 
        stock: 8,
        price: 89.90
      }
    ],
    todayStats: {
      revenue: 1247.80,
      repairs: 7,
      newCustomers: 3
    }
  };

  const startSession = () => {
    setCurrentSession('S001');
  };

  const endSession = () => {
    setCurrentSession(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header POS */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Point de Vente</h1>
            </div>
            {currentSession && (
              <Badge variant="default" className="bg-green-600">
                Session {sessionData.sessionNumber} • {sessionData.startTime}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Statut connexion */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">En ligne</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">Hors ligne (3 ventes en attente)</span>
                </>
              )}
            </div>

            {/* Actions session */}
            {!currentSession ? (
              <Button onClick={startSession} className="bg-green-600 hover:bg-green-700">
                Ouvrir Session
              </Button>
            ) : (
              <Button variant="outline" onClick={endSession}>
                Clôturer Session
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Panel principal POS */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="sale">Vente</TabsTrigger>
              <TabsTrigger value="appointments">RDV du jour</TabsTrigger>
              <TabsTrigger value="inventory">Stock</TabsTrigger>
              <TabsTrigger value="customers">Clients</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
            </TabsList>

            {/* Onglet Vente */}
            <TabsContent value="sale" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Interface de vente */}
                <Card>
                  <CardHeader>
                    <CardTitle>Nouvelle Transaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-muted-foreground">
                        Scanner un produit ou rechercher par SKU
                      </div>
                      <Button className="w-full" size="lg">
                        <Receipt className="w-4 h-4 mr-2" />
                        Commencer une vente
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Raccourcis produits populaires */}
                <Card>
                  <CardHeader>
                    <CardTitle>Réparations Courantes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="h-20 flex flex-col">
                        <span className="font-medium">Écran iPhone</span>
                        <span className="text-sm text-muted-foreground">149€</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-20 flex flex-col">
                        <span className="font-medium">Batterie Samsung</span>
                        <span className="text-sm text-muted-foreground">89€</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-20 flex flex-col">
                        <span className="font-medium">Vitre Protection</span>
                        <span className="text-sm text-muted-foreground">25€</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-20 flex flex-col">
                        <span className="font-medium">Diagnostic</span>
                        <span className="text-sm text-muted-foreground">35€</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Rendez-vous (données synchronisées du dashboard) */}
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Rendez-vous du jour (synchronisé)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.todayAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{appointment.time} - {appointment.client}</div>
                          <div className="text-sm text-muted-foreground">{appointment.service}</div>
                        </div>
                        <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                          {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                        </Badge>
                        <Button size="sm">
                          Créer Transaction
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Stock (données synchronisées) */}
            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Stock Synchronisé
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.inventory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.price}€</div>
                          <Badge variant={item.stock > 5 ? 'default' : 'destructive'}>
                            Stock: {item.stock}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Clients */}
            <TabsContent value="customers">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Base Clients Unifiée
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Rechercher un client par nom, téléphone ou email
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Rapports */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Rapports du Jour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardData.todayStats.revenue}€
                      </div>
                      <div className="text-sm text-muted-foreground">CA du jour</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardData.todayStats.repairs}
                      </div>
                      <div className="text-sm text-muted-foreground">Réparations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {dashboardData.todayStats.newCustomers}
                      </div>
                      <div className="text-sm text-muted-foreground">Nouveaux clients</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Panel latéral - Informations session et outils */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          {currentSession ? (
            <div className="space-y-6">
              {/* Informations session */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Session Actuelle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Session</span>
                    <span className="font-medium">{sessionData.sessionNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ouverture</span>
                    <span className="font-medium">{sessionData.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transactions</span>
                    <span className="font-medium">{sessionData.transactionCount}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">{sessionData.totalAmount}€</span>
                  </div>
                </CardContent>
              </Card>

              {/* Outils POS */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Outils</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Printer className="w-4 h-4 mr-2" />
                    Test Imprimante
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Configuration
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Receipt className="w-4 h-4 mr-2" />
                    Rapport Z
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Aucune session active</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ouvrez une session pour commencer à vendre
              </p>
              <Button onClick={startSession} className="w-full">
                Ouvrir Session
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POSInterface;
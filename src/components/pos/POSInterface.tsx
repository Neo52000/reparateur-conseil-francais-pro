import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CompactPOSNav from './modern/CompactPOSNav';
import POSSalesInterface from './ui/POSSalesInterface';
import POSCustomerManager from './ui/POSCustomerManager';
import POSTransactionHistory from './ui/POSTransactionHistory';
import POSSessionManager from './ui/POSSessionManager';
import POSInventoryManager from './ui/POSInventoryManager';
import POSReportsAnalytics from './ui/POSReportsAnalytics';
import POSSettings from './ui/POSSettings';
import StockAlertsManager from './advanced/StockAlertsManager';
import MobileOptimization from './advanced/MobileOptimization';
import IntegrationsManager from './advanced/IntegrationsManager';
import AdvancedBusinessModules from './advanced/AdvancedBusinessModules';
import RepairManagement from './RepairManagement';
import BuybackManager from './modules/BuybackManager';
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
  WifiOff,
  Shield,
  Smartphone,
  Zap,
  Brain,
  Wrench,
  Euro
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
    <div className="min-h-screen bg-background">
      {/* Header POS */}
      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Point de Vente</h1>
            </div>
            {currentSession && (
              <Badge className="bg-admin-green text-white">
                Session {sessionData.sessionNumber} • {sessionData.startTime}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Statut connexion */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-admin-green" />
                  <span className="text-sm text-admin-green">En ligne</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">Hors ligne (3 ventes en attente)</span>
                </>
              )}
            </div>

            {/* Actions session */}
            {!currentSession ? (
              <Button onClick={startSession} className="bg-admin-green hover:bg-admin-green/90">
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

      <div className="flex h-[calc(100vh-84px)] overflow-hidden">
        {/* Panel principal POS */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Navigation compacte */}
          <CompactPOSNav 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            className="mb-6"
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>

            {/* Onglet Session */}
            <TabsContent value="session" className="mt-6">
              <POSSessionManager 
                repairer_id="mock-repairer-id"
                onSessionChange={(session) => setCurrentSession(session?.sessionNumber || null)}
              />
            </TabsContent>

            {/* Onglet Vente */}
            <TabsContent value="sale" className="mt-6">
              <POSSalesInterface />
            </TabsContent>

            {/* Onglet Clients */}
            <TabsContent value="customers" className="mt-6">
              <POSCustomerManager />
            </TabsContent>

            {/* Onglet Historique */}
            <TabsContent value="history" className="mt-6">
              <POSTransactionHistory repairer_id="mock-repairer-id" />
            </TabsContent>

            {/* Onglet Stock */}
            <TabsContent value="inventory" className="mt-6">
              <POSInventoryManager />
            </TabsContent>

            {/* Onglet Rapports */}
            <TabsContent value="reports" className="mt-6">
              <POSReportsAnalytics />
            </TabsContent>

            {/* Onglet Réparations */}
            <TabsContent value="repairs" className="mt-6">
              <RepairManagement />
            </TabsContent>

            {/* Onglet Rachat */}
            <TabsContent value="buyback" className="mt-6">
              <BuybackManager />
            </TabsContent>

            {/* Onglet Alertes Stock */}
            <TabsContent value="alerts" className="mt-6">
              <StockAlertsManager />
            </TabsContent>

            {/* Onglet Mobile */}
            <TabsContent value="mobile" className="mt-6">
              <MobileOptimization />
            </TabsContent>

            {/* Onglet Intégrations */}
            <TabsContent value="integrations" className="mt-6">
              <IntegrationsManager />
            </TabsContent>

            {/* Onglet Business */}
            <TabsContent value="business" className="mt-6">
              <AdvancedBusinessModules />
            </TabsContent>

            {/* Onglet Paramètres */}
            <TabsContent value="settings" className="mt-6">
              <POSSettings />
            </TabsContent>
          </Tabs>
        </div>

        {/* Panel latéral - Statut et outils rapides */}
        <div className="w-80 bg-card border-l p-6 overflow-y-auto">
          {currentSession ? (
            <div className="space-y-6">
              {/* Statut session */}
              <div className="text-center p-4 border rounded-lg">
                <Badge className="bg-admin-green text-white mb-2">Session Active</Badge>
                <div className="font-medium">{sessionData.sessionNumber}</div>
                <div className="text-sm text-muted-foreground">
                  {sessionData.transactionCount} transactions • {sessionData.totalAmount}€
                </div>
              </div>

              {/* Outils rapides */}
              <div className="space-y-2">
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
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Aucune session active</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ouvrez une session pour commencer à vendre
              </p>
              <Button onClick={startSession} className="w-full bg-admin-green hover:bg-admin-green/90">
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
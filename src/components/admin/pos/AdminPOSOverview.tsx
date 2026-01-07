import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Shield, 
  Settings, 
  TrendingUp,
  Store,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import NF525Dashboard from '@/components/pos/NF525Dashboard';
import PaymentIntegrationsPanel from '@/components/pos/PaymentIntegrationsPanel';

interface AdminPOSOverviewProps {
  repairerId?: string;
}

/**
 * Vue d'ensemble admin du système POS avec NF525 et intégrations paiement
 */
const AdminPOSOverview: React.FC<AdminPOSOverviewProps> = ({ repairerId = 'admin-demo' }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            Système POS NF-525
          </h1>
          <p className="text-muted-foreground">
            Gestion des caisses enregistreuses conformes à la législation française
          </p>
        </div>
        <Badge variant="default" className="bg-emerald-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Conforme NF-525
        </Badge>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Réparateurs actifs</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <Store className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions / jour</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score conformité</p>
                <p className="text-2xl font-bold text-emerald-600">98%</p>
              </div>
              <Shield className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertes</p>
                <p className="text-2xl font-bold text-amber-600">2</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Conformité NF-525
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Intégrations Paiement
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="mt-6">
          <NF525Dashboard repairerId={repairerId} />
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <PaymentIntegrationsPanel repairerId={repairerId} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration globale POS</CardTitle>
              <CardDescription>
                Paramètres par défaut pour tous les systèmes de caisse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Taux de TVA par défaut</h4>
                  <p className="text-2xl font-bold">20%</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Durée archivage</h4>
                  <p className="text-2xl font-bold">10 ans</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Devise</h4>
                  <p className="text-2xl font-bold">EUR €</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Algorithme signature</h4>
                  <p className="text-2xl font-bold">SHA-256</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPOSOverview;

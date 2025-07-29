import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Brain, 
  Zap, 
  TrendingUp,
  Bell,
  Target
} from 'lucide-react';
import RealTimeMetrics from './RealTimeMetrics';
import IntelligentAlerts from './IntelligentAlerts';
import PredictiveInsights from './PredictiveInsights';

interface EnhancedDashboardProps {
  orders: any[];
  appointments: any[];
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  orders,
  appointments
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Section avec métriques temps réel */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Target className="h-6 w-6 text-primary" />
            Dashboard Intelligent & Prédictif
            <span className="text-sm font-normal text-gray-600 ml-2">
              Votre cockpit de performance digitale
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RealTimeMetrics />
        </CardContent>
      </Card>

      {/* Onglets du dashboard intelligent */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alertes IA
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Prédictions
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <IntelligentAlerts />
        </TabsContent>

        <TabsContent value="predictions">
          <PredictiveInsights />
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Analyse de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-green-800">Efficacité Opérationnelle</h4>
                      <p className="text-sm text-green-600">Temps de traitement optimal</p>
                    </div>
                    <div className="text-2xl font-bold text-green-700">94%</div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-blue-800">Satisfaction Client</h4>
                      <p className="text-sm text-blue-600">Note moyenne des avis</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">4.8/5</div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-orange-800">Taux de Conversion</h4>
                      <p className="text-sm text-orange-600">Devis → Commandes</p>
                    </div>
                    <div className="text-2xl font-bold text-orange-700">78%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Actions Recommandées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-green-800">Optimisation Stock</h4>
                    <p className="text-sm text-gray-600">
                      Votre rotation de stock iPhone 14 est excellente. 
                      Considérez augmenter les quantités.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-blue-800">Marketing Local</h4>
                    <p className="text-sm text-gray-600">
                      Votre zone de chalandise est sous-exploitée. 
                      Lancez une campagne locale ciblée.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-medium text-orange-800">Diversification</h4>
                    <p className="text-sm text-gray-600">
                      Ajoutez la réparation de tablettes pour augmenter 
                      votre CA de 25% (estimation IA).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Section résumé commandes et rendez-vous */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Commandes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.client}</p>
                      <p className="text-sm text-gray-600">{order.device} - {order.issue}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.estimatedPrice}€</p>
                      <p className="text-sm text-gray-600">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Aucune commande récente
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous du Jour</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.slice(0, 5).map(appointment => (
                  <div key={appointment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{appointment.client}</p>
                      <p className="text-sm text-gray-600">{appointment.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{appointment.time}</p>
                      <p className="text-sm text-gray-600">{appointment.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Aucun rendez-vous aujourd'hui
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
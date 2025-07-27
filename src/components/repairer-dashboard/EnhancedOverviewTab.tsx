import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BlogWidget from "./BlogWidget";
import ServicesManagement from "./ServicesManagement";
import { useRepairerStats } from '@/hooks/useRepairerStats';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Order {
  id: string;
  client: string;
  device: string;
  issue: string;
  status: string;
  priority: string;
  estimatedPrice: number;
}

interface Appointment {
  id: string;
  client: string;
  time: string;
  service: string;
  phone: string;
}

interface EnhancedOverviewTabProps {
  orders: Order[];
  appointments: Appointment[];
}

const EnhancedOverviewTab: React.FC<EnhancedOverviewTabProps> = ({ orders, appointments }) => {
  const { stats, loading } = useRepairerStats();

  // Calcul des tendances (mockées pour l'exemple)
  const trends = {
    revenue: { change: 12.5, isPositive: true },
    orders: { change: -2.1, isPositive: false },
    satisfaction: { change: 0.3, isPositive: true }
  };

  const getTrendIcon = (isPositive: boolean, change: number) => {
    if (change === 0) return <Minus className="h-4 w-4 text-gray-500" />;
    return isPositive ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getTrendColor = (isPositive: boolean, change: number) => {
    if (change === 0) return 'text-gray-500';
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Première ligne - KPIs améliorés avec tendances */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CA mensuel</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : `${stats.monthlyRevenue.toFixed(0)}€`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(trends.revenue.isPositive, trends.revenue.change)}
                <span className={`text-sm ${getTrendColor(trends.revenue.isPositive, trends.revenue.change)}`}>
                  {trends.revenue.change > 0 ? '+' : ''}{trends.revenue.change}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commandes en attente</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.pendingOrders}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(trends.orders.isPositive, trends.orders.change)}
                <span className={`text-sm ${getTrendColor(trends.orders.isPositive, trends.orders.change)}`}>
                  {trends.orders.change > 0 ? '+' : ''}{trends.orders.change}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Réparations ce mois</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.completedThisMonth}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction client</p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : `${stats.customerSatisfaction.toFixed(1)}/5`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(trends.satisfaction.isPositive, trends.satisfaction.change)}
                <span className={`text-sm ${getTrendColor(trends.satisfaction.isPositive, trends.satisfaction.change)}`}>
                  {trends.satisfaction.change > 0 ? '+' : ''}{trends.satisfaction.change}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deuxième ligne - Commandes et Rendez-vous */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>Aucune commande récente</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Ajouter une commande
                  </Button>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{order.client}</h3>
                      <p className="text-sm text-gray-600">
                        {order.device} • {order.issue}
                      </p>
                      <p className="text-sm text-green-600 font-medium">{order.estimatedPrice}€</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={order.status === "En cours" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                      <Badge
                        variant={order.priority === "Urgente" ? "destructive" : "outline"}
                        className="ml-1"
                      >
                        {order.priority}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendez-vous aujourd&apos;hui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>Aucun rendez-vous aujourd'hui</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Planifier un RDV
                  </Button>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{appointment.client}</h3>
                      <p className="text-sm text-gray-600">{appointment.service}</p>
                      <p className="text-sm text-gray-500">{appointment.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{appointment.time}</p>
                      <Button size="sm" variant="outline">
                        Contacter
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Troisième ligne - Gestion des services */}
      <ServicesManagement />

      {/* Quatrième ligne - Widget Blog */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BlogWidget />
        <Card>
          <CardHeader>
            <CardTitle>Conseils du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">💡 Optimisation tarifaire</h4>
                <p className="text-sm text-blue-700">
                  Vérifiez régulièrement vos tarifs par rapport à la concurrence locale.
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">📱 Tendances réparations</h4>
                <p className="text-sm text-green-700">
                  Les réparations d'écran iPhone 14 sont en hausse ce mois-ci.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedOverviewTab;
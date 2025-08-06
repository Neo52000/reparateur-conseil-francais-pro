
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BlogWidget from "./BlogWidget";

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

interface OverviewTabSectionProps {
  orders: Order[];
  appointments: Appointment[];
}

const OverviewTabSection: React.FC<OverviewTabSectionProps> = ({ orders, appointments }) => (
  <div className="space-y-6">
    {/* Première ligne - Commandes et Rendez-vous */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Commandes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
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
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rendez-vous aujourd&apos;hui</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Deuxième ligne - Widget Blog */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BlogWidget />
      <div className="lg:block hidden">
        {/* Espace réservé pour un futur widget */}
      </div>
    </div>
  </div>
);

export default OverviewTabSection;


import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface Order {
  id: string;
  client: string;
  device: string;
  issue: string;
  status: string;
  priority: string;
  estimatedPrice: number;
}

interface OrdersTabSectionProps {
  orders: Order[];
}

const OrdersTabSection: React.FC<OrdersTabSectionProps> = ({ orders }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Gestion des commandes
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="p-6 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{order.client}</h3>
                <p className="text-gray-600">
                  {order.device} • {order.issue}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">{order.estimatedPrice}€</p>
                <Badge variant={order.status === "En cours" ? "default" : "secondary"}>
                  {order.status}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button size="sm">Mettre à jour le statut</Button>
              <Button size="sm" variant="outline">
                Envoyer message
              </Button>
              <Button size="sm" variant="outline">
                Générer facture
              </Button>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default OrdersTabSection;

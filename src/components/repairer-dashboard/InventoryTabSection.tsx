
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, AlertTriangle, TrendingUp } from "lucide-react";
import StockAlerts from "./inventory/StockAlerts";

interface InventoryItem {
  id: string;
  part: string;
  stock: number;
  minStock: number;
  price: number;
}

interface InventoryTabSectionProps {
  inventory: InventoryItem[];
}

const InventoryTabSection: React.FC<InventoryTabSectionProps> = ({ inventory }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
        <TabsTrigger value="alerts">Alertes</TabsTrigger>
        <TabsTrigger value="orders">Commandes</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Gestion des stocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{item.part}</h3>
                    <p className="text-sm text-gray-600">Prix: {item.price}€</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Stock: {item.stock}</p>
                    <Badge variant={item.stock <= item.minStock ? "destructive" : "default"}>
                      {item.stock <= item.minStock ? "Stock faible" : "En stock"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4">Ajouter une pièce</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="alerts">
        <StockAlerts />
      </TabsContent>

      <TabsContent value="orders">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Commandes de pièces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Module de commandes en développement</p>
              <p className="text-sm">Intégration API fournisseurs à venir</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Analytics des stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Analytics avancées en développement</p>
              <p className="text-sm">Prévisions et tendances à venir</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default InventoryTabSection;

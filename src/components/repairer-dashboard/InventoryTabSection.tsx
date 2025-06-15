
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

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

const InventoryTabSection: React.FC<InventoryTabSectionProps> = ({ inventory }) => (
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
);

export default InventoryTabSection;

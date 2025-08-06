
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const BillingTabSection: React.FC = () => (
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
);

export default BillingTabSection;

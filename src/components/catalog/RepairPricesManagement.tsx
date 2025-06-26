
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, AlertCircle } from 'lucide-react';

const RepairPricesManagement = () => {
  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-orange-50 rounded-lg">
        <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-orange-900 mb-2">
          Fonctionnalité en développement
        </h3>
        <p className="text-orange-700">
          La gestion de la grille tarifaire recommandée sera disponible prochainement.
          Elle permettra de définir des prix conseillés par marque/modèle/réparation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Grille tarifaire recommandée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
              <h4 className="font-medium text-blue-900">Fonctionnalités prévues :</h4>
              <ul className="mt-2 text-sm text-blue-800 list-disc list-inside space-y-1">
                <li>Prix recommandés par modèle d'appareil et type de réparation</li>
                <li>Distinction prix pièce / main d'œuvre</li>
                <li>Import/export de grilles tarifaires</li>
                <li>Comparaison avec les prix du marché</li>
                <li>Suggestions de prix basées sur la difficulté</li>
              </ul>
            </div>
            
            <div className="p-4 border-l-4 border-green-500 bg-green-50">
              <h4 className="font-medium text-green-900">Usage prévu :</h4>
              <ul className="mt-2 text-sm text-green-800 list-disc list-inside space-y-1">
                <li>Base de référence pour les réparateurs</li>
                <li>Aide à la tarification pour les nouveaux réparateurs</li>
                <li>Estimation automatique pour les clients</li>
                <li>Comparaison des prix entre réparateurs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairPricesManagement;

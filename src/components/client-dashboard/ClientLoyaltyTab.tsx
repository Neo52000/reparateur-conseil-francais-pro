
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClientLoyaltyTabProps {
  loyaltyPoints: number;
}

const ClientLoyaltyTab: React.FC<ClientLoyaltyTabProps> = ({ loyaltyPoints }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Programme de fidélité</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-blue-600">{loyaltyPoints} points</h3>
            <p className="text-gray-600">Votre solde actuel</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Comment gagner des points :</h4>
            <ul className="text-sm space-y-1">
              <li>• 1 point = 1€ dépensé</li>
              <li>• +10 points pour chaque avis laissé</li>
              <li>• +20 points pour un parrainage</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Récompenses disponibles :</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Réduction 5€</span>
                <span className="text-sm font-medium">50 points</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Réduction 10€</span>
                <span className="text-sm font-medium">100 points</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Diagnostic gratuit</span>
                <span className="text-sm font-medium">75 points</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientLoyaltyTab;

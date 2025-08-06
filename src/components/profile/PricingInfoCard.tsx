
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Euro } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface PricingInfoCardProps {
  profile: RepairerProfile;
}

const PricingInfoCard: React.FC<PricingInfoCardProps> = ({ profile }) => {
  if (!profile.pricing_info) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center">
          <Euro className="h-5 w-5 mr-2 text-green-600" />
          Informations tarifaires
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.pricing_info.diagnostic_fee && (
            <div className="flex justify-between">
              <span className="text-gray-600">Frais de diagnostic</span>
              <span className="font-medium">{profile.pricing_info.diagnostic_fee}€</span>
            </div>
          )}
          {profile.pricing_info.min_repair_cost && (
            <div className="flex justify-between">
              <span className="text-gray-600">Coût minimum</span>
              <span className="font-medium">À partir de {profile.pricing_info.min_repair_cost}€</span>
            </div>
          )}
          {profile.pricing_info.hourly_rate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tarif horaire</span>
              <span className="font-medium">{profile.pricing_info.hourly_rate}€/h</span>
            </div>
          )}
          {profile.pricing_info.free_quote && (
            <div className="flex justify-between">
              <span className="text-gray-600">Devis</span>
              <Badge className="bg-green-100 text-green-800">Gratuit</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingInfoCard;

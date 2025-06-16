
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  CheckCircle,
  Euro
} from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface ClientServicesAndPricingSectionProps {
  profile: RepairerProfile;
}

const ClientServicesAndPricingSection: React.FC<ClientServicesAndPricingSectionProps> = ({ profile }) => {
  const hasServices = profile.services_offered && profile.services_offered.length > 0;
  const hasPricing = profile.pricing_info;

  if (!hasServices && !hasPricing) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Services et tarifs</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services proposés */}
        {hasServices && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Services proposés
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {profile.services_offered!.map((service, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informations tarifaires */}
        {hasPricing && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Euro className="h-5 w-5 mr-2 text-green-600" />
                Informations tarifaires
              </h3>
              <div className="space-y-3">
                {profile.pricing_info!.diagnostic_fee && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais de diagnostic</span>
                    <span className="font-medium">{profile.pricing_info!.diagnostic_fee}€</span>
                  </div>
                )}
                {profile.pricing_info!.min_repair_cost && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coût minimum</span>
                    <span className="font-medium">À partir de {profile.pricing_info!.min_repair_cost}€</span>
                  </div>
                )}
                {profile.pricing_info!.hourly_rate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tarif horaire</span>
                    <span className="font-medium">{profile.pricing_info!.hourly_rate}€/h</span>
                  </div>
                )}
                {profile.pricing_info!.free_quote && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Devis</span>
                    <Badge className="bg-green-100 text-green-800">Gratuit</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Message si aucun service ni tarif */}
      {!hasServices && !hasPricing && (
        <div className="text-center py-8 text-gray-500">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Aucune information de service ou tarif disponible</p>
        </div>
      )}
    </div>
  );
};

export default ClientServicesAndPricingSection;

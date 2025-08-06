
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Smartphone, 
  Watch, 
  Gamepad2, 
  Laptop, 
  Settings,
  CheckCircle,
  Clock,
  Euro
} from 'lucide-react';
import { RepairerProfile, getRepairTypeLabel } from '@/types/repairerProfile';

interface ClientServicesSectionProps {
  profile: RepairerProfile;
}

const getServiceIcon = (type: string) => {
  switch (type) {
    case 'telephone':
      return <Smartphone className="h-8 w-8" />;
    case 'montre':
      return <Watch className="h-8 w-8" />;
    case 'console':
      return <Gamepad2 className="h-8 w-8" />;
    case 'ordinateur':
      return <Laptop className="h-8 w-8" />;
    default:
      return <Settings className="h-8 w-8" />;
  }
};

const getServiceDetails = (type: string) => {
  const details = {
    telephone: {
      price: 'À partir de 29€',
      duration: '30-60 min',
      common: ['Écran cassé', 'Batterie', 'Haut-parleur', 'Caméra']
    },
    montre: {
      price: 'À partir de 45€',
      duration: '1-2h',
      common: ['Bracelet', 'Écran', 'Batterie', 'Étanchéité']
    },
    console: {
      price: 'À partir de 35€',
      duration: '1-3h',
      common: ['Manette', 'Lecteur', 'Ventilateur', 'HDMI']
    },
    ordinateur: {
      price: 'À partir de 50€',
      duration: '2-4h',
      common: ['Écran', 'Clavier', 'RAM', 'Disque dur']
    },
    autres: {
      price: 'Devis gratuit',
      duration: 'Variable',
      common: ['Diagnostic', 'Conseil', 'Dépannage']
    }
  };
  
  return details[type as keyof typeof details] || details.autres;
};

const ClientServicesSection: React.FC<ClientServicesSectionProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Services proposés</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.repair_types.map((type) => {
            const details = getServiceDetails(type);
            return (
              <Card key={type} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-blue-600">
                      {getServiceIcon(type)}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {getRepairTypeLabel(type)}
                    </h3>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <Euro className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium text-green-700">{details.price}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-orange-600" />
                      <span className="text-gray-600">{details.duration}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Réparations courantes :</p>
                    <div className="flex flex-wrap gap-1">
                      {details.common.map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {profile.repair_types.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Aucun service spécifié pour le moment</p>
        </div>
      )}
    </div>
  );
};

export default ClientServicesSection;

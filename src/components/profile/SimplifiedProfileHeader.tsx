
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Eye, Lock } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface SimplifiedProfileHeaderProps {
  profile: RepairerProfile;
  onCallRepairer: () => void;
}

const SimplifiedProfileHeader: React.FC<SimplifiedProfileHeaderProps> = ({
  profile,
  onCallRepairer
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🔧</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {profile.business_name}
            </h1>
            <Badge className="bg-gray-100 text-gray-600 border-gray-200">
              <Eye className="h-3 w-3 mr-1" />
              Fiche non revendiquée
            </Badge>
          </div>
        </div>

        {/* Informations visibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Localisation</p>
                  <p className="text-gray-600">{profile.city} ({profile.postal_code})</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Téléphone</p>
                    <p className="text-gray-600">{profile.phone}</p>
                  </div>
                </div>
                <Button 
                  onClick={onCallRepairer}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  Appeler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message d'information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-center space-x-2 text-blue-800">
            <Lock className="h-4 w-4" />
            <p className="text-sm font-medium">
              Informations complètes disponibles après revendication
            </p>
          </div>
          <p className="text-blue-600 text-xs mt-1">
            Services détaillés, horaires, avis clients et plus encore...
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedProfileHeader;

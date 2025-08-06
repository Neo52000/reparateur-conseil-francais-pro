
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Home, Truck } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface ServiceOptionsCardProps {
  profile: RepairerProfile;
}

const ServiceOptionsCard: React.FC<ServiceOptionsCardProps> = ({ profile }) => {
  const hasServiceOptions = profile.emergency_service || profile.home_service || profile.pickup_service;

  if (!hasServiceOptions) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-600" />
          Options de service
        </h3>
        <div className="flex flex-wrap gap-3">
          {profile.emergency_service && (
            <Badge className="bg-red-100 text-red-800 border-red-200 px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Service d'urgence
            </Badge>
          )}
          {profile.home_service && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
              <Home className="h-4 w-4 mr-2" />
              Service à domicile
            </Badge>
          )}
          {profile.pickup_service && (
            <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
              <Truck className="h-4 w-4 mr-2" />
              Service de collecte
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceOptionsCard;

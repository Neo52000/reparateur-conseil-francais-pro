import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Phone, MessageSquare } from 'lucide-react';

interface SimplifiedProfileHeaderProps {
  profile: any;
  onCallRepairer: () => void;
}

const SimplifiedProfileHeader: React.FC<SimplifiedProfileHeaderProps> = ({
  profile,
  onCallRepairer
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {profile.business_name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {profile.city}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                Nouveau réparateur
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={onCallRepairer}
              className="bg-green-600 hover:bg-green-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              Appeler
            </Button>
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile.repair_types?.slice(0, 3).map((service: string, index: number) => (
            <Badge key={index} variant="outline">
              {service}
            </Badge>
          ))}
          <Badge variant="outline" className="text-gray-500">
            +{Math.max(0, (profile.repair_types?.length || 0) - 3)} autres services
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplifiedProfileHeader;
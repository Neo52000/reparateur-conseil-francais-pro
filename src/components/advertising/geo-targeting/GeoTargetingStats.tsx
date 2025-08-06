
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Circle, MapPin, Map } from 'lucide-react';
import { GeoTargetingZone } from '@/types/advancedAdvertising';

interface GeoTargetingStatsProps {
  zones: GeoTargetingZone[];
}

const GeoTargetingStats: React.FC<GeoTargetingStatsProps> = ({ zones }) => {
  // Calculate zone counts with proper type handling
  const radiusZonesCount = zones.filter(zone => zone.type === 'radius').length;
  const cityZonesCount = zones.filter(zone => zone.type === 'city').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Zones actives</p>
              <p className="text-2xl font-bold">{zones.length}</p>
            </div>
            <Globe className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Zones circulaires</p>
              <p className="text-2xl font-bold">{radiusZonesCount}</p>
            </div>
            <Circle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Villes ciblées</p>
              <p className="text-2xl font-bold">{cityZonesCount}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Portée estimée</p>
              <p className="text-2xl font-bold">12.5K</p>
            </div>
            <Map className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeoTargetingStats;

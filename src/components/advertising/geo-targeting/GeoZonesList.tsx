
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin, Circle, Map } from 'lucide-react';
import { GeoTargetingZone } from '@/types/advancedAdvertising';

interface GeoZonesListProps {
  zones: GeoTargetingZone[];
  loading: boolean;
}

const GeoZonesList: React.FC<GeoZonesListProps> = ({ zones, loading }) => {
  const getZoneIcon = (type: string) => {
    switch (type) {
      case 'radius': return Circle;
      case 'city': return MapPin;
      case 'region': return Map;
      default: return Globe;
    }
  };

  const getZoneTypeLabel = (type: string) => {
    switch (type) {
      case 'radius': return 'Zone circulaire';
      case 'city': return 'Ville';
      case 'postal_code': return 'Code postal';
      case 'region': return 'Région';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">Chargement des zones...</div>
    );
  }

  if (zones.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune zone de géociblage configurée</p>
          <p className="text-sm text-gray-500 mt-2">
            Créez votre première zone pour commencer le ciblage géographique
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {zones.map((zone) => {
        const IconComponent = getZoneIcon(zone.type);
        const hasCoordinates = zone.coordinates && typeof zone.coordinates === 'object';
        const isRadiusZone = zone.type === 'radius';
        
        return (
          <Card key={zone.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">{zone.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {getZoneTypeLabel(zone.type)}
                      </Badge>
                      {isRadiusZone && hasCoordinates && (
                        <Badge variant="secondary">
                          Rayon: {(zone.coordinates as any)?.radius || 0}km
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={zone.is_active ? "default" : "secondary"}>
                    {zone.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                </div>
              </div>
              
              {isRadiusZone && hasCoordinates && (
                <div className="mt-4 text-sm text-gray-600">
                  Centre: {(zone.coordinates as any)?.lat?.toFixed(4) || 0}, {(zone.coordinates as any)?.lng?.toFixed(4) || 0}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default GeoZonesList;

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import { Crown, MapPin, Euro } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

interface ExclusivityZone {
  id: string;
  city_slug: string;
  city_name: string;
  postal_codes: string[];
  radius_km: number;
  monthly_price: number;
  is_active: boolean;
  repairer_id: string | null;
}

interface ExclusivityZoneMapProps {
  zones: ExclusivityZone[];
  onZoneClick?: (zone: ExclusivityZone) => void;
}

// Coordonnées approximatives des villes françaises
const cityCoordinates: Record<string, [number, number]> = {
  'paris': [48.8566, 2.3522],
  'lyon': [45.7640, 4.8357],
  'marseille': [43.2965, 5.3698],
  'toulouse': [43.6047, 1.4442],
  'nice': [43.7102, 7.2620],
  'nantes': [47.2184, -1.5536],
  'strasbourg': [48.5734, 7.7521],
  'montpellier': [43.6108, 3.8767],
  'bordeaux': [44.8378, -0.5792],
  'lille': [50.6292, 3.0573],
  'rennes': [48.1173, -1.6778],
  'reims': [49.2583, 4.0317],
  'saint-etienne': [45.4397, 4.3872],
  'le-havre': [49.4944, 0.1079],
  'toulon': [43.1242, 5.9280],
  'grenoble': [45.1885, 5.7245],
  'dijon': [47.3220, 5.0415],
  'angers': [47.4784, -0.5632],
  'nimes': [43.8367, 4.3601],
  'aix-en-provence': [43.5297, 5.4474]
};

const getZoneCoordinates = (zone: ExclusivityZone): [number, number] | null => {
  const slug = zone.city_slug.toLowerCase();
  
  // Chercher dans les coordonnées connues
  if (cityCoordinates[slug]) {
    return cityCoordinates[slug];
  }
  
  // Essayer de trouver une correspondance partielle
  const matchingKey = Object.keys(cityCoordinates).find(key => 
    slug.includes(key) || key.includes(slug)
  );
  
  if (matchingKey) {
    return cityCoordinates[matchingKey];
  }
  
  // Position par défaut (centre France)
  return [46.6034, 1.8883];
};

const MapController: React.FC<{ zones: ExclusivityZone[] }> = ({ zones }) => {
  const map = useMap();
  
  useEffect(() => {
    if (zones.length > 0) {
      const bounds: [number, number][] = zones
        .map(z => getZoneCoordinates(z))
        .filter((coords): coords is [number, number] => coords !== null);
      
      if (bounds.length > 0) {
        map.fitBounds(bounds as any, { padding: [50, 50] });
      }
    }
  }, [zones, map]);
  
  return null;
};

const ExclusivityZoneMap: React.FC<ExclusivityZoneMapProps> = ({ zones, onZoneClick }) => {
  const defaultCenter: [number, number] = [46.6034, 1.8883]; // Centre de la France
  
  return (
    <div className="h-96 rounded-lg overflow-hidden border">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController zones={zones} />
        
        {zones.map((zone) => {
          const coords = getZoneCoordinates(zone);
          if (!coords) return null;
          
          const isAssigned = !!zone.repairer_id;
          const color = isAssigned ? '#f59e0b' : '#22c55e'; // Amber for assigned, green for available
          
          return (
            <Circle
              key={zone.id}
              center={coords}
              radius={zone.radius_km * 1000}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.2,
                weight: 2
              }}
              eventHandlers={{
                click: () => onZoneClick?.(zone)
              }}
            >
              <Popup>
                <div className="p-2 min-w-48">
                  <div className="flex items-center gap-2 mb-2">
                    {isAssigned ? (
                      <Crown className="w-5 h-5 text-amber-500" />
                    ) : (
                      <MapPin className="w-5 h-5 text-green-500" />
                    )}
                    <span className="font-bold text-lg">{zone.city_name}</span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rayon:</span>
                      <span className="font-medium">{zone.radius_km} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prix/mois:</span>
                      <span className="font-medium">{zone.monthly_price}€</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Statut:</span>
                      {isAssigned ? (
                        <Badge className="bg-amber-100 text-amber-800">
                          Exclusif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Disponible
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {zone.postal_codes.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Codes postaux:</p>
                      <div className="flex flex-wrap gap-1">
                        {zone.postal_codes.slice(0, 5).map((code, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {code}
                          </Badge>
                        ))}
                        {zone.postal_codes.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{zone.postal_codes.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ExclusivityZoneMap;

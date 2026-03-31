import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { MapPin, Star } from 'lucide-react';

// Fix default marker icon for Leaflet in bundled environments
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface Repairer {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  address: string;
}

interface LocalRepairerMapProps {
  city: string;
  repairers: Repairer[];
}

export default function LocalRepairerMap({ city, repairers }: LocalRepairerMapProps) {
  if (repairers.length === 0) return null;

  const centerLat = repairers.reduce((sum, r) => sum + r.latitude, 0) / repairers.length;
  const centerLng = repairers.reduce((sum, r) => sum + r.longitude, 0) / repairers.length;

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Nos réparateurs à {city}</h2>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={12}
            className="w-full h-[500px] rounded-lg shadow-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {repairers.map((repairer) => (
              <Marker
                key={repairer.id}
                position={[repairer.latitude, repairer.longitude]}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold">{repairer.name}</h3>
                    <p className="text-sm">{repairer.rating}/5 ⭐</p>
                    <p className="text-xs text-gray-600">{repairer.address}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {repairers.slice(0, 3).map((repairer) => (
            <Card key={repairer.id} className="p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold">{repairer.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm">{repairer.rating}/5</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{repairer.address}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

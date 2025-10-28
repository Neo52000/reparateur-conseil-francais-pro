import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { MapPin, Star } from 'lucide-react';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || repairers.length === 0 || map.current) return;

    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';
    
    if (!MAPBOX_TOKEN) {
      console.error('⚠️ Token Mapbox non configuré (VITE_MAPBOX_PUBLIC_TOKEN)');
      return;
    }
    
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const centerLat = repairers.reduce((sum, r) => sum + r.latitude, 0) / repairers.length;
    const centerLng = repairers.reduce((sum, r) => sum + r.longitude, 0) / repairers.length;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerLng, centerLat],
      zoom: 12
    });

    repairers.forEach((repairer) => {
      new mapboxgl.Marker({ color: '#2563EB' })
        .setLngLat([repairer.longitude, repairer.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-bold">${repairer.name}</h3>
              <p class="text-sm">${repairer.rating}/5 ⭐</p>
              <p class="text-xs text-gray-600">${repairer.address}</p>
            </div>
          `)
        )
        .addTo(map.current!);
    });

    return () => map.current?.remove();
  }, [city, repairers]);

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Nos réparateurs à {city}</h2>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div ref={mapContainer} className="w-full h-[500px] rounded-lg shadow-lg" />
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

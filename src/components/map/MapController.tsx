
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useMapStore } from '@/stores/mapStore';

const MapController: React.FC = () => {
  const map = useMap();
  const { center, zoom, repairers, userLocation } = useMapStore();

  // Update map view when center/zoom changes
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  // Fit bounds when repairers change
  useEffect(() => {
    if (repairers.length > 0) {
      const bounds = repairers
        .filter(r => r.lat && r.lng)
        .map(r => [r.lat!, r.lng!] as [number, number]);
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, repairers]);

  // Center on user location when available
  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 14, { duration: 1.5 });
    }
  }, [map, userLocation]);

  return null;
};

export default MapController;

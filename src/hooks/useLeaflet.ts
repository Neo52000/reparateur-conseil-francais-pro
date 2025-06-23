
import { useRef, useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import { Repairer } from '@/types/repairer';
import { createPopupContent } from '@/utils/leaflet/leafletPopups';
import { createMarkerStyles } from '@/utils/leaflet/leafletStyles';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const useLeaflet = (
  repairers: Repairer[],
  onMarkerClick?: (repairer: Repairer) => void,
  onMarkerMouseEnter?: (repairer: Repairer, event: MouseEvent) => void,
  onMarkerMouseLeave?: () => void
) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<{ [key: string]: L.Marker }>({});
  const [selectedRepairer, setSelectedRepairer] = useState<Repairer | null>(null);

  const initializeMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = L.map(mapContainer.current).setView([48.8566, 2.3522], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.current);

      createMarkerStyles();
      console.log('Carte Leaflet initialisée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
    }
  }, []);

  useEffect(() => {
    initializeMap();
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initializeMap]);

  useEffect(() => {
    if (!map.current || !repairers.length) return;

    // Supprimer les anciens marqueurs
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    console.log(`Mise à jour de ${repairers.length} marqueurs sur la carte`);

    const bounds = L.latLngBounds([]);
    let validRepairers = 0;

    repairers.forEach((repairer) => {
      if (!repairer.lat || !repairer.lng) return;

      const markerIcon = L.divIcon({
        html: '📱',
        className: 'custom-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([repairer.lat, repairer.lng], { icon: markerIcon })
        .addTo(map.current!);

      const popup = L.popup({
        maxWidth: 320,
        closeButton: true
      }).setContent(createPopupContent(repairer));

      marker.bindPopup(popup);

      // Événements
      if (onMarkerClick) {
        marker.on('click', () => {
          onMarkerClick(repairer);
        });
      }

      if (onMarkerMouseEnter) {
        marker.on('mouseover', (e: any) => {
          onMarkerMouseEnter(repairer, e.originalEvent);
        });
      }

      if (onMarkerMouseLeave) {
        marker.on('mouseout', onMarkerMouseLeave);
      }

      markers.current[repairer.id] = marker;
      bounds.extend([repairer.lat, repairer.lng]);
      validRepairers++;
    });

    // Ajuster la vue pour inclure tous les marqueurs
    if (validRepairers > 0) {
      map.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [repairers, onMarkerClick, onMarkerMouseEnter, onMarkerMouseLeave]);

  const centerOnLocation = useCallback((lng: number, lat: number, zoom = 14) => {
    if (map.current) {
      map.current.flyTo([lat, lng], zoom, { duration: 1.5 });
    }
  }, []);

  return {
    mapContainer,
    map: map.current,
    selectedRepairer,
    setSelectedRepairer,
    centerOnLocation,
    initializeMap
  };
};

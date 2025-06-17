
import { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { Repairer } from '@/types/repairer';
import { createMarkerElement, updateMarkerElement } from '@/utils/mapboxMarkers';
import { createPopupContent } from '@/utils/mapboxPopups';
import { mapboxStyles } from '@/utils/mapboxStyles';

export const useMapbox = (
  mapboxToken: string,
  repairers: Repairer[],
  onMarkerClick?: (repairer: Repairer) => void,
  onMarkerMouseEnter?: (repairer: Repairer, event: MouseEvent) => void,
  onMarkerMouseLeave?: () => void
) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [selectedRepairer, setSelectedRepairer] = useState<Repairer | null>(null);

  const initializeMap = useCallback(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapboxStyles.light,
        center: [2.3522, 48.8566], // Paris par défaut
        zoom: 10,
        projection: 'mercator'
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        console.log('Carte Mapbox initialisée avec succès');
      });

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
    }
  }, [mapboxToken]);

  // Initialiser la carte
  useEffect(() => {
    initializeMap();
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initializeMap]);

  // Mettre à jour les marqueurs
  useEffect(() => {
    if (!map.current || !repairers.length) return;

    // Supprimer les anciens marqueurs
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    console.log(`Mise à jour de ${repairers.length} marqueurs sur la carte`);

    // Ajouter les nouveaux marqueurs
    repairers.forEach((repairer) => {
      if (!repairer.latitude || !repairer.longitude) return;

      const markerElement = createMarkerElement(repairer);
      
      // Ajouter les événements de survol et clic
      if (onMarkerMouseEnter) {
        markerElement.addEventListener('mouseenter', (e) => {
          onMarkerMouseEnter(repairer, e as MouseEvent);
        });
      }

      if (onMarkerMouseLeave) {
        markerElement.addEventListener('mouseleave', onMarkerMouseLeave);
      }

      if (onMarkerClick) {
        markerElement.addEventListener('click', () => {
          onMarkerClick(repairer);
        });
      }

      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat([repairer.longitude, repairer.latitude])
        .addTo(map.current!);

      // Ajouter un popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false
      }).setHTML(createPopupContent(repairer));

      marker.setPopup(popup);
      markers.current[repairer.id] = marker;
    });

    // Ajuster la vue pour inclure tous les marqueurs
    if (repairers.length > 0) {
      const validRepairers = repairers.filter(r => r.latitude && r.longitude);
      if (validRepairers.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        validRepairers.forEach(repairer => {
          bounds.extend([repairer.longitude!, repairer.latitude!]);
        });

        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15
        });
      }
    }
  }, [repairers, onMarkerClick, onMarkerMouseEnter, onMarkerMouseLeave]);

  const centerOnLocation = useCallback((lng: number, lat: number, zoom = 14) => {
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom,
        duration: 1500
      });
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

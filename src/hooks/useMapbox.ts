
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useToast } from '@/hooks/use-toast';
import { RepairerDB } from '@/hooks/useRepairers';
import { MAP_CONFIG } from '@/constants/repairers';
import { addMarkersToMap, clearMapMarkers } from '@/utils/mapboxMarkers';

export const useMapbox = (mapboxToken: string, repairers: RepairerDB[]) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedRepairer, setSelectedRepairer] = useState<RepairerDB | null>(null);
  const { toast } = useToast();

  const handleMarkerClick = (repairer: RepairerDB) => {
    setSelectedRepairer(repairer);
  };

  const clearMap = () => {
    if (map.current) {
      clearMapMarkers();
    }
  };

  const updateMapMarkers = () => {
    if (map.current && repairers.length > 0) {
      console.log('Repairers data changed, updating markers...');
      clearMap();
      addMarkersToMap(map.current, repairers, handleMarkerClick);
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken.trim() || map.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: MAP_CONFIG.DEFAULT_CENTER,
        zoom: MAP_CONFIG.DEFAULT_ZOOM
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        console.log('Map loaded, adding markers...');
        updateMapMarkers();
      });

      // Écouter les messages pour ouvrir les profils
      window.addEventListener('message', (event) => {
        if (event.data.type === 'viewProfile') {
          setSelectedRepairer(repairers.find(r => r.id === event.data.repairerId) || null);
        }
      });

      toast({
        title: "Carte initialisée",
        description: `Carte chargée avec ${repairers.length} réparateurs.`,
      });

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser la carte. Vérifiez votre token Mapbox.",
        variant: "destructive"
      });
    }
  };

  // Effet pour réinitialiser les markers quand les repairers changent
  useEffect(() => {
    updateMapMarkers();
  }, [repairers]);

  useEffect(() => {
    if (mapboxToken.trim()) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  return {
    mapContainer,
    map: map.current,
    selectedRepairer,
    initializeMap
  };
};

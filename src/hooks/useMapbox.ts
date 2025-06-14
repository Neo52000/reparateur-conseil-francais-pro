
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useToast } from '@/hooks/use-toast';
import { Repairer } from '@/types/repairer';
import { MAP_CONFIG } from '@/constants/repairers';

export const useMapbox = (mapboxToken: string, repairers: Repairer[]) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedRepairer, setSelectedRepairer] = useState<Repairer | null>(null);
  const { toast } = useToast();

  const createPopupContent = (repairer: Repairer) => {
    return `
      <div class="p-3">
        <h3 class="font-semibold text-lg">${repairer.name}</h3>
        <p class="text-sm text-gray-600 mb-2">${repairer.address}</p>
        <div class="flex items-center mb-2">
          <span class="text-yellow-500">★</span>
          <span class="ml-1 text-sm">${repairer.rating} (${repairer.reviewCount} avis)</span>
        </div>
        <div class="text-sm">
          <p><strong>Services:</strong> ${repairer.services.join(', ')}</p>
          <p><strong>Prix:</strong> ${repairer.averagePrice}</p>
          <p><strong>Temps de réponse:</strong> ${repairer.responseTime}</p>
        </div>
      </div>
    `;
  };

  const createMarkerElement = () => {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    markerElement.style.width = '30px';
    markerElement.style.height = '30px';
    markerElement.style.borderRadius = '50%';
    markerElement.style.backgroundColor = '#3B82F6';
    markerElement.style.border = '2px solid white';
    markerElement.style.cursor = 'pointer';
    markerElement.style.display = 'flex';
    markerElement.style.alignItems = 'center';
    markerElement.style.justifyContent = 'center';
    markerElement.style.color = 'white';
    markerElement.style.fontSize = '12px';
    markerElement.style.fontWeight = 'bold';
    markerElement.innerHTML = '📱';
    return markerElement;
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

      repairers.forEach((repairer) => {
        const markerElement = createMarkerElement();
        const popupContent = createPopupContent(repairer);

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false
        }).setHTML(popupContent);

        new mapboxgl.Marker(markerElement)
          .setLngLat([repairer.lng, repairer.lat])
          .setPopup(popup)
          .addTo(map.current!);

        markerElement.addEventListener('click', () => {
          setSelectedRepairer(repairer);
        });
      });

      toast({
        title: "Carte initialisée",
        description: "La carte Mapbox a été chargée avec succès.",
      });

      console.log('Map initialized with', repairers.length, 'markers');
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser la carte. Vérifiez votre token Mapbox.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (mapboxToken.trim()) {
      initializeMap();
    }
  }, [mapboxToken]);

  return {
    mapContainer,
    map: map.current,
    selectedRepairer,
    initializeMap
  };
};

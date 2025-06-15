
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useToast } from '@/hooks/use-toast';
import { RepairerDB } from '@/hooks/useRepairers';
import { MAP_CONFIG } from '@/constants/repairers';

export const useMapbox = (mapboxToken: string, repairers: RepairerDB[]) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedRepairer, setSelectedRepairer] = useState<RepairerDB | null>(null);
  const { toast } = useToast();

  const createPopupContent = (repairer: RepairerDB) => {
    const displayPrice = repairer.price_range === 'low' ? '€' : repairer.price_range === 'medium' ? '€€' : '€€€';
    
    return `
      <div class="p-4 min-w-[280px]">
        <h3 class="font-semibold text-lg mb-2">${repairer.name}</h3>
        <p class="text-sm text-gray-600 mb-3">${repairer.address}, ${repairer.city}</p>
        ${repairer.rating ? `
          <div class="flex items-center mb-3">
            <span class="text-yellow-500 mr-1">★</span>
            <span class="text-sm">${repairer.rating}/5 (${repairer.review_count || 0} avis)</span>
          </div>
        ` : ''}
        <div class="text-sm space-y-1">
          <p><strong>Services:</strong> ${repairer.services && repairer.services.length > 0 ? repairer.services.join(', ') : 'Réparation générale'}</p>
          <p><strong>Prix:</strong> ${displayPrice}</p>
          ${repairer.response_time ? `<p><strong>Temps de réponse:</strong> ${repairer.response_time}</p>` : ''}
          ${repairer.phone ? `<p><strong>Téléphone:</strong> ${repairer.phone}</p>` : ''}
        </div>
        <div class="mt-3 pt-3 border-t">
          <button class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors" onclick="window.parent.postMessage({type: 'viewProfile', repairerId: '${repairer.id}'}, '*')">
            Voir le profil
          </button>
        </div>
      </div>
    `;
  };

  const createMarkerElement = (repairer: RepairerDB) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    
    // Styles de base pour éviter tout déplacement
    markerElement.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #3B82F6;
      border: 3px solid white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      position: relative;
      z-index: 1;
    `;
    markerElement.innerHTML = '📱';
    
    // Utiliser des pseudo-éléments CSS pour l'effet hover sans affecter la position
    const style = document.createElement('style');
    style.textContent = `
      .custom-marker:hover {
        background-color: #2563EB !important;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
        z-index: 1000 !important;
      }
    `;
    document.head.appendChild(style);
    
    return markerElement;
  };

  const clearMap = () => {
    if (map.current) {
      // Supprimer tous les markers et popups existants
      const markers = document.querySelectorAll('.custom-marker');
      markers.forEach(marker => marker.remove());
      
      // Fermer tous les popups ouverts
      const popups = document.querySelectorAll('.mapboxgl-popup');
      popups.forEach(popup => popup.remove());
    }
  };

  const addMarkersToMap = () => {
    if (!map.current || !repairers.length) return;

    console.log('Adding markers for', repairers.length, 'repairers');

    repairers.forEach((repairer, index) => {
      // Vérifier que le réparateur a des coordonnées valides
      if (!repairer.lat || !repairer.lng) {
        console.warn(`Repairer ${repairer.name} has invalid coordinates:`, { lat: repairer.lat, lng: repairer.lng });
        return;
      }

      const markerElement = createMarkerElement(repairer);
      const popupContent = createPopupContent(repairer);

      const popup = new mapboxgl.Popup({
        offset: 35,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '320px'
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([Number(repairer.lng), Number(repairer.lat)])
        .setPopup(popup)
        .addTo(map.current!);

      // Event listener pour le clic sur le marker
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedRepairer(repairer);
        console.log('Marker clicked for repairer:', repairer.name);
        
        // Centrer la carte sur le marker cliqué
        map.current?.flyTo({
          center: [Number(repairer.lng), Number(repairer.lat)],
          zoom: Math.max(map.current.getZoom(), 14),
          duration: 1000
        });
      });

      console.log(`Added marker ${index + 1} for ${repairer.name} at [${repairer.lng}, ${repairer.lat}]`);
    });
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
        addMarkersToMap();
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
    if (map.current && repairers.length > 0) {
      console.log('Repairers data changed, updating markers...');
      clearMap();
      addMarkersToMap();
    }
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

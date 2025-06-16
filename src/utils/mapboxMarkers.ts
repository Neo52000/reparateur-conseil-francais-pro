
import mapboxgl from 'mapbox-gl';
import { RepairerDB } from '@/hooks/useRepairers';
import { createPopupContent } from './mapboxPopups';
import { createMarkerStyles, getMarkerBaseStyles } from './mapboxStyles';

export const createMarkerElement = (repairer: RepairerDB): HTMLDivElement => {
  const markerElement = document.createElement('div');
  markerElement.className = 'custom-marker';
  
  // Styles de base pour éviter tout déplacement
  markerElement.style.cssText = getMarkerBaseStyles();
  markerElement.innerHTML = '📱';
  
  // Ajouter les styles CSS pour l'effet hover
  createMarkerStyles();
  
  return markerElement;
};

export const addMarkersToMap = (
  map: mapboxgl.Map,
  repairers: RepairerDB[],
  onMarkerClick: (repairer: RepairerDB) => void
) => {
  if (!map || !repairers.length) return;

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
      .addTo(map);

    // Event listener pour le clic sur le marker
    markerElement.addEventListener('click', (e) => {
      e.stopPropagation();
      onMarkerClick(repairer);
      console.log('Marker clicked for repairer:', repairer.name);
      
      // Centrer la carte sur le marker cliqué
      map.flyTo({
        center: [Number(repairer.lng), Number(repairer.lat)],
        zoom: Math.max(map.getZoom(), 14),
        duration: 1000
      });
    });

    console.log(`Added marker ${index + 1} for ${repairer.name} at [${repairer.lng}, ${repairer.lat}]`);
  });
};

export const clearMapMarkers = () => {
  // Supprimer tous les markers et popups existants
  const markers = document.querySelectorAll('.custom-marker');
  markers.forEach(marker => marker.remove());
  
  // Fermer tous les popups ouverts
  const popups = document.querySelectorAll('.mapboxgl-popup');
  popups.forEach(popup => popup.remove());
};

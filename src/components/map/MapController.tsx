
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

  // Fit bounds when repairers change (optimisé pour tous les réparateurs)
  useEffect(() => {
    if (repairers.length > 0) {
      try {
        // Récupérer toutes les positions (même les positions par défaut)
        const allPositions = repairers
          .filter(r => r.lat && r.lng && typeof r.lat === 'number' && typeof r.lng === 'number')
          .map(r => [r.lat!, r.lng!] as [number, number]);
        
        if (allPositions.length > 0) {
          // Si on a beaucoup de points, on ajuste le zoom pour tous les voir
          if (allPositions.length > 10) {
            map.fitBounds(allPositions, { 
              padding: [20, 20],
              maxZoom: 10 // Limiter le zoom pour voir plus de réparateurs
            });
          } else {
            map.fitBounds(allPositions, { padding: [50, 50] });
          }
        }
      } catch (error) {
        console.warn('Erreur lors de l\'ajustement des bounds:', error);
      }
    }
  }, [map, repairers]);

  // Center on user location when available (priorité utilisateur)
  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 12, { duration: 1.5 });
    }
  }, [map, userLocation]);

  return null;
};

export default MapController;


import React from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useMapStore } from '@/stores/mapStore';
import SimpleRepairerMarker from './SimpleRepairerMarker';
import UserLocationMarker from './UserLocationMarker';
import MapController from './MapController';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les markers Leaflet avec Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Conteneur de carte simplifié
 * Version allégée pour éviter les erreurs de rendu
 */
const RepairersMapContainer: React.FC = () => {
  const { center, zoom, repairers } = useMapStore();

  // Filtrage simple des réparateurs avec coordonnées valides
  const validRepairers = React.useMemo(() => {
    try {
      return repairers.filter(repairer => {
        if (!repairer) return false;
        
        const hasValidCoords = 
          typeof repairer.lat === 'number' && 
          typeof repairer.lng === 'number' &&
          !isNaN(repairer.lat) && 
          !isNaN(repairer.lng) &&
          Math.abs(repairer.lat) <= 90 && 
          Math.abs(repairer.lng) <= 180;
        
        return hasValidCoords;
      });
    } catch (error) {
      console.warn('Error filtering repairers:', error);
      return [];
    }
  }, [repairers]);

  console.log(`Carte: ${validRepairers.length} réparateurs valides sur ${repairers.length} total`);

  try {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg relative">
        <LeafletMapContainer
          center={center}
          zoom={zoom}
          className="w-full h-full rounded-lg"
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController />
          <UserLocationMarker />
          
          <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            spiderfyOnMaxZoom={true}
            removeOutsideVisibleBounds={true}
          >
            {validRepairers.map((repairer) => (
              <SimpleRepairerMarker 
                key={repairer.id} 
                repairer={repairer}
              />
            ))}
          </MarkerClusterGroup>
        </LeafletMapContainer>
      </div>
    );
  } catch (error) {
    console.error('Erreur critique dans MapContainer:', error);
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Carte temporairement indisponible</p>
          <p className="text-sm text-gray-500">Rechargement automatique en cours...</p>
        </div>
      </div>
    );
  }
};

export default RepairersMapContainer;

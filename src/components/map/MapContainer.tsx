
import React from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useMapStore, MapRepairer } from '@/stores/mapStore';
import SimpleRepairerMarker from './SimpleRepairerMarker';
import UserLocationMarker from './UserLocationMarker';
import MapController from './MapController';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Type étendu pour les réparateurs avec coordonnées calculées
interface MapRepairerWithCoordinates extends MapRepairer {
  hasRealCoordinates?: boolean;
}

// Fix pour les markers Leaflet avec Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Positions par défaut pour les réparateurs sans coordonnées
const FALLBACK_POSITIONS = [
  [48.8566, 2.3522], // Paris
  [45.7640, 4.8357], // Lyon
  [43.2965, 5.3698], // Marseille
  [44.8378, -0.5792], // Bordeaux
  [47.2184, -1.5536], // Nantes
  [50.6292, 3.0573], // Lille
  [43.6047, 1.4442], // Toulouse
  [49.2628, 4.0347], // Reims
  [47.3220, 5.0415], // Dijon
  [48.1173, -1.6778], // Rennes
  [45.1667, 5.7167], // Grenoble
  [43.7102, 7.2620], // Nice
];

/**
 * Conteneur de carte optimisé
 * Affiche TOUS les réparateurs avec positions par défaut si nécessaire
 */
const RepairersMapContainer: React.FC = () => {
  const { center, zoom, repairers } = useMapStore();

  // Préparation des réparateurs avec positions par défaut
  const displayableRepairers = React.useMemo(() => {
    console.log(`MapContainer: Processing ${repairers.length} repairers for display`);
    
    try {
      return repairers.map((repairer, index): MapRepairerWithCoordinates => {
        // Vérifier si le réparateur a des coordonnées valides
        const hasValidCoords = repairer.lat && 
                              repairer.lng && 
                              typeof repairer.lat === 'number' && 
                              typeof repairer.lng === 'number' &&
                              !isNaN(repairer.lat) && 
                              !isNaN(repairer.lng) &&
                              Math.abs(repairer.lat) <= 90 && 
                              Math.abs(repairer.lng) <= 180;

        if (hasValidCoords) {
          return {
            ...repairer,
            hasRealCoordinates: true
          };
        }

        // Assigner une position par défaut
        const fallbackIndex = index % FALLBACK_POSITIONS.length;
        const [fallbackLat, fallbackLng] = FALLBACK_POSITIONS[fallbackIndex];

        // Ajouter un petit offset pour éviter la superposition exacte
        const offsetLat = fallbackLat + (Math.random() - 0.5) * 0.05;
        const offsetLng = fallbackLng + (Math.random() - 0.5) * 0.05;

        console.log(`MapContainer: Using fallback coordinates for ${repairer.name}: [${offsetLat}, ${offsetLng}]`);

        return {
          ...repairer,
          lat: offsetLat,
          lng: offsetLng,
          hasRealCoordinates: false
        };
      });
    } catch (error) {
      console.warn('MapContainer: Error preparing repairers for display:', error);
      return [];
    }
  }, [repairers]);

  const realCoordsCount = displayableRepairers.filter(r => r.hasRealCoordinates !== false).length;
  const fallbackCoordsCount = displayableRepairers.length - realCoordsCount;

  console.log(`MapContainer: ${displayableRepairers.length} repairers ready for display`);
  console.log(`MapContainer: ${realCoordsCount} with real coordinates, ${fallbackCoordsCount} with fallback coordinates`);

  try {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg relative">
        {/* Indicateur de chargement */}
        {displayableRepairers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Chargement des réparateurs...</p>
            </div>
          </div>
        )}

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
          
          {displayableRepairers.length > 0 && (
            <MarkerClusterGroup
              chunkedLoading
              showCoverageOnHover={false}
              spiderfyOnMaxZoom={true}
              removeOutsideVisibleBounds={true}
              maxClusterRadius={50}
            >
              {displayableRepairers.map((repairer) => (
                <SimpleRepairerMarker 
                  key={repairer.id} 
                  repairer={repairer}
                />
              ))}
            </MarkerClusterGroup>
          )}
        </LeafletMapContainer>

        {/* Informations sur les coordonnées */}
        {displayableRepairers.length > 0 && (
          <div className="absolute bottom-2 right-2 bg-white p-2 rounded text-xs text-gray-600 shadow-lg">
            <div>{displayableRepairers.length} réparateur{displayableRepairers.length > 1 ? 's' : ''}</div>
            {fallbackCoordsCount > 0 && (
              <div className="text-orange-600">
                📍 {fallbackCoordsCount} position{fallbackCoordsCount > 1 ? 's' : ''} approximative{fallbackCoordsCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('MapContainer: Critical error in render:', error);
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

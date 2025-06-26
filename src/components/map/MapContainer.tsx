
import React from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useMapStore } from '@/stores/mapStore';
import SimpleRepairerMarker from './SimpleRepairerMarker';
import UserLocationMarker from './UserLocationMarker';
import MapController from './MapController';
import L from 'leaflet';
import { RepairerWithCoordinates } from '@/types/repairer';
import 'leaflet/dist/leaflet.css';

// Fix pour les markers Leaflet avec Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Centre de la France par défaut
const FRANCE_CENTER: [number, number] = [46.8566, 2.3522];

/**
 * Conteneur de carte optimisé
 * Affiche TOUS les réparateurs avec positions par défaut si nécessaire
 */
const RepairersMapContainer: React.FC = () => {
  const { center, zoom, repairers } = useMapStore();

  // Préparation des réparateurs avec positions par défaut
  const displayableRepairers = React.useMemo(() => {
    try {
      return repairers.map((repairer, index): RepairerWithCoordinates => {
        // Si le réparateur a des coordonnées valides, on les utilise
        if (repairer.lat && repairer.lng && 
            typeof repairer.lat === 'number' && 
            typeof repairer.lng === 'number' &&
            !isNaN(repairer.lat) && 
            !isNaN(repairer.lng) &&
            Math.abs(repairer.lat) <= 90 && 
            Math.abs(repairer.lng) <= 180) {
          return {
            ...repairer,
            hasRealCoordinates: true
          };
        }

        // Sinon, on assigne une position par défaut basée sur la ville ou l'index
        const fallbackPositions = [
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
        ];

        const fallbackIndex = index % fallbackPositions.length;
        const [fallbackLat, fallbackLng] = fallbackPositions[fallbackIndex];

        // Ajout d'un petit offset pour éviter la superposition
        const offsetLat = fallbackLat + (Math.random() - 0.5) * 0.1;
        const offsetLng = fallbackLng + (Math.random() - 0.5) * 0.1;

        return {
          ...repairer,
          lat: offsetLat,
          lng: offsetLng,
          hasRealCoordinates: false
        };
      });
    } catch (error) {
      console.warn('Erreur lors de la préparation des réparateurs:', error);
      return [];
    }
  }, [repairers]);

  console.log(`Carte: ${displayableRepairers.length} réparateurs affichables sur ${repairers.length} total`);
  console.log(`Réparateurs avec vraies coordonnées: ${displayableRepairers.filter(r => r.hasRealCoordinates !== false).length}`);

  try {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg relative">
        {/* Indicateur de chargement si pas de réparateurs */}
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
        </LeafletMapContainer>

        {/* Légende pour les positions par défaut */}
        {displayableRepairers.some(r => r.hasRealCoordinates === false) && (
          <div className="absolute bottom-2 right-2 bg-white p-2 rounded text-xs text-gray-600 shadow-lg">
            <p>🔍 Certains réparateurs utilisent des positions approximatives</p>
          </div>
        )}
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

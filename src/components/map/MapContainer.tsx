
import React, { useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useMapStore } from '@/stores/mapStore';
import { useRepairerSubscriptions } from '@/hooks/useRepairerSubscriptions';
import RepairerMarker from './RepairerMarker';
import UserLocationMarker from './UserLocationMarker';
import MapController from './MapController';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RepairersMapContainer: React.FC = () => {
  const { center, zoom, repairers } = useMapStore();
  const { getSubscriptionTier, loading: subscriptionsLoading, error: subscriptionsError } = useRepairerSubscriptions();

  // Filtrer strictement les réparateurs avec coordonnées valides
  const validRepairers = React.useMemo(() => {
    try {
      return repairers.filter(repairer => {
        if (!repairer) return false;
        
        const hasValidCoordinates = repairer.lat && repairer.lng && 
                                   typeof repairer.lat === 'number' && 
                                   typeof repairer.lng === 'number' &&
                                   !isNaN(repairer.lat) && !isNaN(repairer.lng) &&
                                   repairer.lat !== 0 && repairer.lng !== 0 &&
                                   repairer.lat >= -90 && repairer.lat <= 90 &&
                                   repairer.lng >= -180 && repairer.lng <= 180;
        
        if (!hasValidCoordinates) {
          console.log('Filtering out repairer with invalid coordinates:', repairer.name, repairer.lat, repairer.lng);
        }
        
        return hasValidCoordinates;
      });
    } catch (error) {
      console.error('Error filtering repairers:', error);
      return [];
    }
  }, [repairers]);

  console.log('Total repairers:', repairers.length);
  console.log('Valid repairers with coordinates:', validRepairers.length);

  if (subscriptionsError) {
    console.warn('Subscriptions error (non-critical):', subscriptionsError);
  }

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
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
            {validRepairers.map((repairer) => {
              try {
                return (
                  <RepairerMarker 
                    key={repairer.id} 
                    repairer={repairer}
                    subscriptionTier={subscriptionsLoading ? 'free' : getSubscriptionTier(repairer.id)}
                  />
                );
              } catch (error) {
                console.error('Error rendering marker for repairer:', repairer.id, error);
                return null;
              }
            })}
          </MarkerClusterGroup>
        </LeafletMapContainer>
        
        {subscriptionsLoading && (
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs text-gray-600">
            Chargement des abonnements...
          </div>
        )}
        
        {subscriptionsError && (
          <div className="absolute top-2 left-2 bg-yellow-100 px-2 py-1 rounded text-xs text-yellow-800">
            Mode dégradé (sans badges)
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Critical error in MapContainer:', error);
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erreur de chargement de la carte</p>
          <p className="text-sm text-gray-500">Veuillez recharger la page</p>
        </div>
      </div>
    );
  }
};

export default RepairersMapContainer;

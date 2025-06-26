
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

  // Filtrer les réparateurs avec des coordonnées valides
  const validRepairers = repairers.filter(repairer => {
    const hasValidCoordinates = repairer.lat && repairer.lng && 
                               typeof repairer.lat === 'number' && 
                               typeof repairer.lng === 'number' &&
                               !isNaN(repairer.lat) && !isNaN(repairer.lng);
    
    if (!hasValidCoordinates) {
      console.log('Filtering out repairer with invalid coordinates:', repairer.name);
    }
    
    return hasValidCoordinates;
  });

  console.log('Total repairers:', repairers.length);
  console.log('Valid repairers with coordinates:', validRepairers.length);

  if (subscriptionsError) {
    console.warn('Subscriptions error:', subscriptionsError);
  }

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
          {validRepairers.map((repairer) => (
            <RepairerMarker 
              key={repairer.id} 
              repairer={repairer}
              subscriptionTier={subscriptionsLoading ? 'free' : getSubscriptionTier(repairer.id)}
            />
          ))}
        </MarkerClusterGroup>
      </LeafletMapContainer>
      
      {subscriptionsLoading && (
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs text-gray-600">
          Chargement des abonnements...
        </div>
      )}
    </div>
  );
};

export default RepairersMapContainer;

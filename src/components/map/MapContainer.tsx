
import React, { useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useMapStore } from '@/stores/mapStore';
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
          {repairers.map((repairer) => (
            <RepairerMarker key={repairer.id} repairer={repairer} />
          ))}
        </MarkerClusterGroup>
      </LeafletMapContainer>
    </div>
  );
};

export default RepairersMapContainer;

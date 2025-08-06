
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '@/stores/mapStore';

const createUserIcon = () => {
  return L.divIcon({
    html: '📍',
    className: 'user-location-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const UserLocationMarker: React.FC = () => {
  const userLocation = useMapStore(state => state.userLocation);

  if (!userLocation) return null;

  return (
    <Marker position={userLocation} icon={createUserIcon()}>
      <Popup>
        <div className="text-center">
          <strong>Votre position</strong>
        </div>
      </Popup>
    </Marker>
  );
};

export default UserLocationMarker;


import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Repairer } from '@/types/repairer';
import { useMapStore } from '@/stores/mapStore';

interface RepairerMarkerProps {
  repairer: Repairer;
}

// Custom marker icon
const createMarkerIcon = () => {
  return L.divIcon({
    html: '📱',
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const RepairerMarker: React.FC<RepairerMarkerProps> = React.memo(({ repairer }) => {
  const setSelectedRepairer = useMapStore(state => state.setSelectedRepairer);

  if (!repairer.lat || !repairer.lng) return null;

  const handleMarkerClick = () => {
    setSelectedRepairer(repairer);
  };

  const displayPrice = repairer.price_range === 'low' ? '€' : 
                     repairer.price_range === 'medium' ? '€€' : '€€€';

  return (
    <Marker
      position={[repairer.lat, repairer.lng]}
      icon={createMarkerIcon()}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup maxWidth={320} closeButton={true}>
        <div className="p-4 min-w-[280px]">
          <h3 className="font-semibold text-lg mb-2">{repairer.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{repairer.address}, {repairer.city}</p>
          
          {repairer.rating && (
            <div className="flex items-center mb-3">
              <span className="text-yellow-500 mr-1">★</span>
              <span className="text-sm">{repairer.rating}/5 ({repairer.review_count || 0} avis)</span>
            </div>
          )}
          
          <div className="text-sm space-y-1">
            <p><strong>Services:</strong> {repairer.services && repairer.services.length > 0 ? repairer.services.join(', ') : 'Réparation générale'}</p>
            <p><strong>Prix:</strong> {displayPrice}</p>
            {repairer.response_time && <p><strong>Temps de réponse:</strong> {repairer.response_time}</p>}
            {repairer.phone && <p><strong>Téléphone:</strong> {repairer.phone}</p>}
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

RepairerMarker.displayName = 'RepairerMarker';

export default RepairerMarker;

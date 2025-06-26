
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Repairer } from '@/types/repairer';
import { useMapStore } from '@/stores/mapStore';
import SubscriptionBadge from './SubscriptionBadge';

interface RepairerMarkerProps {
  repairer: Repairer;
  subscriptionTier?: string;
}

// Custom marker icon with subscription indicator
const createMarkerIcon = (subscriptionTier?: string) => {
  const hasSubscription = subscriptionTier && subscriptionTier !== 'free';
  const emoji = hasSubscription ? '💎' : '📱';
  
  return L.divIcon({
    html: `<div style="position: relative;">
      <span style="font-size: 24px;">${emoji}</span>
      ${hasSubscription ? '<div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #10b981; border-radius: 50%; border: 1px solid white;"></div>' : ''}
    </div>`,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const RepairerMarker: React.FC<RepairerMarkerProps> = React.memo(({ repairer, subscriptionTier = 'free' }) => {
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
      icon={createMarkerIcon(subscriptionTier)}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup maxWidth={320} closeButton={true}>
        <div className="p-4 min-w-[280px]">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{repairer.name}</h3>
            {subscriptionTier && subscriptionTier !== 'free' && (
              <SubscriptionBadge tier={subscriptionTier} size="sm" />
            )}
          </div>
          
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
          
          {subscriptionTier && subscriptionTier !== 'free' && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">✓ Professionnel vérifié</p>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
});

RepairerMarker.displayName = 'RepairerMarker';

export default RepairerMarker;

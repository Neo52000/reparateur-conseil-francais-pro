
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Repairer } from '@/types/repairer';
import { useMapStore } from '@/stores/mapStore';

interface RepairerMarkerProps {
  repairer: Repairer;
  subscriptionTier?: string;
}

// Marker icon simple et sûr
const createMarkerIcon = (subscriptionTier?: string) => {
  try {
    const hasSubscription = subscriptionTier && subscriptionTier !== 'free';
    const emoji = hasSubscription ? '💎' : '📱';
    
    return L.divIcon({
      html: `<div style="font-size: 24px;">${emoji}</div>`,
      className: 'custom-leaflet-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  } catch (error) {
    console.error('Error creating marker icon:', error);
    // Fallback vers l'icône par défaut
    return new L.Icon.Default();
  }
};

const RepairerMarker: React.FC<RepairerMarkerProps> = React.memo(({ repairer, subscriptionTier = 'free' }) => {
  const setSelectedRepairer = useMapStore(state => state.setSelectedRepairer);

  // Vérification stricte des coordonnées
  if (!repairer?.lat || !repairer?.lng || 
      typeof repairer.lat !== 'number' || typeof repairer.lng !== 'number' ||
      isNaN(repairer.lat) || isNaN(repairer.lng) ||
      repairer.lat === 0 || repairer.lng === 0) {
    return null;
  }

  const handleMarkerClick = () => {
    try {
      setSelectedRepairer(repairer);
    } catch (error) {
      console.error('Error setting selected repairer:', error);
    }
  };

  const displayPrice = repairer.price_range === 'low' ? '€' : 
                     repairer.price_range === 'medium' ? '€€' : '€€€';

  const getBadgeDisplay = (tier: string) => {
    switch (tier) {
      case 'basic':
        return { label: 'Basic', color: 'text-blue-600' };
      case 'premium':
        return { label: 'Premium', color: 'text-purple-600' };
      case 'enterprise':
        return { label: 'Enterprise', color: 'text-yellow-600' };
      default:
        return null;
    }
  };

  const badgeInfo = getBadgeDisplay(subscriptionTier);

  try {
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
              {badgeInfo && (
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 ${badgeInfo.color}`}>
                  {badgeInfo.label}
                </div>
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
  } catch (error) {
    console.error('Error rendering RepairerMarker:', error);
    return null;
  }
});

RepairerMarker.displayName = 'RepairerMarker';

export default RepairerMarker;

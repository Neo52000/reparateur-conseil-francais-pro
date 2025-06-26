
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Repairer } from '@/types/repairer';
import { useMapStore } from '@/stores/mapStore';

interface SimpleRepairerMarkerProps {
  repairer: Repairer;
}

/**
 * Composant marker simplifié pour les réparateurs
 * Version allégée sans badges d'abonnement pour éviter les erreurs
 */
const SimpleRepairerMarker: React.FC<SimpleRepairerMarkerProps> = ({ repairer }) => {
  const setSelectedRepairer = useMapStore(state => state.setSelectedRepairer);

  // Validation stricte des coordonnées
  if (!repairer?.lat || !repairer?.lng || 
      typeof repairer.lat !== 'number' || typeof repairer.lng !== 'number' ||
      isNaN(repairer.lat) || isNaN(repairer.lng) ||
      Math.abs(repairer.lat) > 90 || Math.abs(repairer.lng) > 180) {
    return null;
  }

  // Icône simple et sûre
  const createSimpleIcon = () => {
    try {
      return L.divIcon({
        html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
        className: 'simple-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
      });
    } catch (error) {
      console.warn('Icon creation failed, using default');
      return new L.Icon.Default();
    }
  };

  const handleMarkerClick = () => {
    try {
      setSelectedRepairer(repairer);
    } catch (error) {
      console.warn('Error selecting repairer:', error);
    }
  };

  const displayPrice = repairer.price_range === 'low' ? '€' : 
                     repairer.price_range === 'medium' ? '€€' : '€€€';

  try {
    return (
      <Marker
        position={[repairer.lat, repairer.lng]}
        icon={createSimpleIcon()}
        eventHandlers={{
          click: handleMarkerClick,
        }}
      >
        <Popup maxWidth={300} closeButton={true}>
          <div className="p-3">
            <h3 className="font-semibold text-base mb-2">{repairer.name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {repairer.address}, {repairer.city}
            </p>
            
            {repairer.rating && (
              <div className="flex items-center mb-2">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="text-sm">
                  {repairer.rating}/5 ({repairer.review_count || 0} avis)
                </span>
              </div>
            )}
            
            <div className="text-sm space-y-1">
              <p><strong>Services:</strong> {repairer.services?.join(', ') || 'Réparation générale'}</p>
              <p><strong>Prix:</strong> {displayPrice}</p>
              {repairer.phone && <p><strong>Téléphone:</strong> {repairer.phone}</p>}
            </div>
          </div>
        </Popup>
      </Marker>
    );
  } catch (error) {
    console.warn('Error rendering SimpleRepairerMarker:', error);
    return null;
  }
};

export default SimpleRepairerMarker;

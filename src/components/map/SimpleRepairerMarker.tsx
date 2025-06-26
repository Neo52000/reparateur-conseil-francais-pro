
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { RepairerWithCoordinates } from '@/types/repairer';
import { useMapStore } from '@/stores/mapStore';

interface SimpleRepairerMarkerProps {
  repairer: RepairerWithCoordinates;
}

/**
 * Composant marker simplifié pour les réparateurs
 * Avec indication visuelle pour les positions approximatives
 */
const SimpleRepairerMarker: React.FC<SimpleRepairerMarkerProps> = ({ repairer }) => {
  const setSelectedRepairer = useMapStore(state => state.setSelectedRepairer);

  // Validation des coordonnées
  if (!repairer?.lat || !repairer?.lng || 
      typeof repairer.lat !== 'number' || typeof repairer.lng !== 'number' ||
      isNaN(repairer.lat) || isNaN(repairer.lng)) {
    return null;
  }

  // Icône différente selon si les coordonnées sont réelles ou approximatives
  const createIcon = () => {
    try {
      const hasRealCoords = repairer.hasRealCoordinates !== false;
      const color = hasRealCoords ? '#3b82f6' : '#f59e0b'; // Bleu pour réel, orange pour approximatif
      const emoji = hasRealCoords ? '📱' : '📍';
      
      return L.divIcon({
        html: `
          <div style="
            background: ${color}; 
            width: 24px; 
            height: 24px; 
            border-radius: 50%; 
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">
            ${emoji}
          </div>
        `,
        className: 'simple-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });
    } catch (error) {
      console.warn('Erreur création icône, utilisation par défaut');
      return new L.Icon.Default();
    }
  };

  const handleMarkerClick = () => {
    try {
      setSelectedRepairer(repairer);
    } catch (error) {
      console.warn('Erreur sélection réparateur:', error);
    }
  };

  const displayPrice = repairer.price_range === 'low' ? '€' : 
                     repairer.price_range === 'medium' ? '€€' : '€€€';

  try {
    return (
      <Marker
        position={[repairer.lat, repairer.lng]}
        icon={createIcon()}
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
            
            {/* Indication si position approximative */}
            {repairer.hasRealCoordinates === false && (
              <div className="bg-orange-100 text-orange-800 text-xs p-2 rounded mb-2">
                📍 Position approximative (adresse exacte à confirmer)
              </div>
            )}
            
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
              {repairer.email && <p><strong>Email:</strong> {repairer.email}</p>}
            </div>
          </div>
        </Popup>
      </Marker>
    );
  } catch (error) {
    console.warn('Erreur rendu SimpleRepairerMarker:', error);
    return null;
  }
};

export default SimpleRepairerMarker;

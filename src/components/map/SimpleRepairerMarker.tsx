import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore, MapRepairer } from '@/stores/mapStore';

interface MapRepairerWithCoordinates extends MapRepairer {
  hasRealCoordinates?: boolean;
}

interface SimpleRepairerMarkerProps {
  repairer: MapRepairerWithCoordinates;
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

  // Icône différente selon le tier et si les coordonnées sont réelles ou approximatives
  const createIcon = () => {
    try {
      const hasRealCoords = repairer.hasRealCoordinates !== false;
      const tier = (repairer as any).subscription_tier || 'free';
      const isPremium = tier === 'premium' || tier === 'enterprise';
      
      // Couleurs selon le tier
      let color = '#3b82f6'; // Bleu par défaut
      let emoji = '📱';
      let size = 28;
      
      if (!hasRealCoords) {
        color = '#f59e0b'; // Orange pour approximatif
        emoji = '📍';
      } else if (tier === 'enterprise') {
        color = '#f59e0b'; // Or pour enterprise
        emoji = '⭐';
        size = 34;
      } else if (tier === 'premium') {
        color = '#10b981'; // Vert primary pour premium
        emoji = '✓';
        size = 32;
      }
      
      return L.divIcon({
        html: `
          <div style="
            background: ${color}; 
            width: ${size}px; 
            height: ${size}px; 
            border-radius: 50%; 
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isPremium ? '14px' : '12px'};
            box-shadow: 0 2px 8px rgba(0,0,0,${isPremium ? '0.3' : '0.2'});
            ${isPremium ? 'animation: pulse 2s infinite;' : ''}
          ">
            ${emoji}
          </div>
        `,
        className: `simple-marker ${isPremium ? 'premium-marker' : ''}`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2]
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

  try {
    return (
      <Marker
        position={[repairer.lat, repairer.lng]}
        icon={createIcon()}
        eventHandlers={{
          click: handleMarkerClick,
        }}
      >
        <Popup maxWidth={280} closeButton={true}>
          <div className="p-3 min-w-[240px]">
            <h3 className="font-semibold text-base mb-1">{repairer.name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {repairer.city}
            </p>
            
            {repairer.hasRealCoordinates === false && (
              <div className="bg-orange-100 text-orange-800 text-xs p-1.5 rounded mb-2">
                📍 Position approximative
              </div>
            )}
            
            {repairer.rating && (
              <div className="flex items-center mb-2">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="text-sm">{repairer.rating}/5</span>
              </div>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRepairer(repairer);
              }}
              className="w-full mt-2 px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Voir la fiche complète
            </button>
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

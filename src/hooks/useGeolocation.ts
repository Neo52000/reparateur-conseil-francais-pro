
import { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useToast } from '@/hooks/use-toast';
import { MAP_CONFIG } from '@/constants/repairers';

export const useGeolocation = (map: mapboxgl.Map | null) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isAutoLocating, setIsAutoLocating] = useState(false);
  const { toast } = useToast();

  const createUserLocationMarker = () => {
    const userMarker = document.createElement('div');
    userMarker.className = 'user-location-marker';
    userMarker.style.width = '20px';
    userMarker.style.height = '20px';
    userMarker.style.borderRadius = '50%';
    userMarker.style.backgroundColor = '#10B981';
    userMarker.style.border = '3px solid white';
    userMarker.style.boxShadow = '0 0 0 2px #10B981';
    return userMarker;
  };

  const handleLocationSuccess = (position: GeolocationPosition, isAutomatic = false) => {
    const { latitude, longitude } = position.coords;
    setUserLocation([longitude, latitude]);
    
    if (map) {
      const userMarker = createUserLocationMarker();

      const existingUserMarker = document.querySelector('.user-location-marker');
      if (existingUserMarker) {
        existingUserMarker.remove();
      }

      new mapboxgl.Marker(userMarker)
        .setLngLat([longitude, latitude])
        .addTo(map);

      map.flyTo({
        center: [longitude, latitude],
        zoom: MAP_CONFIG.USER_LOCATION_ZOOM,
        duration: MAP_CONFIG.FLY_TO_DURATION
      });

      if (!isAutomatic) {
        toast({
          title: "Position trouvée",
          description: "La carte a été centrée sur votre position.",
        });
      }
    }
    
    setIsLocating(false);
    setIsAutoLocating(false);
  };

  const handleLocationError = (error: GeolocationPositionError, isAutomatic = false) => {
    console.error('Error getting user location:', error);
    
    if (!isAutomatic) {
      let errorMessage = "Impossible d'obtenir votre position.";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Autorisation de géolocalisation refusée.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Position indisponible.";
          break;
        case error.TIMEOUT:
          errorMessage = "Timeout de géolocalisation.";
          break;
      }

      toast({
        title: "Erreur de géolocalisation",
        description: errorMessage,
        variant: "destructive"
      });
    }
    
    setIsLocating(false);
    setIsAutoLocating(false);
  };

  const getUserLocation = (isAutomatic = false) => {
    if (!navigator.geolocation) {
      if (!isAutomatic) {
        toast({
          title: "Géolocalisation non supportée",
          description: "Votre navigateur ne supporte pas la géolocalisation.",
          variant: "destructive"
        });
      }
      return;
    }

    if (isAutomatic) {
      setIsAutoLocating(true);
    } else {
      setIsLocating(true);
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => handleLocationSuccess(position, isAutomatic),
      (error) => handleLocationError(error, isAutomatic),
      {
        enableHighAccuracy: true,
        timeout: isAutomatic ? 5000 : 10000, // Timeout plus court pour l'auto-géolocalisation
        maximumAge: 300000
      }
    );
  };

  const getLocationAutomatically = () => {
    getUserLocation(true);
  };

  return {
    userLocation,
    isLocating,
    isAutoLocating,
    getUserLocation: () => getUserLocation(false),
    getLocationAutomatically
  };
};

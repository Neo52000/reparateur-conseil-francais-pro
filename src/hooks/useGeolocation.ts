
import { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useToast } from '@/hooks/use-toast';
import { MAP_CONFIG } from '@/constants/repairers';

export const useGeolocation = (map: mapboxgl.Map | null) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
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

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation.",
        variant: "destructive"
      });
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
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

          toast({
            title: "Position trouvée",
            description: "La carte a été centrée sur votre position.",
          });
        }
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting user location:', error);
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
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return {
    userLocation,
    isLocating,
    getUserLocation
  };
};

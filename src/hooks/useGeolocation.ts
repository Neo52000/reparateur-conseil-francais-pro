
import { useState, useCallback } from 'react';
import L from 'leaflet';

export const useGeolocation = (map: L.Map | null) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isAutoLocating, setIsAutoLocating] = useState(false);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        
        setUserLocation(newLocation);
        
        if (map) {
          map.flyTo([latitude, longitude], 14, { duration: 1.5 });
          
          // Ajouter un marqueur pour la position de l'utilisateur
          const userIcon = L.divIcon({
            html: '📍',
            className: 'user-location-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
          
          L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('Votre position')
            .openPopup();
        }
        
        setIsLocating(false);
        console.log('User location:', newLocation);
      },
      (error) => {
        console.error('Error getting user location:', error);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [map]);

  const getLocationAutomatically = useCallback(() => {
    if (!navigator.geolocation || userLocation) return;

    setIsAutoLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        
        setUserLocation(newLocation);
        
        if (map) {
          map.setView([latitude, longitude], 12);
        }
        
        setIsAutoLocating(false);
        console.log('Auto location:', newLocation);
      },
      (error) => {
        console.log('Auto location failed (normal):', error.message);
        setIsAutoLocating(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000
      }
    );
  }, [map, userLocation]);

  return {
    userLocation,
    isLocating,
    isAutoLocating,
    getUserLocation,
    getLocationAutomatically
  };
};

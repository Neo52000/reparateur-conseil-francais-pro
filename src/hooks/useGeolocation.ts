
import React from 'react';
import { useMapStore } from '@/stores/mapStore';

export const useGeolocation = () => {
  const [isLocating, setIsLocating] = React.useState(false);
  const [isAutoLocating, setIsAutoLocating] = React.useState(false);
  const { userLocation, setUserLocation } = useMapStore();

  const getUserLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: [number, number] = [latitude, longitude];
        
        setUserLocation(newLocation);
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
  }, [setUserLocation]);

  const getLocationAutomatically = React.useCallback(() => {
    if (!navigator.geolocation || userLocation) return;

    setIsAutoLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: [number, number] = [latitude, longitude];
        
        setUserLocation(newLocation);
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
  }, [userLocation, setUserLocation]);

  return {
    userLocation,
    isLocating,
    isAutoLocating,
    getUserLocation,
    getLocationAutomatically
  };
};

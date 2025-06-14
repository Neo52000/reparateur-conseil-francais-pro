
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mock data pour les réparateurs
const mockRepairers = [
  {
    id: 1,
    name: "TechFix Pro",
    address: "123 Rue de la République, Paris",
    lat: 48.8566,
    lng: 2.3522,
    rating: 4.8,
    reviewCount: 245,
    services: ["iPhone", "Samsung", "Xiaomi"],
    averagePrice: "€€",
    responseTime: "< 1h"
  },
  {
    id: 2,
    name: "Mobile Repair Center",
    address: "45 Avenue des Champs, Lyon",
    lat: 45.7640,
    lng: 4.8357,
    rating: 4.6,
    reviewCount: 182,
    services: ["iPhone", "Huawei", "OnePlus"],
    averagePrice: "€",
    responseTime: "< 2h"
  },
  {
    id: 3,
    name: "QuickFix Mobile",
    address: "78 Boulevard Victor Hugo, Marseille",
    lat: 43.2965,
    lng: 5.3698,
    rating: 4.9,
    reviewCount: 156,
    services: ["iPhone", "Samsung", "Google Pixel"],
    averagePrice: "€€€",
    responseTime: "< 30min"
  }
];

const RepairersMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('pk.eyJ1IjoicmVpbmU1MiIsImEiOiJjbGtwaWt0cmUxdnA1M2RvM3FwczNhanNsIn0.rBZMbfsCAqHl-FjytxpYYQ');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [selectedRepairer, setSelectedRepairer] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    try {
      // Set the access token
      mapboxgl.accessToken = mapboxToken;
      
      // Initialize the map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [2.3522, 48.8566], // Paris center
        zoom: 6
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add markers for each repairer
      mockRepairers.forEach((repairer) => {
        // Create a custom marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.style.width = '30px';
        markerElement.style.height = '30px';
        markerElement.style.borderRadius = '50%';
        markerElement.style.backgroundColor = '#3B82F6';
        markerElement.style.border = '2px solid white';
        markerElement.style.cursor = 'pointer';
        markerElement.style.display = 'flex';
        markerElement.style.alignItems = 'center';
        markerElement.style.justifyContent = 'center';
        markerElement.style.color = 'white';
        markerElement.style.fontSize = '12px';
        markerElement.style.fontWeight = 'bold';
        markerElement.innerHTML = '📱';

        // Create popup content
        const popupContent = `
          <div class="p-3">
            <h3 class="font-semibold text-lg">${repairer.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${repairer.address}</p>
            <div class="flex items-center mb-2">
              <span class="text-yellow-500">★</span>
              <span class="ml-1 text-sm">${repairer.rating} (${repairer.reviewCount} avis)</span>
            </div>
            <div class="text-sm">
              <p><strong>Services:</strong> ${repairer.services.join(', ')}</p>
              <p><strong>Prix:</strong> ${repairer.averagePrice}</p>
              <p><strong>Temps de réponse:</strong> ${repairer.responseTime}</p>
            </div>
          </div>
        `;

        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false
        }).setHTML(popupContent);

        // Create marker and add to map
        new mapboxgl.Marker(markerElement)
          .setLngLat([repairer.lng, repairer.lat])
          .setPopup(popup)
          .addTo(map.current!);

        // Add click event to marker
        markerElement.addEventListener('click', () => {
          setSelectedRepairer(repairer);
        });
      });

      setShowTokenInput(false);
      toast({
        title: "Carte initialisée",
        description: "La carte Mapbox a été chargée avec succès.",
      });

      console.log('Map initialized with', mockRepairers.length, 'markers');
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser la carte. Vérifiez votre token Mapbox.",
        variant: "destructive"
      });
    }
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
        
        if (map.current) {
          // Add user location marker
          const userMarker = document.createElement('div');
          userMarker.className = 'user-location-marker';
          userMarker.style.width = '20px';
          userMarker.style.height = '20px';
          userMarker.style.borderRadius = '50%';
          userMarker.style.backgroundColor = '#10B981';
          userMarker.style.border = '3px solid white';
          userMarker.style.boxShadow = '0 0 0 2px #10B981';

          // Remove existing user location marker if any
          const existingUserMarker = document.querySelector('.user-location-marker');
          if (existingUserMarker) {
            existingUserMarker.remove();
          }

          new mapboxgl.Marker(userMarker)
            .setLngLat([longitude, latitude])
            .addTo(map.current);

          // Center map on user location
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 12,
            duration: 1500
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

  useEffect(() => {
    if (mapboxToken && !showTokenInput) {
      initializeMap();
    }
  }, [mapboxToken, showTokenInput]);

  if (showTokenInput) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <CardContent className="text-center space-y-4">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Configuration de la carte
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Entrez votre token Mapbox public pour afficher la carte interactive
            </p>
            <div className="space-y-3 max-w-sm mx-auto">
              <Input
                placeholder="Token Mapbox public"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <Button onClick={initializeMap} className="w-full" disabled={!mapboxToken.trim()}>
                Initialiser la carte
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Obtenez votre token sur{' '}
              <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                mapbox.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[500px]">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Réparateurs à proximité</CardTitle>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={getUserLocation}
              disabled={isLocating || !map.current}
            >
              <Navigation className="h-4 w-4 mr-2" />
              {isLocating ? 'Localisation...' : 'Ma position'}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowTokenInput(true)}
            >
              Configurer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapContainer} className="w-full h-[400px] bg-gray-100 rounded-lg" />
      </CardContent>
    </Card>
  );
};

export default RepairersMap;

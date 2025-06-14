
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

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
  const map = useRef<any>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [selectedRepairer, setSelectedRepairer] = useState<any>(null);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    // Simulated map initialization
    console.log('Initializing map with token:', mapboxToken);
    
    // Hide token input once map is initialized
    setShowTokenInput(false);
    
    // Mock map markers
    console.log('Adding markers for repairers:', mockRepairers);
  };

  useEffect(() => {
    if (mapboxToken) {
      initializeMap();
    }
  }, [mapboxToken]);

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
              <Button onClick={initializeMap} className="w-full">
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
          <Button size="sm" variant="outline">
            <Navigation className="h-4 w-4 mr-2" />
            Ma position
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapContainer} className="w-full h-[400px] bg-gray-100 rounded-lg relative">
          {/* Mock map content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <MapPin className="h-16 w-16 text-blue-600 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Carte interactive</h3>
                <p className="text-sm text-gray-600">
                  {mockRepairers.length} réparateurs trouvés dans la zone
                </p>
              </div>
              
              {/* Mock markers */}
              <div className="space-y-2">
                {mockRepairers.map((repairer) => (
                  <div 
                    key={repairer.id}
                    className="bg-white p-2 rounded shadow-sm border text-left cursor-pointer hover:bg-blue-50"
                    onClick={() => setSelectedRepairer(repairer)}
                  >
                    <div className="font-medium text-sm">{repairer.name}</div>
                    <div className="text-xs text-gray-600">{repairer.address}</div>
                    <div className="text-xs text-yellow-600">★ {repairer.rating} ({repairer.reviewCount})</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepairersMap;

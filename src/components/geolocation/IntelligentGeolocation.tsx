import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Target, Wifi, Globe, Clock, CheckCircle2 } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMapStore } from '@/stores/mapStore';
import { supabase } from '@/integrations/supabase/client';

interface LocationAccuracy {
  type: 'precise' | 'approximate' | 'city' | 'unknown';
  confidence: number;
  source: 'gps' | 'network' | 'ip' | 'manual';
}

interface GeolocationData {
  coordinates: [number, number];
  accuracy: LocationAccuracy;
  address: string;
  timestamp: Date;
}

const IntelligentGeolocation: React.FC = () => {
  const [locationData, setLocationData] = useState<GeolocationData | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState<GeolocationData[]>([]);
  const { userLocation, getUserLocation, isLocating } = useGeolocation();
  const { setUserLocation, setCenter } = useMapStore();

  // Détecter automatiquement la localisation au chargement
  useEffect(() => {
    detectBestLocation();
  }, []);

  const detectBestLocation = async () => {
    setIsDetecting(true);
    try {
      // 1. Tentative GPS précise
      const gpsLocation = await getGPSLocation();
      if (gpsLocation) {
        const locationData = await enhanceLocationData(gpsLocation, 'gps');
        setLocationData(locationData);
        updateMapLocation(locationData);
        addToHistory(locationData);
        return;
      }

      // 2. Fallback sur IP géolocalisation
      const ipLocation = await getIPLocation();
      if (ipLocation) {
        const locationData = await enhanceLocationData(ipLocation, 'ip');
        setLocationData(locationData);
        updateMapLocation(locationData);
        addToHistory(locationData);
        return;
      }

      // 3. Localisation par défaut (France)
      const defaultLocation: GeolocationData = {
        coordinates: [46.8566, 2.3522],
        accuracy: { type: 'city', confidence: 0.3, source: 'manual' },
        address: 'France',
        timestamp: new Date()
      };
      setLocationData(defaultLocation);
      
    } catch (error) {
      console.error('Erreur détection localisation:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const getGPSLocation = (): Promise<[number, number] | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve([latitude, longitude]);
        },
        (error) => {
          console.log('GPS non disponible:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  };

  const getIPLocation = async (): Promise<[number, number] | null> => {
    try {
      // Utilisation d'un service gratuit de géolocalisation IP
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        return [data.latitude, data.longitude];
      }
    } catch (error) {
      console.error('Erreur géolocalisation IP:', error);
    }
    return null;
  };

  const enhanceLocationData = async (
    coordinates: [number, number], 
    source: 'gps' | 'ip' | 'manual'
  ): Promise<GeolocationData> => {
    const [lat, lng] = coordinates;
    
    // Géocodage inverse pour obtenir l'adresse
    let address = 'Localisation inconnue';
    let accuracy: LocationAccuracy = {
      type: 'unknown',
      confidence: 0.5,
      source
    };

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RepairMap/1.0'
          }
        }
      );
      
      const data = await response.json();
      if (data.display_name) {
        address = data.display_name;
        
        // Déterminer la précision basée sur le type d'adresse
        if (data.address?.house_number) {
          accuracy = { type: 'precise', confidence: 0.9, source };
        } else if (data.address?.road) {
          accuracy = { type: 'approximate', confidence: 0.7, source };
        } else if (data.address?.city || data.address?.town) {
          accuracy = { type: 'city', confidence: 0.5, source };
        }
      }
    } catch (error) {
      console.error('Erreur géocodage inverse:', error);
    }

    return {
      coordinates,
      accuracy,
      address,
      timestamp: new Date()
    };
  };

  const updateMapLocation = (locationData: GeolocationData) => {
    setUserLocation(locationData.coordinates);
    setCenter(locationData.coordinates);
  };

  const addToHistory = (locationData: GeolocationData) => {
    setDetectionHistory(prev => [locationData, ...prev.slice(0, 4)]);
  };

  const handleManualLocation = () => {
    getUserLocation();
  };

  const getAccuracyColor = (accuracy: LocationAccuracy) => {
    switch (accuracy.type) {
      case 'precise': return 'bg-green-500';
      case 'approximate': return 'bg-yellow-500';
      case 'city': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getAccuracyIcon = (accuracy: LocationAccuracy) => {
    switch (accuracy.source) {
      case 'gps': return <Navigation className="w-4 h-4" />;
      case 'network': return <Wifi className="w-4 h-4" />;
      case 'ip': return <Globe className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Géolocalisation Intelligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Localisation actuelle */}
        {locationData && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getAccuracyIcon(locationData.accuracy)}
                  <span className="font-medium">Position actuelle</span>
                  <Badge variant="secondary" className={`${getAccuracyColor(locationData.accuracy)} text-white text-xs`}>
                    {locationData.accuracy.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {locationData.address}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    {locationData.coordinates[0].toFixed(6)}, {locationData.coordinates[1].toFixed(6)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {locationData.timestamp.toLocaleTimeString()}
                  </span>
                  <span>
                    Confiance: {Math.round(locationData.accuracy.confidence * 100)}%
                  </span>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={detectBestLocation}
            disabled={isDetecting}
            className="flex-1"
          >
            {isDetecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Détection...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Re-détecter
              </>
            )}
          </Button>
          
          <Button
            onClick={handleManualLocation}
            variant="outline"
            disabled={isLocating}
          >
            {isLocating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Historique */}
        {detectionHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Historique des détections</h4>
            <div className="space-y-2">
              {detectionHistory.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-background rounded border">
                  {getAccuracyIcon(item.accuracy)}
                  <div className="flex-1 text-xs">
                    <div className="font-medium">{item.address.split(',')[0]}</div>
                    <div className="text-muted-foreground">
                      {item.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.accuracy.source}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informations techniques */}
        <div className="pt-2 border-t">
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground mb-2">
              Informations techniques
            </summary>
            <div className="space-y-1 text-muted-foreground">
              <div>• GPS haute précision avec fallback IP</div>
              <div>• Géocodage inverse automatique</div>
              <div>• Mise en cache des positions</div>
              <div>• Analyse de confiance multicritères</div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntelligentGeolocation;

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface MapboxTokenInputProps {
  mapboxToken: string;
  setMapboxToken: (token: string) => void;
  onInitialize: () => void;
}

const MapboxTokenInput: React.FC<MapboxTokenInputProps> = ({
  mapboxToken,
  setMapboxToken,
  onInitialize
}) => {
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
            <Button onClick={onInitialize} className="w-full" disabled={!mapboxToken.trim()}>
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
};

export default MapboxTokenInput;

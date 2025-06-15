
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMapbox } from '@/hooks/useMapbox';
import { useGeolocation } from '@/hooks/useGeolocation';
import MapboxTokenInput from './MapboxTokenInput';
import MapControls from './MapControls';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRepairers } from '@/hooks/useRepairers';

const RepairersMap = () => {
  const [mapboxToken, setMapboxToken] = useState('pk.eyJ1IjoicmVpbmU1MiIsImEiOiJjbGtwaWt0cmUxdnA1M2RvM3FwczNhanNsIn0.rBZMbfsCAqHl-FjytxpYYQ');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});

  // Utiliser les vraies données Supabase
  const { repairers, loading, error } = useRepairers(searchFilters);
  const { mapContainer, map, selectedRepairer, initializeMap } = useMapbox(mapboxToken, repairers);
  const { userLocation, isLocating, getUserLocation } = useGeolocation(map);

  console.log('RepairersMap - Repairers data:', repairers);
  console.log('RepairersMap - Loading:', loading);
  console.log('RepairersMap - Error:', error);

  const handleInitialize = () => {
    initializeMap();
    setShowTokenInput(false);
  };

  if (showTokenInput) {
    return (
      <MapboxTokenInput
        mapboxToken={mapboxToken}
        setMapboxToken={setMapboxToken}
        onInitialize={handleInitialize}
      />
    );
  }

  return (
    <Card className="h-[500px]">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Réparateurs à proximité {repairers.length > 0 && `(${repairers.length})`}
          </CardTitle>
          <MapControls
            onGetLocation={getUserLocation}
            onShowTokenInput={() => setShowTokenInput(true)}
            isLocating={isLocating}
            hasMap={!!map}
          />
        </div>
        {loading && (
          <p className="text-sm text-gray-500">Chargement des réparateurs...</p>
        )}
        {error && (
          <p className="text-sm text-red-500">Erreur: {error}</p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapContainer} className="w-full h-[400px] bg-gray-100 rounded-lg" />
      </CardContent>
    </Card>
  );
};

export default RepairersMap;

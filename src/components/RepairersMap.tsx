import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMapbox } from '@/hooks/useMapbox';
import { useGeolocation } from '@/hooks/useGeolocation';
import MapboxTokenInput from './MapboxTokenInput';
import MapControls from './MapControls';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRepairers } from '@/hooks/useRepairers';
import { RepairerDB } from '@/lib/supabase';

const RepairersMap = () => {
  const [mapboxToken, setMapboxToken] = useState('pk.eyJ1IjoicmVpbmU1MiIsImEiOiJjbGtwaWt0cmUxdnA1M2RvM3FwczNhanNsIn0.rBZMbfsCAqHl-FjytxpYYQ');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});

  // Utiliser les vraies données Supabase au lieu des données mockées
  const { repairers, loading } = useRepairers(searchFilters);
  const { mapContainer, map, selectedRepairer, initializeMap } = useMapbox(mapboxToken, repairers);
  const { userLocation, isLocating, getUserLocation } = useGeolocation(map);

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
          <CardTitle className="text-lg">Réparateurs à proximité</CardTitle>
          <MapControls
            onGetLocation={getUserLocation}
            onShowTokenInput={() => setShowTokenInput(true)}
            isLocating={isLocating}
            hasMap={!!map}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapContainer} className="w-full h-[400px] bg-gray-100 rounded-lg" />
      </CardContent>
    </Card>
  );
};

export default RepairersMap;

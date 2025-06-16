
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMapbox } from '@/hooks/useMapbox';
import { useGeolocation } from '@/hooks/useGeolocation';
import MapControls from './MapControls';
import MarkerTooltip from './MarkerTooltip';
import RepairerProfileModal from './RepairerProfileModal';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRepairers } from '@/hooks/useRepairers';
import { Repairer } from '@/types/repairer';

const RepairersMap = () => {
  const [mapboxToken] = useState('pk.eyJ1IjoicmVpbmU1MiIsImEiOiJjbGtwaWt0cmUxdnA1M2RvM3FwczNhanNsIn0.rBZMbfsCAqHl-FjytxpYYQ');
  const [searchFilters, setSearchFilters] = useState({});
  const [tooltipData, setTooltipData] = useState<{
    repairer: Repairer;
    position: { x: number; y: number };
    visible: boolean;
  }>({
    repairer: {} as Repairer,
    position: { x: 0, y: 0 },
    visible: false
  });
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);

  // Utiliser les vraies données Supabase
  const { repairers, loading, error } = useRepairers(searchFilters);
  const { mapContainer, map, selectedRepairer, initializeMap } = useMapbox(
    mapboxToken, 
    repairers,
    (repairer: Repairer) => {
      // Ouvrir le modal de profil au clic
      setSelectedRepairerId(repairer.id);
    },
    (repairer: Repairer, event: MouseEvent) => {
      // Afficher le tooltip au survol
      setTooltipData({
        repairer,
        position: { x: event.clientX, y: event.clientY },
        visible: true
      });
    },
    () => {
      // Cacher le tooltip quand on quitte le marker
      setTooltipData(prev => ({ ...prev, visible: false }));
    }
  );
  const { userLocation, isLocating, isAutoLocating, getUserLocation, getLocationAutomatically } = useGeolocation(map);

  // Géolocalisation automatique lorsque la carte est prête
  useEffect(() => {
    if (map && !userLocation) {
      // Attendre un petit délai pour que la carte soit complètement chargée
      const timer = setTimeout(() => {
        getLocationAutomatically();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [map, userLocation, getLocationAutomatically]);

  console.log('RepairersMap - Repairers data:', repairers);
  console.log('RepairersMap - Loading:', loading);
  console.log('RepairersMap - Error:', error);

  return (
    <>
      <Card className="h-[500px]">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Réparateurs à proximité {repairers.length > 0 && `(${repairers.length})`}
            </CardTitle>
            <MapControls
              onGetLocation={getUserLocation}
              isLocating={isLocating || isAutoLocating}
              hasMap={!!map}
            />
          </div>
          {loading && (
            <p className="text-sm text-gray-500">Chargement des réparateurs...</p>
          )}
          {error && (
            <p className="text-sm text-red-500">Erreur: {error}</p>
          )}
          {isAutoLocating && (
            <p className="text-sm text-blue-500">Localisation en cours...</p>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div ref={mapContainer} className="w-full h-[400px] bg-gray-100 rounded-lg" />
        </CardContent>
      </Card>

      {/* Tooltip au survol */}
      <MarkerTooltip 
        repairer={tooltipData.repairer}
        position={tooltipData.position}
        visible={tooltipData.visible}
      />

      {/* Modal de profil */}
      {selectedRepairerId && (
        <RepairerProfileModal
          isOpen={!!selectedRepairerId}
          onClose={() => setSelectedRepairerId(null)}
          repairerId={selectedRepairerId}
        />
      )}
    </>
  );
};

export default RepairersMap;

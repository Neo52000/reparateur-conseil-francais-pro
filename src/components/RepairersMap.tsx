
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeaflet } from '@/hooks/useLeaflet';
import { useGeolocation } from '@/hooks/useGeolocation';
import MapControls from './MapControls';
import MarkerTooltip from './MarkerTooltip';
import RepairerProfileModal from './RepairerProfileModal';
import { useRepairers } from '@/hooks/useRepairers';
import { Repairer } from '@/types/repairer';

const RepairersMap = () => {
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

  const { repairers, loading, error } = useRepairers(searchFilters);
  const { mapContainer, map, selectedRepairer, initializeMap } = useLeaflet(
    repairers,
    (repairer: Repairer) => {
      setSelectedRepairerId(repairer.id);
    },
    (repairer: Repairer, event: MouseEvent) => {
      setTooltipData({
        repairer,
        position: { x: event.clientX, y: event.clientY },
        visible: true
      });
    },
    () => {
      setTooltipData(prev => ({ ...prev, visible: false }));
    }
  );
  const { userLocation, isLocating, isAutoLocating, getUserLocation, getLocationAutomatically } = useGeolocation(map);

  useEffect(() => {
    if (map && !userLocation) {
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

      <MarkerTooltip 
        repairer={tooltipData.repairer}
        position={tooltipData.position}
        visible={tooltipData.visible}
      />

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

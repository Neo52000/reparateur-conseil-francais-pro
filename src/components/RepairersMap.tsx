
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGeolocation } from '@/hooks/useGeolocation';
import MapControls from './MapControls';
import RepairerProfileModal from './RepairerProfileModal';
import RepairersMapContainer from './map/MapContainer';
import { useRepairers } from '@/hooks/useRepairers';
import { useMapStore } from '@/stores/mapStore';
import { useSearchStore } from '@/stores/searchStore';
import { Repairer } from '@/types/repairer';

interface RepairersMapProps {
  searchFilters?: any;
}

const RepairersMap: React.FC<RepairersMapProps> = ({ searchFilters }) => {
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const { setResultsCount } = useSearchStore();

  // Construire les filtres pour useRepairers
  const filters = searchFilters ? {
    city: searchFilters.city,
    postalCode: searchFilters.postalCode,
    services: searchFilters.searchTerm ? [searchFilters.searchTerm] : undefined,
  } : {};

  const { repairers, loading, error } = useRepairers(filters);
  const { setRepairers, selectedRepairer, setSelectedRepairer } = useMapStore();
  const { userLocation, isLocating, isAutoLocating, getUserLocation, getLocationAutomatically } = useGeolocation();

  // Update store when repairers data changes
  useEffect(() => {
    setRepairers(repairers);
    setResultsCount(repairers.length);
  }, [repairers, setRepairers, setResultsCount]);

  // Handle automatic location detection
  useEffect(() => {
    if (!userLocation) {
      const timer = setTimeout(() => {
        getLocationAutomatically();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [userLocation, getLocationAutomatically]);

  // Handle repairer selection from store
  useEffect(() => {
    if (selectedRepairer) {
      setSelectedRepairerId(selectedRepairer.id);
    }
  }, [selectedRepairer]);

  const handleCloseModal = () => {
    setSelectedRepairerId(null);
    setSelectedRepairer(null);
  };

  console.log('RepairersMap - Repairers data:', repairers);
  console.log('RepairersMap - Loading:', loading);
  console.log('RepairersMap - Error:', error);
  console.log('RepairersMap - Applied filters:', filters);

  return (
    <>
      <Card className="h-[500px]">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Réparateurs {searchFilters ? 'correspondant à votre recherche' : 'à proximité'} 
              {repairers.length > 0 && ` (${repairers.length})`}
            </CardTitle>
            <MapControls
              onGetLocation={getUserLocation}
              isLocating={isLocating || isAutoLocating}
              hasMap={true}
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
          {searchFilters && (
            <p className="text-sm text-blue-600">
              Recherche active - {repairers.length} résultat{repairers.length !== 1 ? 's' : ''}
            </p>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <RepairersMapContainer />
        </CardContent>
      </Card>

      {selectedRepairerId && (
        <RepairerProfileModal
          isOpen={!!selectedRepairerId}
          onClose={handleCloseModal}
          repairerId={selectedRepairerId}
        />
      )}
    </>
  );
};

export default RepairersMap;

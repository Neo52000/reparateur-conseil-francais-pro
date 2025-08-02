
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGeolocation } from '@/hooks/useGeolocation';
import MapControls from './MapControls';
import RepairerProfileModal from './RepairerProfileModal';
import RepairersMapContainer from './map/MapContainer';
import { useRealRepairers } from '@/hooks/useRealRepairers';
import { useMapStore } from '@/stores/mapStore';
import { useSearchStore } from '@/stores/searchStore';

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

  const { repairers, loading, error } = useRealRepairers();
  const { setRepairers, selectedRepairer, setSelectedRepairer } = useMapStore();
  const { userLocation, isLocating, isAutoLocating, getUserLocation, getLocationAutomatically } = useGeolocation();

  // Update store when repairers data changes
  useEffect(() => {
    // setRepairers(repairers); // Temporairement désactivé pour éviter conflit de types
    setResultsCount(repairers.length);
  }, [repairers, setResultsCount]);

  // Handle automatic location detection
  useEffect(() => {
    if (!userLocation) {
      // Use immediate location request without artificial delay
      getLocationAutomatically();
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

  // Éviter le saut de chargement en gardant la hauteur fixe
  const cardHeight = "h-[500px]";
  const showResults = repairers.length > 0;

  console.log('RepairersMap - Repairers data:', repairers);
  console.log('RepairersMap - Loading:', loading);
  console.log('RepairersMap - Error:', error);
  console.log('RepairersMap - Applied filters:', filters);

  return (
    <>
      <Card className={cardHeight}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Réparateurs {searchFilters ? 'correspondant à votre recherche' : 'à proximité'} 
              {showResults && ` (${repairers.length})`}
            </CardTitle>
            <MapControls
              onGetLocation={getUserLocation}
              isLocating={isLocating || isAutoLocating}
              hasMap={true}
            />
          </div>
          
          {/* Statut unifié sans saut */}
          <div className="min-h-[20px]">
            {loading && (
              <p className="text-sm text-blue-500">🔄 Chargement des réparateurs...</p>
            )}
            {error && (
              <p className="text-sm text-red-500">⚠️ Erreur: {error}</p>
            )}
            {!loading && !error && showResults && (
              <p className="text-sm text-green-600">
                ✅ {repairers.length} réparateur{repairers.length !== 1 ? 's' : ''} trouvé{repairers.length !== 1 ? 's' : ''}
                {searchFilters && ' (recherche active)'}
              </p>
            )}
            {!loading && !error && !showResults && (
              <p className="text-sm text-gray-500">
                Aucun réparateur trouvé pour cette recherche
              </p>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0 h-full">
          {/* La carte s'affiche toujours, même pendant le chargement */}
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

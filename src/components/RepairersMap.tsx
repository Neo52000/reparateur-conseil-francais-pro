
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

  // Update store when repairers data changes - IMPORTANT pour afficher sur la carte
  useEffect(() => {
    if (repairers.length > 0) {
      // Convertir les réparateurs pour le store de la carte
      const mapRepairers = repairers.map(r => ({
        id: r.id,
        name: r.name,
        address: r.address,
        city: r.city,
        postal_code: r.postal_code,
        phone: r.phone,
        email: r.email,
        website: r.website,
        description: r.description,
        services: r.services,
        rating: r.rating,
        lat: r.lat,
        lng: r.lng,
        is_verified: r.is_verified,
        logo_url: '',
        created_at: r.created_at,
        updated_at: r.updated_at,
      }));
      setRepairers(mapRepairers);
    }
    setResultsCount(repairers.length);
  }, [repairers, setRepairers, setResultsCount]);

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

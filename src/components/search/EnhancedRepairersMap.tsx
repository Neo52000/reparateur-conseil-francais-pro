
import React, { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useRepairerSearch } from '@/hooks/useRepairerSearch';
import { useMapStore } from '@/stores/mapStore';
import RepairersMapContainer from '../map/MapContainer';
import QuoteRequestModal from '@/components/modals/QuoteRequestModal';
import AppointmentModal from '@/components/modals/AppointmentModal';
import RepairerProfileModal from '@/components/RepairerProfileModal';
import RepairerBottomPanel from './RepairerBottomPanel';
import MapResultsCounter from './MapResultsCounter';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface EnhancedRepairersMapProps {
  onClose?: () => void;
  searchFilters?: any;
}

const EnhancedRepairersMap: React.FC<EnhancedRepairersMapProps> = ({ 
  onClose, 
  searchFilters 
}) => {
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedRepairer, setSelectedRepairer] = useState<any>(null);

  const { results: repairers, loading, searchRepairers } = useRepairerSearch();
  const { setRepairers, selectedRepairer: mapSelectedRepairer } = useMapStore();
  const { userLocation, getUserLocation } = useGeolocation();

  useEffect(() => {
    if (searchFilters?.deviceModelId && searchFilters?.repairTypeId) {
      searchRepairers(searchFilters);
    }
  }, [searchFilters, searchRepairers]);

  useEffect(() => {
    setRepairers(repairers);
  }, [repairers, setRepairers]);

  useEffect(() => {
    if (mapSelectedRepairer) {
      setSelectedRepairer(mapSelectedRepairer);
      setSelectedRepairerId(mapSelectedRepairer.id);
    }
  }, [mapSelectedRepairer]);

  useEffect(() => {
    if (!userLocation) {
      getUserLocation();
    }
  }, [userLocation, getUserLocation]);

  const handleViewProfile = () => {
    setShowProfileModal(true);
  };

  const handleQuoteRequest = () => {
    setShowQuoteModal(true);
  };

  const handleAppointmentRequest = () => {
    setShowAppointmentModal(true);
  };

  const closeRepairer = () => {
    setSelectedRepairer(null);
    setSelectedRepairerId(null);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 relative">
      {/* Bouton de fermeture global */}
      <Button
        onClick={onClose}
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 z-[60] bg-white hover:bg-gray-100 shadow-lg border-2"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Carte plein écran */}
      <div className="w-full h-full">
        <RepairersMapContainer />
      </div>

      {/* Compteur de résultats */}
      <MapResultsCounter count={repairers.length} />

      {/* Panneau flottant en bas */}
      {selectedRepairer && (
        <RepairerBottomPanel
          repairer={selectedRepairer}
          onClose={closeRepairer}
          onViewProfile={handleViewProfile}
          onQuoteRequest={handleQuoteRequest}
          onAppointmentRequest={handleAppointmentRequest}
          userLocation={userLocation}
        />
      )}

      {/* Modals */}
      {showProfileModal && selectedRepairer && (
        <RepairerProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          repairerId={selectedRepairer.id}
        />
      )}

      {showQuoteModal && selectedRepairer && (
        <QuoteRequestModal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          repairerId={selectedRepairer.id}
        />
      )}

      {showAppointmentModal && selectedRepairer && (
        <AppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          repairerId={selectedRepairer.id}
        />
      )}
    </div>
  );
};

export default EnhancedRepairersMap;

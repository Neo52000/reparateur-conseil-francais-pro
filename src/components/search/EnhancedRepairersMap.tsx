
import React, { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useRepairers } from '@/hooks/useRepairers';
import { useMapStore } from '@/stores/mapStore';
import RepairersMapContainer from '../map/MapContainer';
import QuoteRequestModal from '@/components/modals/QuoteRequestModal';
import AppointmentModal from '@/components/modals/AppointmentModal';
import RepairerProfileModal from '@/components/RepairerProfileModal';
import RepairerSidebar from './RepairerSidebar';
import MapResultsCounter from './MapResultsCounter';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { repairers, loading } = useRepairers(searchFilters);
  const { setRepairers, selectedRepairer: mapSelectedRepairer } = useMapStore();
  const { userLocation, getUserLocation } = useGeolocation();

  useEffect(() => {
    setRepairers(repairers);
  }, [repairers, setRepairers]);

  useEffect(() => {
    if (mapSelectedRepairer) {
      setSelectedRepairer(mapSelectedRepairer);
      setSelectedRepairerId(mapSelectedRepairer.id);
      setSidebarOpen(true);
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex relative">
      <RepairerSidebar
        repairer={selectedRepairer}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        onClose={closeRepairer}
        onViewProfile={handleViewProfile}
        onQuoteRequest={handleQuoteRequest}
        onAppointmentRequest={handleAppointmentRequest}
      />

      {/* Map Container */}
      <div className="flex-1 relative">
        <div className="h-full">
          <RepairersMapContainer />
        </div>

        <MapResultsCounter count={repairers.length} />
      </div>

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


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Phone, Mail, MapPin, Star, Clock, Award, Shield } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useRepairers } from '@/hooks/useRepairers';
import { useMapStore } from '@/stores/mapStore';
import RepairersMapContainer from '../map/MapContainer';
import QuoteRequestModal from '@/components/modals/QuoteRequestModal';
import AppointmentModal from '@/components/modals/AppointmentModal';

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
  const [selectedRepairer, setSelectedRepairer] = useState<any>(null);

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
    }
  }, [mapSelectedRepairer]);

  useEffect(() => {
    // Auto-detect location
    if (!userLocation) {
      getUserLocation();
    }
  }, [userLocation, getUserLocation]);

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
    <div className="fixed inset-0 bg-white z-50 flex">
      {/* Sidebar with repairer details */}
      {selectedRepairer && (
        <div className="w-96 bg-white shadow-xl border-r overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedRepairer.business_name || selectedRepairer.name}
              </h2>
              <Button
                onClick={closeRepairer}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedRepairer.is_verified && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Vérifié
                </Badge>
              )}
              {selectedRepairer.has_qualirepar_label && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Award className="h-3 w-3 mr-1" />
                  QualiRepar
                </Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= (selectedRepairer.rating || 4.8) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {selectedRepairer.rating || 4.8}
                </span>
                <span className="ml-1 text-sm text-gray-600">
                  ({selectedRepairer.review_count || 127} avis)
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {selectedRepairer.city} ({selectedRepairer.postal_code})
              </span>
            </div>

            {/* Services */}
            {selectedRepairer.services && selectedRepairer.services.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Services</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedRepairer.services.slice(0, 3).map((service: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {selectedRepairer.services.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedRepairer.services.length - 3} autres
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Contact Actions */}
            <div className="space-y-3">
              <Button 
                onClick={handleQuoteRequest}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Demander un devis
              </Button>
              
              <Button 
                onClick={handleAppointmentRequest}
                variant="outline" 
                className="w-full"
              >
                <Clock className="h-4 w-4 mr-2" />
                Prendre rendez-vous
              </Button>

              {selectedRepairer.phone && (
                <Button 
                  onClick={() => window.location.href = `tel:${selectedRepairer.phone}`}
                  variant="outline" 
                  className="w-full"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler
                </Button>
              )}

              {selectedRepairer.email && (
                <Button 
                  onClick={() => window.location.href = `mailto:${selectedRepairer.email}`}
                  variant="outline" 
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative">
        {onClose && (
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-white shadow-lg"
          >
            <X className="h-4 w-4 mr-1" />
            Fermer
          </Button>
        )}
        
        <div className="h-full">
          <RepairersMapContainer />
        </div>

        {/* Results counter */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2">
          <span className="text-sm font-medium text-gray-900">
            {repairers.length} réparateur{repairers.length !== 1 ? 's' : ''} trouvé{repairers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Modals */}
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

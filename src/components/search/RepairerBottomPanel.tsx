
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Star, 
  Euro, 
  ChevronUp, 
  ChevronDown,
  User,
  Navigation,
  Shield,
  Award
} from 'lucide-react';

interface RepairerBottomPanelProps {
  repairer: any;
  onClose: () => void;
  onViewProfile: () => void;
  onQuoteRequest: () => void;
  onAppointmentRequest: () => void;
  userLocation?: [number, number] | null;
}

const RepairerBottomPanel: React.FC<RepairerBottomPanelProps> = ({
  repairer,
  onClose,
  onViewProfile,
  onQuoteRequest,
  onAppointmentRequest,
  userLocation
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!repairer) return null;

  const calculateDistance = () => {
    if (!userLocation || !repairer.lat || !repairer.lng) return null;
    
    const [userLat, userLng] = userLocation;
    const R = 6371; // Rayon de la Terre en km
    const dLat = (repairer.lat - userLat) * Math.PI / 180;
    const dLng = (repairer.lng - userLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(repairer.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const distance = calculateDistance();
  const displayPrice = repairer.price_range === 'low' ? '€' : 
                     repairer.price_range === 'medium' ? '€€' : '€€€';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-2xl rounded-t-xl animate-slide-up">
      <div className="max-w-7xl mx-auto">
        {/* Header - toujours visible */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {repairer.business_name || repairer.name}
                  </h3>
                  {repairer.is_verified && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Vérifié
                    </Badge>
                  )}
                  {repairer.has_qualirepar_label && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Award className="h-3 w-3 mr-1" />
                      QualiRepar
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {repairer.city} ({repairer.postal_code})
                    {distance && (
                      <span className="ml-2 text-blue-600 font-medium">
                        à {distance} km
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                    {repairer.rating || 4.8} ({repairer.review_count || 127} avis)
                  </div>
                  
                  <div className="flex items-center">
                    <Euro className="h-4 w-4 mr-1" />
                    {displayPrice}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex space-x-2 mt-3">
            {repairer.phone && (
              <Button
                onClick={() => window.location.href = `tel:${repairer.phone}`}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </Button>
            )}
            
            <Button
              onClick={onQuoteRequest}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              Devis gratuit
            </Button>
            
            <Button
              onClick={onAppointmentRequest}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              RDV
            </Button>
          </div>
        </div>

        {/* Contenu étendu - visible seulement si expanded */}
        {isExpanded && (
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations détaillées */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informations</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{repairer.address}, {repairer.city}</span>
                    </div>
                    {repairer.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{repairer.phone}</span>
                      </div>
                    )}
                    {repairer.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{repairer.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Services */}
                {repairer.services && repairer.services.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {repairer.services.map((service: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions étendues */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 mb-2">Actions</h4>
                
                <Button 
                  onClick={onViewProfile}
                  className="w-full bg-gray-800 hover:bg-gray-900"
                >
                  <User className="h-4 w-4 mr-2" />
                  Voir la fiche complète
                </Button>

                {repairer.email && (
                  <Button 
                    onClick={() => window.location.href = `mailto:${repairer.email}`}
                    variant="outline" 
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer un email
                  </Button>
                )}

                <Button 
                  onClick={() => {
                    if (repairer.lat && repairer.lng) {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${repairer.lat},${repairer.lng}`;
                      window.open(url, '_blank');
                    }
                  }}
                  variant="outline" 
                  className="w-full"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Itinéraire
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepairerBottomPanel;

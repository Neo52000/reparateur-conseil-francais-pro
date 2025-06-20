
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  Clock, 
  Star,
  Shield,
  Calendar
} from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface ClientRepairerProfileHeaderProps {
  profile: RepairerProfile;
  onRequestQuote?: () => void;
  onCallRepairer?: () => void;
  onBookAppointment?: () => void;
}

const ClientRepairerProfileHeader: React.FC<ClientRepairerProfileHeaderProps> = ({
  profile,
  onRequestQuote,
  onCallRepairer,
  onBookAppointment
}) => {
  // Mock rating data - in real app this would come from reviews
  const rating = 4.8;
  const reviewCount = 127;

  const handleCallRepairer = () => {
    if (profile.phone) {
      window.location.href = `tel:${profile.phone}`;
    } else if (onCallRepairer) {
      onCallRepairer();
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Profile Image and Basic Info */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="w-24 h-24 bg-white rounded-xl shadow-md flex items-center justify-center flex-shrink-0">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.business_name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-3xl">🔧</span>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {profile.business_name}
              </h1>
              {profile.has_qualirepar_label && (
                <img 
                  src="https://www.label-qualirepar.fr/wp-content/uploads/2022/06/logo-label-quali-repar-300x169-1.png" 
                  alt="Label Qualirépar" 
                  className="h-8 w-auto"
                />
              )}
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <Shield className="h-3 w-3 mr-1" />
                Vérifié
              </Badge>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 font-semibold text-gray-900">{rating}</span>
                <span className="text-gray-600">({reviewCount} avis)</span>
              </div>
            </div>

            {/* Location and Response Time */}
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                <span>{profile.city} ({profile.postal_code})</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-green-600 font-medium">Répond en 2h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 lg:w-64">
          <Button 
            onClick={onRequestQuote}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition-colors duration-150 hover-scale"
            size="lg"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Demander un devis gratuit
          </Button>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleCallRepairer}
              variant="outline"
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors duration-150 hover-scale"
            >
              <Phone className="h-4 w-4 mr-2" />
              Appeler
            </Button>
            <Button 
              onClick={onBookAppointment}
              variant="outline"
              className="flex-1 border-green-200 text-green-700 hover:bg-green-50 transition-colors duration-150 hover-scale"
            >
              <Calendar className="h-4 w-4 mr-2" />
              RDV
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-600 bg-white rounded-lg p-2">
            <div className="font-medium text-gray-900">📱 Spécialiste iPhone</div>
            <div>À partir de 29€ • Garantie 6 mois</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientRepairerProfileHeader;

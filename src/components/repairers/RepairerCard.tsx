
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Star, Shield, Heart } from 'lucide-react';
import { Repairer } from '@/types/repairer';
import { generateRepairerProfilePath } from '@/utils/profileUtils';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '@/hooks/useFavorites';

interface RepairerCardProps {
  repairer: Repairer;
  onViewProfile: (repairer: Repairer) => void;
  onCall: (phone: string) => void;
}

const RepairerCard: React.FC<RepairerCardProps> = ({ 
  repairer, 
  onViewProfile, 
  onCall 
}) => {
  const navigate = useNavigate();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  
  const handleCall = () => {
    if (repairer.phone) {
      onCall(repairer.phone);
    }
  };

  const handleViewProfile = () => {
    navigate(generateRepairerProfilePath(repairer.id, repairer.business_name));
  };

  const handleToggleFavorite = () => {
    if (isFavorite(repairer.id)) {
      removeFromFavorites(repairer.id);
    } else {
      addToFavorites(repairer.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {repairer.business_name || repairer.name}
            </h3>
            {repairer.has_qualirepar_label && (
              <img 
                src="https://www.label-qualirepar.fr/wp-content/uploads/2022/06/logo-label-quali-repar-300x169-1.png" 
                alt="Label Qualirépar" 
                className="h-6 w-auto"
              />
            )}
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <Shield className="h-3 w-3 mr-1" />
              Vérifié
            </Badge>
          </div>

          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {repairer.city} ({repairer.postal_code})
            </span>
          </div>

          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= (repairer.rating || 4.8) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium text-gray-900">{repairer.rating || 4.8}</span>
              <span className="ml-1 text-sm text-gray-600">({repairer.review_count || 127} avis)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-start">
        <Button 
          onClick={handleViewProfile}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          Visualiser profil
        </Button>
        
        <Button 
          onClick={handleCall}
          variant="outline"
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
          size="sm"
        >
          <Phone className="h-4 w-4 mr-2" />
          Appeler
        </Button>

        <Button 
          onClick={handleToggleFavorite}
          variant="outline"
          className={isFavorite(repairer.id) 
            ? "border-red-200 text-red-700 hover:bg-red-50" 
            : "border-gray-200 text-gray-700 hover:bg-gray-50"
          }
          size="sm"
        >
          <Heart className={`h-4 w-4 mr-1 ${isFavorite(repairer.id) ? 'fill-current' : ''}`} />
          {isFavorite(repairer.id) ? 'Retirer' : 'Favori'}
        </Button>
      </div>
    </div>
  );
};

export default RepairerCard;


import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Shield, Award } from 'lucide-react';

interface RepairerInfoProps {
  repairer: any;
}

const RepairerInfo: React.FC<RepairerInfoProps> = ({ repairer }) => {
  return (
    <>
      {/* Header */}
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 pr-2">
        {repairer.business_name || repairer.name}
      </h2>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Rating */}
      <div className="flex items-center mb-4">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= (repairer.rating || 4.8) 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-2 text-sm font-medium text-gray-900">
            {repairer.rating || 4.8}
          </span>
          <span className="ml-1 text-sm text-gray-600">
            ({repairer.review_count || 127} avis)
          </span>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center text-gray-600 mb-4">
        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
        <span className="text-sm">
          {repairer.city} ({repairer.postal_code})
        </span>
      </div>

      {/* Services */}
      {repairer.services && repairer.services.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Services</h3>
          <div className="flex flex-wrap gap-1">
            {repairer.services.slice(0, 3).map((service: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {service}
              </Badge>
            ))}
            {repairer.services.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{repairer.services.length - 3} autres
              </Badge>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RepairerInfo;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Euro,
  Heart
} from 'lucide-react';
import { RepairerDB } from '@/lib/supabase';
import ClaimProfileBanner from '../ClaimProfileBanner';
import StarRating from './StarRating';
import { getDisplayInfo, getTierBadge } from '@/utils/subscriptionDisplay';

interface RepairerCardProps {
  repairer: RepairerDB;
  compact?: boolean;
  onViewProfile: (repairerId: string) => void;
}

const RepairerCard: React.FC<RepairerCardProps> = ({ repairer, compact = false, onViewProfile }) => {
  // For demo purposes, we'll randomly assign subscription tiers
  const subscriptionTier = ['free', 'basic', 'premium', 'enterprise'][Math.floor(Math.random() * 4)];
  const displayInfo = getDisplayInfo(repairer, subscriptionTier);
  const tierBadge = getTierBadge(subscriptionTier);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          {/* Image */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {repairer.name}
                  </h3>
                  {repairer.is_verified && (
                    <Badge variant="secondary" className="text-xs">
                      Vérifié
                    </Badge>
                  )}
                  {tierBadge && (
                    <Badge variant={tierBadge.variant} className={tierBadge.className}>
                      {tierBadge.label}
                    </Badge>
                  )}
                </div>
                
                {repairer.rating && displayInfo.showContactInfo && (
                  <div className="flex items-center mt-1">
                    <StarRating rating={repairer.rating} reviewCount={repairer.review_count || 0} />
                  </div>
                )}

                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="truncate">{displayInfo.address}, {repairer.city}</span>
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {repairer.services.slice(0, compact ? 2 : 4).map((service: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {repairer.services.length > (compact ? 2 : 4) && (
                    <Badge variant="outline" className="text-xs">
                      +{repairer.services.length - (compact ? 2 : 4)}
                    </Badge>
                  )}
                </div>

                {/* Quick Info */}
                <div className="flex items-center space-x-4 mt-3 text-sm">
                  {repairer.response_time && displayInfo.showContactInfo && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-green-600" />
                      <span className="text-green-600">{repairer.response_time}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Euro className="h-4 w-4 mr-1 text-gray-600" />
                    <span className="text-gray-600">
                      {repairer.price_range === 'low' ? '€' : repairer.price_range === 'medium' ? '€€' : '€€€'}
                    </span>
                  </div>
                  {repairer.is_open !== undefined && displayInfo.showContactInfo && (
                    <div className={`flex items-center ${repairer.is_open ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full mr-1 ${repairer.is_open ? 'bg-green-600' : 'bg-red-600'}`} />
                      <span className="text-xs">{repairer.is_open ? 'Ouvert' : 'Fermé'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 ml-4">
                <Button size="sm" onClick={() => onViewProfile(repairer.id)}>
                  Voir profil
                </Button>
                {displayInfo.showContactInfo && displayInfo.phone && (
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-1" />
                    Appeler
                  </Button>
                )}
                {displayInfo.showQuoteButton && (
                  <Button size="sm" variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Demander un devis
                  </Button>
                )}
                {!compact && (
                  <Button size="sm" variant="ghost">
                    <Heart className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Banner de revendication pour les profils gratuits */}
            {displayInfo.showClaimBanner && !compact && (
              <ClaimProfileBanner businessName={repairer.name} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepairerCard;

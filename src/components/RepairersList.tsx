import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Euro,
  ExternalLink,
  Heart
} from 'lucide-react';
import { useRepairers } from '@/hooks/useRepairers';
import { RepairerDB } from '@/lib/supabase';
import ClaimProfileBanner from './ClaimProfileBanner';

interface RepairersListProps {
  compact?: boolean;
  filters?: any;
}

const RepairersList: React.FC<RepairersListProps> = ({ compact = false, filters }) => {
  // Utiliser les vraies données Supabase
  const { repairers, loading, error } = useRepairers(filters);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  // Function to blur sensitive information based on subscription tier
  const getDisplayInfo = (repairer: RepairerDB, subscriptionTier = 'free') => {
    const isBasicOrHigher = ['basic', 'premium', 'enterprise'].includes(subscriptionTier);
    const isPremiumOrHigher = ['premium', 'enterprise'].includes(subscriptionTier);
    
    return {
      address: isBasicOrHigher ? repairer.address : `${repairer.city} (adresse masquée)`,
      phone: isBasicOrHigher ? repairer.phone : '•••••••••••',
      email: isBasicOrHigher ? repairer.email : '•••••@••••••',
      showQuoteButton: isPremiumOrHigher,
      showContactInfo: isBasicOrHigher,
      showClaimBanner: subscriptionTier === 'free'
    };
  };

  const RepairerCard = ({ repairer }: { repairer: RepairerDB }) => {
    // For demo purposes, we'll randomly assign subscription tiers
    const subscriptionTier = ['free', 'basic', 'premium', 'enterprise'][Math.floor(Math.random() * 4)];
    const displayInfo = getDisplayInfo(repairer, subscriptionTier);

    const getTierBadge = (tier: string) => {
      switch (tier) {
        case 'basic':
          return <Badge variant="outline" className="text-blue-600 border-blue-600">Basique</Badge>;
        case 'premium':
          return <Badge variant="outline" className="text-purple-600 border-purple-600">Premium</Badge>;
        case 'enterprise':
          return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Enterprise</Badge>;
        default:
          return null;
      }
    };

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
                    {getTierBadge(subscriptionTier)}
                  </div>
                  
                  {repairer.rating && displayInfo.showContactInfo && (
                    <div className="flex items-center mt-1">
                      {renderStars(repairer.rating)}
                      <span className="ml-2 text-sm text-gray-600">
                        {repairer.review_count || 0} avis
                      </span>
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
                  <Button size="sm">
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-red-600">Erreur lors du chargement des réparateurs</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {compact && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {repairers.length} réparateurs trouvés
          </h3>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-1" />
            Voir tout
          </Button>
        </div>
      )}

      {repairers.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Aucun réparateur trouvé pour cette recherche</p>
            <p className="text-sm text-gray-400 mt-2">Essayez d'élargir vos critères de recherche</p>
          </CardContent>
        </Card>
      ) : (
        repairers.map((repairer) => (
          <RepairerCard key={repairer.id} repairer={repairer} />
        ))
      )}

      {!compact && repairers.length > 0 && (
        <div className="text-center py-6">
          <Button variant="outline">
            Charger plus de résultats
          </Button>
        </div>
      )}
    </div>
  );
};

export default RepairersList;

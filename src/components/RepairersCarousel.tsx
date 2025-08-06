
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Star, Award, Shield } from 'lucide-react';
import { usePriorityRepairers } from '@/hooks/usePriorityRepairers';
import { Repairer } from '@/types/repairer';
import Autoplay from "embla-carousel-autoplay";
import { generateRepairerProfilePath } from '@/utils/profileUtils';

interface RepairersCarouselProps {
  onViewProfile: (repairer: Repairer) => void;
  onCall: (phone: string) => void;
  searchFilters?: any; // Garder pour compatibilité mais ne plus utiliser
}

const RepairersCarousel: React.FC<RepairersCarouselProps> = ({ 
  onViewProfile, 
  onCall,
  searchFilters // Paramètre ignoré maintenant
}) => {
  const navigate = useNavigate();
  // Utiliser le hook des réparateurs prioritaires au lieu des filtres
  const { repairers, loading } = usePriorityRepairers(20);

  console.log('RepairersCarousel - Priority repairers loaded:', repairers.length);

  if (loading) {
    return (
      <div className="w-full">
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {[...Array(3)].map((_, i) => (
              <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                <Card className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  }

  // Si aucun réparateur, ne rien afficher du tout
  if (repairers.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <Carousel 
        className="w-full max-w-5xl mx-auto"
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {repairers.map((repairer) => (
            <CarouselItem key={repairer.id} className="md:basis-1/2 lg:basis-1/3">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {repairer.business_name || repairer.name}
                      </h3>
                      {repairer.is_verified && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Vérifié
                        </Badge>
                      )}
                      {repairer.has_qualirepar_label && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Qualirepar
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm truncate">
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
                        <span className="ml-1 text-sm text-gray-600">({repairer.review_count || 127})</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Button 
                        onClick={() => navigate(generateRepairerProfilePath(repairer.id, repairer.business_name))}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                        size="sm"
                      >
                        Voir profil
                      </Button>
                      
                      {repairer.phone && (
                        <Button 
                          onClick={() => onCall(repairer.phone!)}
                          variant="outline"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                          size="sm"
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default RepairersCarousel;

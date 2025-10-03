import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Clock, Phone, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RepairerCardProps {
  id: string;
  name: string;
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  distance?: number;
  specialties: string[];
  isOpen: boolean;
  isCertified: boolean;
  isPremium: boolean;
  responseTime?: string;
  avatarUrl?: string;
  onContact: (id: string) => void;
  onViewProfile: (id: string) => void;
}

export const RepairerCard: React.FC<RepairerCardProps> = ({
  id,
  name,
  address,
  city,
  rating,
  reviewCount,
  distance,
  specialties,
  isOpen,
  isCertified,
  isPremium,
  responseTime,
  avatarUrl,
  onContact,
  onViewProfile
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        variant={isPremium ? "premium" : "default"}
        className="group h-full overflow-hidden"
      >
        <CardContent className="p-4 space-y-3">
          {/* Header avec avatar et badges */}
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-border">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base truncate">{name}</h3>
                {isPremium && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="premium" className="shrink-0">
                          <Award className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Réparateur vérifié et certifié</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({reviewCount} avis)
                </span>
                {isCertified && (
                  <Badge variant="success" className="text-xs">
                    Certifié
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-muted-foreground">{address}</p>
              <p className="font-medium">{city}</p>
              {distance && (
                <p className="text-xs text-primary mt-0.5">
                  À {distance.toFixed(1)} km
                </p>
              )}
            </div>
          </div>

          {/* Status et temps de réponse */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={isOpen ? "success" : "secondary"}>
              <Clock className="h-3 w-3 mr-1" />
              {isOpen ? 'Ouvert' : 'Fermé'}
            </Badge>
            {responseTime && (
              <Badge variant="info">
                <TrendingUp className="h-3 w-3 mr-1" />
                Répond en {responseTime}
              </Badge>
            )}
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1.5">
            {specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="glass" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {specialties.length > 3 && (
              <Badge variant="glass" className="text-xs">
                +{specialties.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProfile(id)}
            className="flex-1"
          >
            Voir profil
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onContact(id)}
            className="flex-1 button-lift"
          >
            <Phone className="h-4 w-4 mr-1" />
            Contacter
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Phone, Clock, Shield, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RepairerCardProps {
  id: string;
  name: string;
  city?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  services?: string[];
  isVerified?: boolean;
  isPremium?: boolean;
  phone?: string;
  openNow?: boolean;
}

/**
 * Carte réparateur pour les pages programmatiques
 */
export function RepairerCard({
  id,
  name,
  city,
  address,
  rating,
  reviewCount,
  services = [],
  isVerified = false,
  isPremium = false,
  phone,
  openNow
}: RepairerCardProps) {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${isPremium ? 'border-primary/50 bg-primary/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* En-tête avec badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {isPremium && (
                <Badge variant="default" className="bg-primary">
                  <Award className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
              {isVerified && (
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  Vérifié
                </Badge>
              )}
              {openNow !== undefined && (
                <Badge variant={openNow ? 'default' : 'outline'} className={openNow ? 'bg-green-600' : ''}>
                  <Clock className="h-3 w-3 mr-1" />
                  {openNow ? 'Ouvert' : 'Fermé'}
                </Badge>
              )}
            </div>

            {/* Nom */}
            <Link to={`/reparateur/${id}`}>
              <h3 className="font-semibold text-lg text-foreground hover:text-primary transition-colors line-clamp-1">
                {name}
              </h3>
            </Link>

            {/* Localisation */}
            {(city || address) && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="line-clamp-1">{address || city}</span>
              </p>
            )}

            {/* Note */}
            {rating !== undefined && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                {reviewCount !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    ({reviewCount} avis)
                  </span>
                )}
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {services.slice(0, 4).map((service, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {services.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{services.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button asChild variant="default" className="flex-1">
            <Link to={`/reparateur/${id}`}>
              Voir le profil
            </Link>
          </Button>
          {phone && (
            <Button variant="outline" asChild>
              <a href={`tel:${phone}`}>
                <Phone className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default RepairerCard;

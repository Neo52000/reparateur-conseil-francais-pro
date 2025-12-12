import React from 'react';
import { Phone, User, Star, MapPin, Shield, Crown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Repairer } from '@/types/repairer';

interface RepairerCardEnhancedProps {
  repairer: Repairer & { 
    subscription_tier?: string;
    is_claimed?: boolean;
    user_id?: string | null;
  };
  onClick?: () => void;
  onClaim?: () => void;
}

/**
 * Carte réparateur améliorée avec différenciation par abonnement
 * et appel à l'action pour revendiquer la fiche (modèle Doctolib)
 */
const RepairerCardEnhanced: React.FC<RepairerCardEnhancedProps> = ({
  repairer,
  onClick,
  onClaim,
}) => {
  const tier = repairer.subscription_tier || 'free';
  const isClaimed = repairer.is_claimed || !!repairer.user_id;
  const isPremium = tier === 'premium' || tier === 'enterprise';
  
  // Styles selon le tier
  const getTierStyles = () => {
    switch (tier) {
      case 'enterprise':
        return {
          border: 'border-2 border-amber-400 shadow-lg shadow-amber-100',
          badge: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
          badgeText: '⭐ Premium Pro',
          highlight: true,
        };
      case 'premium':
        return {
          border: 'border-2 border-primary shadow-md shadow-primary/10',
          badge: 'bg-primary text-primary-foreground',
          badgeText: '✓ Premium',
          highlight: true,
        };
      default:
        return {
          border: 'border border-border',
          badge: '',
          badgeText: '',
          highlight: false,
        };
    }
  };

  const styles = getTierStyles();

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${styles.border} ${styles.highlight ? 'bg-gradient-to-br from-background to-muted/30' : 'bg-card'}`}
      onClick={onClick}
    >
      {/* Badge Premium en haut */}
      {isPremium && (
        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-semibold rounded-bl-lg ${styles.badge}`}>
          {styles.badgeText}
        </div>
      )}

      <div className="p-5">
        <div className="flex gap-4">
          {/* Avatar avec indicateur de tier */}
          <div className="relative">
            <Avatar className={`w-16 h-16 rounded-xl ${isPremium ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
              <AvatarImage src={undefined} alt={repairer.name} />
              <AvatarFallback className={`rounded-xl text-lg font-bold ${isPremium ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {repairer.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isPremium && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-base text-foreground truncate">
                {repairer.business_name || repairer.name}
              </h3>
            </div>

            {/* Note et avis */}
            {repairer.rating && (
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(repairer.rating!) ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {repairer.rating.toFixed(1)}
                  {repairer.review_count && ` (${repairer.review_count} avis)`}
                </span>
              </div>
            )}

            {/* Adresse */}
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {repairer.city}{repairer.postal_code && ` (${repairer.postal_code})`}
              </span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {repairer.is_verified && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                  <Shield className="w-3 h-3 mr-1" />
                  Vérifié
                </Badge>
              )}
              {repairer.has_qualirepar_label && (
                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 border-0">
                  QualiRépar
                </Badge>
              )}
              {isPremium && (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-0">
                  Réponse rapide
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Services (version premium seulement) */}
        {isPremium && repairer.services && repairer.services.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Services:</p>
            <div className="flex flex-wrap gap-1">
              {repairer.services.slice(0, 4).map((service, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
              {repairer.services.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{repairer.services.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            variant="outline"
            className="flex-1 gap-2"
            size="sm"
          >
            <User className="w-4 h-4" />
            Voir profil
          </Button>
          {repairer.phone && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`tel:${repairer.phone}`, '_self');
              }}
              className={`flex-1 gap-2 ${isPremium ? 'bg-primary hover:bg-primary/90' : 'bg-primary/80 hover:bg-primary'}`}
              size="sm"
            >
              <Phone className="w-4 h-4" />
              Appeler
            </Button>
          )}
        </div>
      </div>

      {/* Bannière "Revendiquer cette fiche" pour les fiches non revendiquées */}
      {!isClaimed && (
        <div className="bg-muted/50 border-t border-border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Êtes-vous ce réparateur ?</span>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onClaim?.();
              }}
              variant="link"
              size="sm"
              className="text-primary font-semibold px-0 h-auto"
            >
              Revendiquer cette fiche →
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RepairerCardEnhanced;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Clock, 
  Star,
  Calendar,
  MessageSquare,
  FileText,
  Award,
  Shield,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RepairerLevel, RepairerLevelBadge } from './RepairerLevelBadge';
import { Link } from 'react-router-dom';

interface ProfileModularBlocksProps {
  level: RepairerLevel;
  profile: {
    id: string;
    business_name: string;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    address?: string | null;
    city?: string | null;
    postal_code?: string | null;
    description?: string | null;
    rating?: number | null;
    review_count?: number | null;
    is_verified?: boolean;
    has_qualirepar_label?: boolean;
  };
  isOwner?: boolean;
  className?: string;
}

/**
 * Blocs modulaires affichés selon le niveau du réparateur
 * - Niveau 0 : Infos basiques, contact masqué, CTA revendication
 * - Niveau 1 : Contact visible, devis/RDV verrouillés
 * - Niveau 2 : Toutes fonctionnalités sauf exclusivité
 * - Niveau 3 : Badge exclusif, priorité maximale
 */
const ProfileModularBlocks: React.FC<ProfileModularBlocksProps> = ({
  level,
  profile,
  isOwner = false,
  className
}) => {
  const canShowContact = level >= 1;
  const canShowQuote = level >= 2;
  const canShowBooking = level >= 2;
  const isExclusive = level === 3;

  // Masquer partiellement le téléphone pour niveau 0
  const maskedPhone = profile.phone 
    ? profile.phone.slice(0, 4) + ' ** ** **' 
    : null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Badge de niveau */}
      <div className="flex items-center justify-between">
        <RepairerLevelBadge level={level} size="md" />
        {isExclusive && (
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
            Partenaire Exclusif
          </Badge>
        )}
      </div>

      {/* Bloc Contact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact
            {!canShowContact && (
              <Lock className="h-4 w-4 text-muted-foreground ml-auto" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Téléphone */}
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            {canShowContact ? (
              <a 
                href={`tel:${profile.phone}`} 
                className="text-primary hover:underline font-medium"
              >
                {profile.phone || 'Non renseigné'}
              </a>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{maskedPhone}</span>
                <Badge variant="outline" className="text-xs">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Masqué
                </Badge>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            {canShowContact ? (
              <a 
                href={`mailto:${profile.email}`} 
                className="text-primary hover:underline"
              >
                {profile.email || 'Non renseigné'}
              </a>
            ) : (
              <span className="text-muted-foreground">***@***.com</span>
            )}
          </div>

          {/* Site web */}
          {profile.website && canShowContact && (
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          {/* CTA pour niveau 0 */}
          {!canShowContact && (
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Revendiquez cette fiche pour afficher les coordonnées
              </p>
              <Link to="/repairer/auth">
                <Button size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir les coordonnées
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bloc Actions Rapides */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Demande de devis */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Demander un devis</span>
            </div>
            {canShowQuote ? (
              <Link to={`/quote/request?repairer=${profile.id}`}>
                <Button size="sm" variant="default">
                  Demander
                </Button>
              </Link>
            ) : (
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>

          <Separator />

          {/* Prise de RDV */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Prendre rendez-vous</span>
            </div>
            {canShowBooking ? (
              <Link to={`/booking?repairer=${profile.id}`}>
                <Button size="sm" variant="outline">
                  Réserver
                </Button>
              </Link>
            ) : (
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>

          {/* Message pour upgrade */}
          {!canShowQuote && level >= 1 && isOwner && (
            <div className="pt-3 border-t">
              <Link to="/repairer/subscription">
                <Button variant="secondary" size="sm" className="w-full">
                  Passer au Premium pour activer
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bloc Certifications (visible pour tous) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {profile.is_verified && (
            <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Profil vérifié
              </span>
            </div>
          )}
          
          {profile.has_qualirepar_label && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Award className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Label QualiRépar
              </span>
            </div>
          )}

          {isExclusive && (
            <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                Partenaire Exclusif TopReparateurs
              </span>
            </div>
          )}

          {!profile.is_verified && !profile.has_qualirepar_label && !isExclusive && (
            <p className="text-sm text-muted-foreground">
              Aucune certification pour le moment
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bloc Avis (selon niveau) */}
      {level >= 2 && profile.rating && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Avis clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{profile.rating.toFixed(1)}</div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={cn(
                        'h-5 w-5',
                        star <= Math.round(profile.rating || 0)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground'
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {profile.review_count || 0} avis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileModularBlocks;

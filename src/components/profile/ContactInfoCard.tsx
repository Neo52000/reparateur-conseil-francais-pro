
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  MessageCircle, 
  Mail, 
  Globe,
  Navigation,
  Phone
} from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface ContactInfoCardProps {
  profile: RepairerProfile;
  isBlurred?: boolean;
  onClaimProfile?: () => void;
}

const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ 
  profile, 
  isBlurred = false, 
  onClaimProfile 
}) => {
  const handleGetDirections = () => {
    const address = `${profile.address}, ${profile.city} ${profile.postal_code}`;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const handleCall = () => {
    if (profile.phone && !isBlurred) {
      window.open(`tel:${profile.phone}`, '_self');
    }
  };

  const handleWhatsApp = () => {
    if (isBlurred) return;
    const message = encodeURIComponent(`Bonjour, je souhaite des informations sur vos services de réparation. Réparateur: ${profile.business_name}`);
    const phone = profile.phone ? profile.phone.replace(/[^0-9+]/g, '') : '33745062162';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    if (isBlurred) return;
    const email = profile.email || 'contact@topreparateurs.fr';
    window.location.href = `mailto:${email}`;
  };

  // Si la fiche est floutée, on affiche la version floutée
  if (isBlurred) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4">Coordonnées</h3>
          
          {/* Contenu flouté */}
          <div className="filter blur-sm pointer-events-none select-none opacity-50">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-foreground font-medium">●●●●●●●●●●●●●●●●●●●●</p>
                  <p className="text-muted-foreground">{profile.postal_code} {profile.city}</p>
                </div>
                <Button variant="outline" size="sm" disabled>Y aller</Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-foreground font-medium">●● ●● ●● ●● ●●</p>
                  <p className="text-muted-foreground text-sm">Disponible 9h-18h</p>
                </div>
                <Button variant="outline" size="sm" disabled>Appeler</Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-foreground font-medium">●●●●●@●●●●●.●●●</p>
                  <p className="text-muted-foreground text-sm">Réponse sous 2h</p>
                </div>
                <Button variant="outline" size="sm" disabled>Écrire</Button>
              </div>
            </div>
          </div>
          
          {/* Overlay avec call-to-action */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-lg">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Coordonnées masquées</p>
              <p className="text-xs text-muted-foreground mb-3">
                Réservées aux réparateurs vérifiés
              </p>
              {onClaimProfile && (
                <Button 
                  size="sm" 
                  onClick={onClaimProfile}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Revendiquer ma fiche
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-4">Coordonnées</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-gray-900 font-medium">{profile.address}</p>
              <p className="text-gray-600">{profile.postal_code} {profile.city}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGetDirections}
              className="flex-shrink-0"
            >
              <Navigation className="h-4 w-4 mr-1" />
              Y aller
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-foreground font-medium">{profile.phone || '07 45 06 21 62'}</p>
              <p className="text-muted-foreground text-sm">Disponible 9h-18h</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCall}
              className="flex-shrink-0"
            >
              Appeler
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-muted-foreground text-sm">WhatsApp disponible</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleWhatsApp}
              className="flex-shrink-0"
            >
              WhatsApp
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-foreground font-medium">{profile.email || 'contact@topreparateurs.fr'}</p>
              <p className="text-muted-foreground text-sm">Réponse sous 2h</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEmail}
              className="flex-shrink-0"
            >
              Écrire
            </Button>
          </div>
          
          {profile.website && (
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <a 
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Site web
                </a>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactInfoCard;

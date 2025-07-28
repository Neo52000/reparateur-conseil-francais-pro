import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Lock, 
  ExternalLink,
  Shield
} from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface EnhancedBlurredContactProps {
  profile: RepairerProfile;
  onClaimProfile: () => void;
}

const EnhancedBlurredContact: React.FC<EnhancedBlurredContactProps> = ({
  profile,
  onClaimProfile
}) => {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-muted-foreground" />
          Coordonnées
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative">
        {/* Contenu flouté */}
        <div className="filter blur-sm pointer-events-none select-none opacity-60">
          <div className="space-y-4">
            {/* Téléphone */}
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-foreground font-medium">
                  {profile.phone ? profile.phone.replace(/./g, '●') : '●● ●● ●● ●● ●●'}
                </p>
                <p className="text-muted-foreground text-sm">Disponible 9h-18h</p>
              </div>
              <Button variant="outline" size="sm" disabled className="flex-shrink-0">
                Appeler
              </Button>
            </div>
            
            {/* Email */}
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-foreground font-medium">
                  {profile.email ? profile.email.replace(/./g, '●') : '●●●●●@●●●●●.●●●'}
                </p>
                <p className="text-muted-foreground text-sm">Réponse sous 2h</p>
              </div>
              <Button variant="outline" size="sm" disabled className="flex-shrink-0">
                Écrire
              </Button>
            </div>
            
            {/* Adresse */}
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-foreground font-medium">
                  {profile.address.replace(/./g, '●')}
                </p>
                <p className="text-muted-foreground">{profile.postal_code} {profile.city}</p>
              </div>
              <Button variant="outline" size="sm" disabled className="flex-shrink-0">
                Y aller
              </Button>
            </div>
            
            {/* Site web */}
            {profile.website && (
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-foreground font-medium">●●●●●.●●●</p>
                  <p className="text-muted-foreground text-sm">Site officiel</p>
                </div>
                <Button variant="outline" size="sm" disabled className="flex-shrink-0">
                  Visiter
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Overlay avec call-to-action */}
        <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6 max-w-sm">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Coordonnées masquées
            </h3>
            
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Les informations de contact sont réservées aux <strong>réparateurs vérifiés</strong> 
              qui ont revendiqué leur fiche professionnelle.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={onClaimProfile}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Shield className="h-4 w-4 mr-2" />
                Revendiquer ma fiche
              </Button>
              
              <div className="flex items-center justify-center text-xs text-muted-foreground">
                <span>Ou</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => window.open('mailto:contact@topreparateurs.fr?subject=Contact pour ' + profile.business_name, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Nous contacter
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedBlurredContact;
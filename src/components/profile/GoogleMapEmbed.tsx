import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ExternalLink } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface GoogleMapEmbedProps {
  profile: RepairerProfile;
  isBlurred?: boolean;
}

const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({ profile, isBlurred = false }) => {
  const handleOpenInMaps = () => {
    const address = `${profile.address}, ${profile.city} ${profile.postal_code}`;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBQRsYj5zYy5J5Z8Z9X0X0X0X0X0X0X0X0&q=${encodeURIComponent(profile.address + ', ' + profile.city + ' ' + profile.postal_code)}`;

  if (isBlurred) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">Localisation</h3>
          </div>
          
          {/* Carte floutée */}
          <div className="relative">
            <div className="aspect-video bg-muted rounded-lg blur-sm opacity-50">
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                <div className="text-muted-foreground text-sm">
                  Carte de localisation
                </div>
              </div>
            </div>
            
            {/* Overlay avec message */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-border">
              <div className="text-center p-4">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Localisation précise masquée</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ville: {profile.city}
                </p>
                <p className="text-xs text-orange-600 mt-2">
                  → Revendiquez cette fiche pour voir l'adresse exacte
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-lg">Localisation</h3>
          </div>
          <button
            onClick={handleOpenInMaps}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Ouvrir dans Maps
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm">
            <p className="font-medium text-foreground">{profile.address}</p>
            <p className="text-muted-foreground">{profile.postal_code} {profile.city}</p>
          </div>
          
          {/* Iframe Google Maps */}
          <div className="aspect-video rounded-lg overflow-hidden border">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Localisation de ${profile.business_name}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMapEmbed;
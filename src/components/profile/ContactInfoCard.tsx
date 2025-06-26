
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  MessageCircle, 
  Mail, 
  Globe,
  Navigation
} from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface ContactInfoCardProps {
  profile: RepairerProfile;
}

const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ profile }) => {
  const handleGetDirections = () => {
    const address = `${profile.address}, ${profile.city} ${profile.postal_code}`;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Bonjour, je souhaite des informations sur vos services de réparation. Réparateur: ${profile.business_name || profile.first_name + ' ' + profile.last_name}`);
    window.open(`https://wa.me/33745062162?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    window.location.href = `mailto:contact@topreparateurs.fr`;
  };

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
            <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-gray-900 font-medium">07 45 06 21 62</p>
              <p className="text-gray-600 text-sm">Disponible 9h-18h</p>
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
              <p className="text-gray-900 font-medium">contact@topreparateurs.fr</p>
              <p className="text-gray-600 text-sm">Réponse sous 2h</p>
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

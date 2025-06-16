
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Phone, 
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

  const handleCall = () => {
    window.location.href = `tel:${profile.phone}`;
  };

  const handleEmail = () => {
    window.location.href = `mailto:${profile.email}`;
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
            <Phone className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-gray-900 font-medium">{profile.phone}</p>
              <p className="text-gray-600 text-sm">Disponible 9h-18h</p>
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
            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-gray-900 font-medium">{profile.email}</p>
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

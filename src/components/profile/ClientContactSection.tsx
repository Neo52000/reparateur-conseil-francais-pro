
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter,
  Clock,
  Navigation
} from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface ClientContactSectionProps {
  profile: RepairerProfile;
}

const ClientContactSection: React.FC<ClientContactSectionProps> = ({ profile }) => {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact & Localisation</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Info */}
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

          {/* Hours and Social */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Horaires & Réseaux</h3>
              
              {/* Mock hours - in real app this would come from profile */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Clock className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="font-medium">Horaires d'ouverture</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600 ml-7">
                  <div className="flex justify-between">
                    <span>Lun - Ven</span>
                    <span className="font-medium">9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span className="font-medium">9h00 - 16h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span className="text-red-600">Fermé</span>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              {(profile.facebook_url || profile.instagram_url || profile.linkedin_url || profile.twitter_url) && (
                <div>
                  <h4 className="font-medium mb-3">Suivez-nous</h4>
                  <div className="flex space-x-3">
                    {profile.facebook_url && (
                      <a 
                        href={profile.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                    {profile.instagram_url && (
                      <a 
                        href={profile.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {profile.linkedin_url && (
                      <a 
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {profile.twitter_url && (
                      <a 
                        href={profile.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientContactSection;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, Globe, Navigation, Lock } from 'lucide-react';

interface ProfileSidebarProps {
  profile: any;
  isPremium: boolean;
  onClaimProfile: () => void;
  onCallRepairer: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  profile,
  isPremium,
  onClaimProfile,
  onCallRepairer
}) => {
  const handleGetDirections = () => {
    const address = `${profile.address}, ${profile.city} ${profile.postal_code}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Contact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPremium ? (
            <>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{profile.address}</p>
                  <p className="text-sm text-muted-foreground">{profile.postal_code} {profile.city}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={handleGetDirections}>
                <Navigation className="h-4 w-4 mr-2" />
                Itinéraire
              </Button>
              
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <a href={`tel:${profile.phone}`} className="font-medium hover:underline">{profile.phone}</a>
                </div>
              )}
              
              {profile.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <a href={`mailto:${profile.email}`} className="text-sm hover:underline truncate">{profile.email}</a>
                </div>
              )}
              
              {profile.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                    Site web
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Coordonnées complètes masquées</p>
              <p className="text-xs text-muted-foreground mb-4">{profile.city} ({profile.postal_code})</p>
              <Button onClick={onCallRepairer} className="w-full" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Horaires */}
      {isPremium && profile.opening_hours && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Horaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Lun - Ven</span><span>9h - 18h</span></div>
              <div className="flex justify-between"><span>Samedi</span><span>9h - 17h</span></div>
              <div className="flex justify-between"><span>Dimanche</span><span className="text-destructive">Fermé</span></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileSidebar;

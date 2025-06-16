
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock,
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter
} from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface HoursAndSocialCardProps {
  profile: RepairerProfile;
}

const HoursAndSocialCard: React.FC<HoursAndSocialCardProps> = ({ profile }) => {
  return (
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
  );
};

export default HoursAndSocialCard;

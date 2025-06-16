
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Twitter,
  MessageCircle,
  Send
} from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface HoursAndSocialCardProps {
  profile: RepairerProfile;
}

const HoursAndSocialCard: React.FC<HoursAndSocialCardProps> = ({ profile }) => {
  // Ne pas afficher la carte si aucun réseau social n'est disponible
  if (!profile.facebook_url && !profile.instagram_url && !profile.linkedin_url && !profile.twitter_url && !profile.whatsapp_url && !profile.telegram_url && !profile.tiktok_url) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-4">Réseaux sociaux</h3>
        
        <div className="flex flex-wrap gap-3">
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
          {profile.whatsapp_url && (
            <a 
              href={profile.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          )}
          {profile.telegram_url && (
            <a 
              href={profile.telegram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-100 text-blue-500 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Send className="h-5 w-5" />
            </a>
          )}
          {profile.tiktok_url && (
            <a 
              href={profile.tiktok_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors"
            >
              <div className="h-5 w-5 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">T</span>
              </div>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HoursAndSocialCard;

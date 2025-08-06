
import React from 'react';
import { MessageCircle, Mail, Globe, Facebook, Instagram, Linkedin, Twitter, Send } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface ContactSocialTabProps {
  profile: RepairerProfile;
}

const ContactSocialTab: React.FC<ContactSocialTabProps> = ({ profile }) => {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Bonjour, je souhaite des informations sur vos services de réparation.`);
    window.open(`https://wa.me/33745062162?text=${message}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Contact</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 text-gray-500" />
            <button onClick={handleWhatsApp} className="text-blue-600 hover:underline">
              07 45 06 21 62 (WhatsApp)
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>contact@topreparateurs.fr</span>
          </div>
          {profile.website && (
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {profile.website}
              </a>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-4">Réseaux sociaux</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Facebook className="h-4 w-4 text-blue-600" />
            <a 
              href="https://facebook.com/topreparateurs.fr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Facebook
            </a>
          </div>
          {profile.instagram_url && (
            <div className="flex items-center space-x-2">
              <Instagram className="h-4 w-4 text-pink-600" />
              <a 
                href={profile.instagram_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-pink-600 hover:underline"
              >
                Instagram
              </a>
            </div>
          )}
          {profile.linkedin_url && (
            <div className="flex items-center space-x-2">
              <Linkedin className="h-4 w-4 text-blue-700" />
              <a 
                href={profile.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline"
              >
                LinkedIn
              </a>
            </div>
          )}
          {profile.twitter_url && (
            <div className="flex items-center space-x-2">
              <Twitter className="h-4 w-4 text-blue-400" />
              <a 
                href={profile.twitter_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Twitter
              </a>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 text-green-600" />
            <button 
              onClick={handleWhatsApp}
              className="text-green-600 hover:underline"
            >
              WhatsApp
            </button>
          </div>
          {profile.telegram_url && (
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4 text-blue-500" />
              <a 
                href={profile.telegram_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Telegram
              </a>
            </div>
          )}
          {profile.tiktok_url && (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">T</span>
              </div>
              <a 
                href={profile.tiktok_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-black hover:underline"
              >
                TikTok
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactSocialTab;

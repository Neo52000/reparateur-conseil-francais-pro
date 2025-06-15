
import React from 'react';
import { Phone, Mail, Globe, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { RepairerProfile } from '@/services/mockRepairerProfiles';

interface ContactSocialTabProps {
  profile: RepairerProfile;
}

const ContactSocialTab: React.FC<ContactSocialTabProps> = ({ profile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Contact</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{profile.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{profile.email}</span>
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
          {profile.facebook_url && (
            <div className="flex items-center space-x-2">
              <Facebook className="h-4 w-4 text-blue-600" />
              <a 
                href={profile.facebook_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Facebook
              </a>
            </div>
          )}
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
        </div>
      </div>
    </div>
  );
};

export default ContactSocialTab;

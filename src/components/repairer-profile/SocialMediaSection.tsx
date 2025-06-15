
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RepairerProfile } from '@/types/repairerProfile';

interface SocialMediaSectionProps {
  formData: RepairerProfile;
  setFormData: React.Dispatch<React.SetStateAction<RepairerProfile>>;
}

const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Réseaux sociaux</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="facebook_url">Facebook</Label>
          <Input
            id="facebook_url"
            value={formData.facebook_url || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
            placeholder="https://facebook.com/..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram_url">Instagram</Label>
          <Input
            id="instagram_url"
            value={formData.instagram_url || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
            placeholder="https://instagram.com/..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn</Label>
          <Input
            id="linkedin_url"
            value={formData.linkedin_url || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
            placeholder="https://linkedin.com/..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter_url">Twitter</Label>
          <Input
            id="twitter_url"
            value={formData.twitter_url || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, twitter_url: e.target.value }))}
            placeholder="https://twitter.com/..."
          />
        </div>
      </div>
    </div>
  );
};

export default SocialMediaSection;

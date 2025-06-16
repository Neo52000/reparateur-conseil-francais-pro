
import React from 'react';
import { RepairerProfile } from '@/types/repairerProfile';
import ClaimBusinessBanner from '@/components/ClaimBusinessBanner';
import SimplifiedProfileHeader from './SimplifiedProfileHeader';
import SimplifiedProfileActions from './SimplifiedProfileActions';
import SimplifiedBlurredPhotos from './SimplifiedBlurredPhotos';
import SimplifiedBlurredSections from './SimplifiedBlurredSections';

interface ClientSimplifiedProfileProps {
  profile: RepairerProfile;
  onCallRepairer: () => void;
}

const ClientSimplifiedProfile: React.FC<ClientSimplifiedProfileProps> = ({
  profile,
  onCallRepairer
}) => {
  return (
    <div className="space-y-6">
      {/* Header simplifié */}
      <SimplifiedProfileHeader 
        profile={profile} 
        onCallRepairer={onCallRepairer} 
      />

      {/* Actions limitées */}
      <SimplifiedProfileActions profile={profile} />

      {/* Photos floutées */}
      <SimplifiedBlurredPhotos profile={profile} />

      {/* Sections floutées */}
      <SimplifiedBlurredSections />

      {/* Banner de revendication */}
      <ClaimBusinessBanner businessName={profile.business_name} />
    </div>
  );
};

export default ClientSimplifiedProfile;

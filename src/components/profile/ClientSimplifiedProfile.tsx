
import React from 'react';
import { RepairerProfile } from '@/types/repairerProfile';
import EnhancedClaimBanner from '@/components/profile/EnhancedClaimBanner';
import SimplifiedProfileHeader from './SimplifiedProfileHeader';
import SimplifiedProfileActions from './SimplifiedProfileActions';
import SimplifiedBlurredPhotos from './SimplifiedBlurredPhotos';
import SimplifiedBlurredSections from './SimplifiedBlurredSections';
import BlurredProfileContent from './BlurredProfileContent';

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

      {/* Photos floutées avec système de masquage amélioré */}
      <BlurredProfileContent 
        profile={profile} 
        sectionTitle="Galerie photo"
        isVisible={false}
      >
        <SimplifiedBlurredPhotos profile={profile} />
      </BlurredProfileContent>

      {/* Sections floutées avec système de masquage amélioré */}
      <BlurredProfileContent 
        profile={profile} 
        sectionTitle="Services et tarifs"
        isVisible={false}
      >
        <SimplifiedBlurredSections />
      </BlurredProfileContent>

      {/* Banner de revendication amélioré */}
      <EnhancedClaimBanner businessName={profile.business_name} />
    </div>
  );
};

export default ClientSimplifiedProfile;


import React from 'react';
import ContactInfoCard from './ContactInfoCard';
import HoursAndSocialCard from './HoursAndSocialCard';
import { RepairerProfile } from '@/types/repairerProfile';

interface ClientContactSectionProps {
  profile: RepairerProfile;
}

const ClientContactSection: React.FC<ClientContactSectionProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact & Localisation</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContactInfoCard profile={profile} />
          <HoursAndSocialCard profile={profile} />
        </div>
      </div>
    </div>
  );
};

export default ClientContactSection;

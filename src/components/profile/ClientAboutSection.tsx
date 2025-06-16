
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';
import DescriptionRenderer from './DescriptionRenderer';

interface ClientAboutSectionProps {
  profile: RepairerProfile;
}

const ClientAboutSection: React.FC<ClientAboutSectionProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos</h2>
      
      {/* Description principale uniquement */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <Building className="h-5 w-5 mr-2 text-blue-600" />
            Présentation
          </h3>
          {profile.description ? (
            <DescriptionRenderer description={profile.description} />
          ) : (
            <p className="text-gray-500 italic">
              {profile.business_name} est un réparateur professionnel spécialisé dans la réparation d'appareils électroniques.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAboutSection;

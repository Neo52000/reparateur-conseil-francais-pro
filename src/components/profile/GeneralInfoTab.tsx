
import React from 'react';
import { MapPin } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface GeneralInfoTabProps {
  profile: RepairerProfile;
}

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ profile }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">Identité</h3>
          <div className="space-y-2">
            <p><strong>Nom commercial:</strong> {profile.business_name}</p>
            {profile.siret_number && (
              <p><strong>N° SIRET:</strong> {profile.siret_number}</p>
            )}
            {profile.has_qualirepar_label && (
              <div className="flex items-center space-x-2">
                <img 
                  src="https://www.label-qualirepar.fr/wp-content/uploads/2022/06/logo-label-quali-repar-300x169-1.png" 
                  alt="Label Qualirépar" 
                  className="h-6 w-auto"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-2">Adresse</h3>
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 mt-1 text-gray-500" />
            <div>
              <p>{profile.address}</p>
              <p>{profile.postal_code} {profile.city}</p>
            </div>
          </div>
        </div>
      </div>

      {profile.description && (
        <div>
          <h3 className="font-semibold text-lg mb-2">Description</h3>
          <p className="text-gray-700 leading-relaxed">{profile.description}</p>
        </div>
      )}
    </div>
  );
};

export default GeneralInfoTab;

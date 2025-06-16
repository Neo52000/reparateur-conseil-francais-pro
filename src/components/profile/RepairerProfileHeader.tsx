
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface RepairerProfileHeaderProps {
  profile: RepairerProfile;
  onEdit?: () => void;
}

const RepairerProfileHeader: React.FC<RepairerProfileHeaderProps> = ({
  profile,
  onEdit
}) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.business_name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-2xl">🔧</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.business_name}
            </h1>
            {profile.siret_number && (
              <p className="text-sm text-gray-600">SIRET: {profile.siret_number}</p>
            )}
            {profile.has_qualirepar_label && (
              <div className="mt-1">
                <img 
                  src="https://www.label-qualirepar.fr/wp-content/uploads/2022/06/logo-label-quali-repar-300x169-1.png" 
                  alt="Label Qualirépar" 
                  className="h-6 w-auto"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{profile.address}, {profile.city} {profile.postal_code}</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            <span>{profile.phone}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            <span>{profile.email}</span>
          </div>
          {profile.website && (
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Site web
              </a>
            </div>
          )}
        </div>
      </div>

      {onEdit && (
        <Button onClick={onEdit} variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      )}
    </div>
  );
};

export default RepairerProfileHeader;

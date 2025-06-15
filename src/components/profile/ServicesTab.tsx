
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RepairerProfile, getRepairTypeLabel } from '@/services/mockRepairerProfiles';

interface ServicesTabProps {
  profile: RepairerProfile;
}

const ServicesTab: React.FC<ServicesTabProps> = ({ profile }) => {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">Types de réparations proposées</h3>
      <div className="flex flex-wrap gap-2">
        {profile.repair_types.map((type) => (
          <Badge key={type} variant="outline" className="px-3 py-1">
            {getRepairTypeLabel(type)}
          </Badge>
        ))}
        {profile.repair_types.length === 0 && (
          <p className="text-gray-500">Aucun type de réparation spécifié</p>
        )}
      </div>
    </div>
  );
};

export default ServicesTab;

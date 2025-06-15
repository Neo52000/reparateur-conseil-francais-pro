
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { RepairerProfile } from '@/types/repairerProfile';

interface RepairerProfileHeaderProps {
  profile: RepairerProfile;
  onEdit: () => void;
}

const RepairerProfileHeader: React.FC<RepairerProfileHeaderProps> = ({
  profile,
  onEdit
}) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold">{profile.business_name}</h2>
      <Button
        onClick={onEdit}
        variant="outline"
        size="sm"
      >
        <Edit className="h-4 w-4 mr-2" />
        Modifier
      </Button>
    </div>
  );
};

export default RepairerProfileHeader;

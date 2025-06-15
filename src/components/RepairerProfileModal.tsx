
import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { RepairerProfile } from '@/types/repairerProfile';
import { useProfileData } from './repairer-profile-modal/ProfileDataLoader';
import LoadingState from './repairer-profile-modal/LoadingState';
import NotFoundState from './repairer-profile-modal/NotFoundState';
import RepairerProfileModalContent from './repairer-profile-modal/RepairerProfileModalContent';

interface RepairerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  repairerId: string;
  isAdmin?: boolean;
}

const RepairerProfileModal: React.FC<RepairerProfileModalProps> = ({
  isOpen,
  onClose,
  repairerId,
  isAdmin = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { profile, loading } = useProfileData(repairerId, isOpen);

  const handleProfileUpdate = (updatedProfile: RepairerProfile) => {
    setIsEditing(false);
    toast({
      title: "Succès",
      description: "Profil mis à jour avec succès"
    });
  };

  if (loading) {
    return <LoadingState isOpen={isOpen} onClose={onClose} />;
  }

  if (!profile) {
    return <NotFoundState isOpen={isOpen} onClose={onClose} />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <RepairerProfileModalContent
        profile={profile}
        isEditing={isEditing}
        isAdmin={isAdmin}
        onEdit={() => setIsEditing(true)}
        onSave={handleProfileUpdate}
        onCancel={() => setIsEditing(false)}
        onClose={onClose}
      />
    </Dialog>
  );
};

export default RepairerProfileModal;

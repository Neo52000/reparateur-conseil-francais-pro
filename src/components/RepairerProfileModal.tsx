import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { RepairerProfile } from '@/types/repairerProfile';
import { useProfileData } from './repairer-profile-modal/ProfileDataLoader';
import { useAuth } from '@/hooks/useAuth';
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
  const { profile, loading, fetchProfile, refreshProfile } = useProfileData(repairerId, isOpen);
  const { user, isAdmin: userIsAdmin } = useAuth();

  const handleProfileUpdate = async (updatedProfile: RepairerProfile) => {
    // On sauvegarde le profil : possible que le vrai user_id soit différent si création à la volée !
    // On rafraîchit le profil AVEC le bon user_id fraîchement retourné
    try {
      // Ajout d’un log pour bien tracer le user_id utilisé lors du refresh
      const resultUserId = updatedProfile.repairer_id;
      console.log('[RepairerProfileModal] Après save, user_id réel utilisé pour refresh:', resultUserId);

      await fetchProfile(resultUserId || repairerId);
      setIsEditing(false);
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de rafraîchir la fiche après modification. " + (error?.message || ''),
        variant: "destructive"
      });
    }
  };

  // Vérifier si l'utilisateur peut modifier cette fiche
  const canEdit = () => {
    // L'admin peut toujours modifier
    if (userIsAdmin || isAdmin) {
      return true;
    }
    // Le réparateur peut modifier sa propre fiche s'il est connecté
    if (user && profile) {
      // Vérifier si l'utilisateur connecté correspond au propriétaire de la fiche
      return user.id === profile.repairer_id || user.email === profile.email;
    }
    return false;
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
        isAdmin={userIsAdmin || isAdmin}
        canEdit={canEdit()}
        onEdit={() => setIsEditing(true)}
        onSave={handleProfileUpdate}
        onCancel={() => setIsEditing(false)}
        onClose={onClose}
      />
    </Dialog>
  );
};
export default RepairerProfileModal;


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
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { profile, loading, fetchProfile } = useProfileData(repairerId, isOpen);
  const { user, isAdmin: userIsAdmin } = useAuth();

  // Permet de stocker le dernier profil sauvegardé avec succès
  const [lastSavedProfile, setLastSavedProfile] = useState<RepairerProfile | null>(null);

  const handleProfileUpdate = async (updatedProfile: RepairerProfile) => {
    setSaving(true);
    try {
      // Sauvegarde : si une erreur, déclenche le bloc catch
      const resultUserId = updatedProfile.repairer_id;
      await fetchProfile(resultUserId || repairerId);
      setIsEditing(false);

      // On recharge la fiche modifiée (en base) pour vérifier que la modif est bien prise en compte
      await fetchProfile(resultUserId || repairerId);

      setLastSavedProfile(updatedProfile);

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès"
      });
    } catch (error: any) {
      console.error("[RepairerProfileModal] Erreur lors de la sauvegarde ou du refresh :", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder ou rafraîchir la fiche du réparateur. " + (error?.message || ''),
        variant: "destructive"
      });
      // Ne pas fermer l'édition en cas d'erreur !
      return;
    } finally {
      setSaving(false);
    }
  };

  // Vérifier si l'utilisateur peut modifier cette fiche
  const canEdit = () => {
    if (userIsAdmin || isAdmin) {
      return true;
    }
    if (user && profile) {
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
        saving={saving}
      />
    </Dialog>
  );
};
export default RepairerProfileModal;

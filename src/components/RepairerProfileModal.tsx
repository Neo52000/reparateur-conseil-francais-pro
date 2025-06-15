
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

/**
 * Modal pour afficher et éditer les profils réparateurs
 * Gère l'état d'édition, la sauvegarde et le rafraîchissement des données
 */
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

  /**
   * Gère la mise à jour du profil
   */
  const handleProfileUpdate = async (updatedProfile: RepairerProfile) => {
    console.log('🔄 Starting profile update process...');
    setSaving(true);
    
    try {
      // La sauvegarde est gérée dans le formulaire lui-même
      // Ici on rafraîchit simplement les données et ferme l'édition
      await fetchProfile(updatedProfile.repairer_id || repairerId);
      setIsEditing(false);

      console.log('✅ Profile update completed successfully');
      
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès"
      });
    } catch (error: any) {
      console.error('❌ Error during profile update:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Vérifie si l'utilisateur peut modifier cette fiche
   */
  const canEdit = (): boolean => {
    if (userIsAdmin || isAdmin) {
      return true;
    }
    if (user && profile) {
      return user.id === profile.repairer_id || user.email === profile.email;
    }
    return false;
  };

  // États de chargement et d'erreur
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
        onEdit={() => {
          console.log('📝 Starting edit mode...');
          setIsEditing(true);
        }}
        onSave={handleProfileUpdate}
        onCancel={() => {
          console.log('❌ Canceling edit mode...');
          setIsEditing(false);
        }}
        onClose={onClose}
        saving={saving}
      />
    </Dialog>
  );
};

export default RepairerProfileModal;

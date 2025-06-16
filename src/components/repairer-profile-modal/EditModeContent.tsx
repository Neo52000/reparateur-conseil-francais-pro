
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import RepairerProfileForm from '@/components/RepairerProfileForm';
import { RepairerProfile } from '@/types/repairerProfile';

interface EditModeContentProps {
  profile: RepairerProfile;
  onSave: (profile: RepairerProfile) => void;
  onCancel: () => void;
  isAdmin: boolean;
  saving: boolean;
}

const EditModeContent: React.FC<EditModeContentProps> = ({
  profile,
  onSave,
  onCancel,
  isAdmin,
  saving
}) => {
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-profile-description">
      <DialogHeader>
        <DialogTitle>Modifier le profil réparateur</DialogTitle>
        <DialogDescription id="edit-profile-description">
          Modifiez les informations de votre fiche réparateur puis cliquez sur "Enregistrer".
        </DialogDescription>
      </DialogHeader>
      
      <RepairerProfileForm
        profile={profile}
        onSave={onSave}
        onCancel={onCancel}
        isAdmin={isAdmin}
      />
      
      {saving && (
        <div className="text-xs text-blue-800 pt-2">
          Enregistrement en cours...
        </div>
      )}
    </DialogContent>
  );
};

export default EditModeContent;


import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import RepairerProfileHeader from '@/components/profile/RepairerProfileHeader';
import ClientAboutSection from '@/components/profile/ClientAboutSection';
import ClientServicesSection from '@/components/profile/ClientServicesSection';
import ClientContactSection from '@/components/profile/ClientContactSection';
import { RepairerProfile } from '@/types/repairerProfile';

interface AdminModeContentProps {
  profile: RepairerProfile;
  canEdit: boolean;
  onEdit: () => void;
  onClose: () => void;
}

const AdminModeContent: React.FC<AdminModeContentProps> = ({
  profile,
  canEdit,
  onEdit,
  onClose
}) => {
  // Vérifier si c'est un profil basique (créé automatiquement)
  const isBasicProfile = !profile.description && !profile.siret_number && !profile.years_experience;

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="admin-profile-description">
      <DialogHeader>
        <DialogDescription id="admin-profile-description">
          Mode administrateur : consultez ou modifiez la fiche de ce réparateur.
        </DialogDescription>
        <div className="flex items-center justify-between">
          <RepairerProfileHeader
            profile={profile}
            onEdit={undefined}
          />
          <div className="flex gap-2">
            {canEdit && (
              <Button onClick={onEdit} variant="outline">
                Modifier
              </Button>
            )}
            <Button onClick={onClose} variant="outline">
              Fermer
            </Button>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-6">
        {isBasicProfile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Profil automatique :</strong> Ce profil a été créé automatiquement à partir des données de base du réparateur. 
              Le réparateur peut le compléter en se connectant à son espace personnel.
            </p>
          </div>
        )}
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Mode administrateur :</strong> Vous voyez la vue simplifiée. 
            Les clients voient une version améliorée de cette fiche.
          </p>
        </div>
        
        <ClientAboutSection profile={profile} />
        <ClientServicesSection profile={profile} />
        <ClientContactSection profile={profile} />
      </div>
    </DialogContent>
  );
};

export default AdminModeContent;

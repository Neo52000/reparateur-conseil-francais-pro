
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import RepairerProfileForm from '@/components/RepairerProfileForm';
import RepairerProfileHeader from '@/components/profile/RepairerProfileHeader';
import ClientRepairerProfileHeader from '@/components/profile/ClientRepairerProfileHeader';
import ClientAboutSection from '@/components/profile/ClientAboutSection';
import ClientServicesSection from '@/components/profile/ClientServicesSection';
import ClientContactSection from '@/components/profile/ClientContactSection';
import ClientTestimonialsSection from '@/components/profile/ClientTestimonialsSection';
import ClientOpeningHoursSection from '@/components/profile/ClientOpeningHoursSection';
import { RepairerProfile } from '@/types/repairerProfile';

interface RepairerProfileModalContentProps {
  profile: RepairerProfile;
  isEditing: boolean;
  isAdmin?: boolean;
  canEdit?: boolean;
  onEdit: () => void;
  onSave: (profile: RepairerProfile) => void;
  onCancel: () => void;
  onClose: () => void;
  saving?: boolean;
}

/**
 * Contenu de la modal du profil réparateur
 * Affiche différentes vues selon le mode (édition, admin, client)
 */
const RepairerProfileModalContent: React.FC<RepairerProfileModalContentProps> = ({
  profile,
  isEditing,
  isAdmin = false,
  canEdit = false,
  onEdit,
  onSave,
  onCancel,
  onClose,
  saving = false
}) => {
  /**
   * Actions pour les clients
   */
  const handleRequestQuote = () => {
    console.log('📞 Quote requested for:', profile.business_name);
    // TODO: Implémenter la demande de devis
  };

  const handleCallRepairer = () => {
    if (profile.phone) {
      window.location.href = `tel:${profile.phone}`;
    }
  };

  const handleBookAppointment = () => {
    console.log('📅 Appointment booking for:', profile.business_name);
    // TODO: Implémenter la prise de rendez-vous
  };

  // Vérifier si c'est un profil basique (créé automatiquement)
  const isBasicProfile = !profile.description && !profile.siret_number && !profile.years_experience;

  // Vue d'édition
  if (isEditing) {
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
  }

  // Vue administrateur
  if (isAdmin && canEdit) {
    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="admin-profile-description">
        <DialogHeader>
          <DialogTitle>Profil du réparateur</DialogTitle>
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
  }

  // Vue client - design amélioré
  return (
    <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto" aria-describedby="client-profile-description">
      <DialogHeader>
        <DialogTitle>Profil réparateur</DialogTitle>
        <DialogDescription id="client-profile-description">
          Découvrez les informations détaillées sur ce réparateur, ses services et ses avis clients.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-8 p-2">
        <ClientRepairerProfileHeader
          profile={profile}
          onRequestQuote={handleRequestQuote}
          onCallRepairer={handleCallRepairer}
          onBookAppointment={handleBookAppointment}
        />

        <ClientAboutSection profile={profile} />
        <ClientServicesSection profile={profile} />
        <ClientOpeningHoursSection profile={profile} />
        <ClientTestimonialsSection businessName={profile.business_name} />
        <ClientContactSection profile={profile} />

        {/* Actions mobiles sticky */}
        <div className="lg:hidden sticky bottom-0 bg-white border-t p-4 -mx-2 flex space-x-3">
          <Button 
            onClick={handleRequestQuote}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Devis gratuit
          </Button>
          <Button 
            onClick={handleCallRepairer}
            variant="outline"
            className="flex-1"
          >
            Appeler
          </Button>
        </div>

        {/* Bouton de fermeture */}
        <div className="flex justify-center pt-4">
          <Button onClick={onClose} variant="ghost" className="text-gray-500">
            Fermer
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default RepairerProfileModalContent;

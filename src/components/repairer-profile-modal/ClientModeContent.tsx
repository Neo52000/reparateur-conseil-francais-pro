
import React from 'react';
import { DialogContent, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ClientRepairerProfileHeader from '@/components/profile/ClientRepairerProfileHeader';
import ClientAboutSection from '@/components/profile/ClientAboutSection';
import ClientContactSection from '@/components/profile/ClientContactSection';
import ClientTestimonialsSection from '@/components/profile/ClientTestimonialsSection';
import ClientOpeningHoursSection from '@/components/profile/ClientOpeningHoursSection';
import ClientSimplifiedProfile from '@/components/profile/ClientSimplifiedProfile';
import ClaimBusinessBanner from '@/components/ClaimBusinessBanner';
import { RepairerProfile } from '@/types/repairerProfile';

interface ClientModeContentProps {
  profile: RepairerProfile;
  onRequestQuote: () => void;
  onCallRepairer: () => void;
  onBookAppointment: () => void;
  onClose: () => void;
}

const ClientModeContent: React.FC<ClientModeContentProps> = ({
  profile,
  onRequestQuote,
  onCallRepairer,
  onBookAppointment,
  onClose
}) => {
  // Vérifier si c'est un profil basique (créé automatiquement) - fiche non revendiquée
  const isBasicProfile = !profile.description && !profile.siret_number && !profile.years_experience;

  return (
    <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto" aria-describedby="client-profile-description">
      <DialogHeader>
        <DialogDescription id="client-profile-description">
          {isBasicProfile 
            ? 'Informations de base disponibles. Contactez directement le réparateur ou consultez la fiche complète après revendication.'
            : 'Découvrez les informations détaillées sur ce réparateur, ses services et ses avis clients.'
          }
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-8 p-2">
        {isBasicProfile ? (
          // Affichage simplifié pour les fiches non revendiquées
          <ClientSimplifiedProfile
            profile={profile}
            onCallRepairer={onCallRepairer}
          />
        ) : (
          // Affichage complet pour les fiches revendiquées
          <>
            <ClientRepairerProfileHeader
              profile={profile}
              onRequestQuote={onRequestQuote}
              onCallRepairer={onCallRepairer}
              onBookAppointment={onBookAppointment}
            />

            <ClientAboutSection profile={profile} />
            <ClientOpeningHoursSection profile={profile} />
            <ClientTestimonialsSection businessName={profile.business_name} />
            <ClientContactSection profile={profile} />
          </>
        )}

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

export default ClientModeContent;

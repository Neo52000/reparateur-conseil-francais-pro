
import React from 'react';
import { DialogContent, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ClientRepairerProfileHeader from '@/components/profile/ClientRepairerProfileHeader';
import ClientAboutSection from '@/components/profile/ClientAboutSection';
import ClientServicesAndPricingSection from '@/components/profile/ClientServicesAndPricingSection';
import ClientOpeningHoursSection from '@/components/profile/ClientOpeningHoursSection';
import ClientOptionsAndCertificationsSection from '@/components/profile/ClientOptionsAndCertificationsSection';
import LanguagesPaymentCard from '@/components/profile/LanguagesPaymentCard';
import ClientPhotosSection from '@/components/profile/ClientPhotosSection';
import ClientContactSection from '@/components/profile/ClientContactSection';
import ClientTestimonialsSection from '@/components/profile/ClientTestimonialsSection';
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
          <>
            <ClientSimplifiedProfile
              profile={profile}
              onCallRepairer={onCallRepairer}
            />
            
            {/* Afficher les photos même pour les profils basiques */}
            <ClientPhotosSection profile={profile} />
            
            {/* Afficher les horaires même pour les profils basiques */}
            <ClientOpeningHoursSection profile={profile} />
          </>
        ) : (
          // Affichage complet pour les fiches revendiquées
          <>
            {/* 1. En-tête avec actions principales */}
            <ClientRepairerProfileHeader
              profile={profile}
              onRequestQuote={onRequestQuote}
              onCallRepairer={onCallRepairer}
              onBookAppointment={onBookAppointment}
            />

            {/* 2. À propos (présentation uniquement) */}
            <ClientAboutSection profile={profile} />

            {/* 3. Contact et localisation */}
            <ClientContactSection profile={profile} />

            {/* 4. Galerie photo */}
            <ClientPhotosSection profile={profile} />

            {/* 5. Horaires d'ouverture */}
            <ClientOpeningHoursSection profile={profile} />

            {/* 6. Services et tarifs */}
            <ClientServicesAndPricingSection profile={profile} />

            {/* 7. Options et certifications */}
            <ClientOptionsAndCertificationsSection profile={profile} />

            {/* 8. Langues et moyens de paiement */}
            <LanguagesPaymentCard profile={profile} />

            {/* 9. Témoignages */}
            <ClientTestimonialsSection businessName={profile.business_name} />
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

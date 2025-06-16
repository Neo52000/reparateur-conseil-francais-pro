
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ClientRepairerProfileHeader from '@/components/profile/ClientRepairerProfileHeader';
import ClientAboutSection from '@/components/profile/ClientAboutSection';
import ClientServicesSection from '@/components/profile/ClientServicesSection';
import ClientContactSection from '@/components/profile/ClientContactSection';
import ClientTestimonialsSection from '@/components/profile/ClientTestimonialsSection';
import ClientOpeningHoursSection from '@/components/profile/ClientOpeningHoursSection';
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
  // Vérifier si c'est un profil basique (créé automatiquement)
  const isBasicProfile = !profile.description && !profile.siret_number && !profile.years_experience;

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
          onRequestQuote={onRequestQuote}
          onCallRepairer={onCallRepairer}
          onBookAppointment={onBookAppointment}
        />

        <ClientAboutSection profile={profile} />
        <ClientServicesSection profile={profile} />
        <ClientOpeningHoursSection profile={profile} />
        <ClientTestimonialsSection businessName={profile.business_name} />
        <ClientContactSection profile={profile} />

        {/* Bannière de revendication pour les profils basiques non revendiqués */}
        {isBasicProfile && (
          <ClaimBusinessBanner businessName={profile.business_name} />
        )}

        {/* Actions mobiles sticky */}
        <div className="lg:hidden sticky bottom-0 bg-white border-t p-4 -mx-2 flex space-x-3">
          <Button 
            onClick={onRequestQuote}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Devis gratuit
          </Button>
          <Button 
            onClick={onCallRepairer}
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

export default ClientModeContent;

import React from 'react';
import { DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import RepairerProfileForm from '@/components/RepairerProfileForm';
import RepairerProfileHeader from '@/components/profile/RepairerProfileHeader';
import ClientRepairerProfileHeader from '@/components/profile/ClientRepairerProfileHeader';
import ClientAboutSection from '@/components/profile/ClientAboutSection';
import ClientServicesSection from '@/components/profile/ClientServicesSection';
import ClientContactSection from '@/components/profile/ClientContactSection';
import ClientTestimonialsSection from '@/components/profile/ClientTestimonialsSection';
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
}

const RepairerProfileModalContent: React.FC<
  RepairerProfileModalContentProps & { saving?: boolean }
> = ({
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
  const handleRequestQuote = () => {
    // In real app, this would open quote form or navigate to quote page
    console.log('Request quote for:', profile.business_name);
  };

  const handleCallRepairer = () => {
    window.location.href = `tel:${profile.phone}`;
  };

  const handleBookAppointment = () => {
    // In real app, this would open booking modal or navigate to booking page
    console.log('Book appointment with:', profile.business_name);
  };

  if (isEditing) {
    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <h2 className="text-2xl font-semibold">Modifier le profil</h2>
        </DialogHeader>
        <RepairerProfileForm
          profile={profile}
          onSave={onSave}
          onCancel={onCancel}
          isAdmin={isAdmin}
        />
        {saving && (
          <div className="text-xs text-blue-800 pt-2">Enregistrement en cours...</div>
        )}
      </DialogContent>
    );
  }

  // Show admin view for admins
  if (isAdmin && canEdit) {
    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <RepairerProfileHeader
            profile={profile}
            onEdit={canEdit ? onEdit : undefined}
          />
        </DialogHeader>

        <div className="space-y-6">
          {/* Admin can see the old tabbed view for editing purposes */}
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

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </DialogContent>
    );
  }

  // Client view - new beautiful design
  return (
    <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
      <div className="space-y-8 p-2">
        {/* Client-focused header */}
        <ClientRepairerProfileHeader
          profile={profile}
          onRequestQuote={handleRequestQuote}
          onCallRepairer={handleCallRepairer}
          onBookAppointment={handleBookAppointment}
        />

        {/* Main content sections */}
        <ClientAboutSection profile={profile} />
        <ClientServicesSection profile={profile} />
        <ClientTestimonialsSection businessName={profile.business_name} />
        <ClientContactSection profile={profile} />

        {/* Sticky bottom actions for mobile */}
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

        {/* Close button */}
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

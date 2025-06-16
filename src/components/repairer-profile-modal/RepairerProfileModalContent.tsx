
import React from 'react';
import QuoteRequestModal from '@/components/modals/QuoteRequestModal';
import AppointmentModal from '@/components/modals/AppointmentModal';
import EditModeContent from './EditModeContent';
import AdminModeContent from './AdminModeContent';
import ClientModeContent from './ClientModeContent';
import { useQuoteAndAppointment } from '@/hooks/useQuoteAndAppointment';
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
  const {
    isQuoteModalOpen,
    isAppointmentModalOpen,
    selectedRepairerId,
    handleRequestQuote,
    handleBookAppointment,
    closeQuoteModal,
    closeAppointmentModal
  } = useQuoteAndAppointment();

  /**
   * Actions pour les clients
   */
  const handleQuoteRequest = () => {
    handleRequestQuote(profile.id);
  };

  const handleCallRepairer = () => {
    if (profile.phone) {
      window.location.href = `tel:${profile.phone}`;
    }
  };

  const handleAppointmentBooking = () => {
    handleBookAppointment(profile.id);
  };

  // Vue d'édition
  if (isEditing) {
    return (
      <EditModeContent
        profile={profile}
        onSave={onSave}
        onCancel={onCancel}
        isAdmin={isAdmin}
        saving={saving}
      />
    );
  }

  // Vue administrateur
  if (isAdmin && canEdit) {
    return (
      <AdminModeContent
        profile={profile}
        canEdit={canEdit}
        onEdit={onEdit}
        onClose={onClose}
      />
    );
  }

  // Vue client - design amélioré
  return (
    <>
      <ClientModeContent
        profile={profile}
        onRequestQuote={handleQuoteRequest}
        onCallRepairer={handleCallRepairer}
        onBookAppointment={handleAppointmentBooking}
        onClose={onClose}
      />

      {/* Modals pour devis et rendez-vous */}
      {selectedRepairerId && (
        <>
          <QuoteRequestModal
            isOpen={isQuoteModalOpen}
            onClose={closeQuoteModal}
            repairerId={selectedRepairerId}
          />
          <AppointmentModal
            isOpen={isAppointmentModalOpen}
            onClose={closeAppointmentModal}
            repairerId={selectedRepairerId}
          />
        </>
      )}
    </>
  );
};

export default RepairerProfileModalContent;

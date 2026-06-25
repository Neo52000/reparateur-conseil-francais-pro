import React, { useState } from 'react';
import AppointmentModal from '@/components/modals/AppointmentModal';
import EditModeContent from './EditModeContent';
import AdminModeContent from './AdminModeContent';
import ClientModeContent from './ClientModeContent';
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

const RepairerProfileModalContent: React.FC<RepairerProfileModalContentProps> = ({
  profile,
  isEditing,
  isAdmin = false,
  canEdit = false,
  onEdit,
  onSave,
  onCancel,
  onClose,
  saving = false,
}) => {
  const [isAppointmentModalOpen, setAppointmentModalOpen] = useState(false);

  const handleCallRepairer = () => {
    if (profile.phone) {
      window.location.href = `tel:${profile.phone}`;
    }
  };

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

  return (
    <>
      <ClientModeContent
        profile={profile}
        onCallRepairer={handleCallRepairer}
        onBookAppointment={() => setAppointmentModalOpen(true)}
        onClose={onClose}
      />

      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        repairerId={profile.id}
      />
    </>
  );
};

export default RepairerProfileModalContent;

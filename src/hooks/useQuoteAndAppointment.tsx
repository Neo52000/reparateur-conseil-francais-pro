
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const useQuoteAndAppointment = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRequestQuote = (repairerId: string) => {
    if (!user) {
      // Stocker l'intention dans localStorage pour redirection après connexion
      localStorage.setItem('pendingAction', JSON.stringify({
        action: 'quote',
        repairerId: repairerId
      }));
      navigate('/client-auth');
      return;
    }
    
    setSelectedRepairerId(repairerId);
    setIsQuoteModalOpen(true);
  };

  const handleBookAppointment = (repairerId: string) => {
    if (!user) {
      // Stocker l'intention dans localStorage pour redirection après connexion
      localStorage.setItem('pendingAction', JSON.stringify({
        action: 'appointment',
        repairerId: repairerId
      }));
      navigate('/client-auth');
      return;
    }
    
    setSelectedRepairerId(repairerId);
    setIsAppointmentModalOpen(true);
  };

  const closeQuoteModal = () => {
    setIsQuoteModalOpen(false);
    setSelectedRepairerId(null);
  };

  const closeAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setSelectedRepairerId(null);
  };

  return {
    isQuoteModalOpen,
    isAppointmentModalOpen,
    selectedRepairerId,
    handleRequestQuote,
    handleBookAppointment,
    closeQuoteModal,
    closeAppointmentModal
  };
};

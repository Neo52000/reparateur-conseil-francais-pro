
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePendingAction } from '@/hooks/usePendingAction';

export const useQuoteAndAppointment = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | undefined>(undefined);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { storePendingAppointmentAction } = usePendingAction();

  const handleRequestQuote = (repairerId: string) => {
    if (!user) {
      // Stocker l'intention dans localStorage pour redirection après connexion
      localStorage.setItem('pendingQuoteAction', JSON.stringify({
        type: 'quote_request',
        data: { repairerId }
      }));
      navigate('/client-auth');
      return;
    }
    
    setSelectedRepairerId(repairerId);
    setIsQuoteModalOpen(true);
  };

  const handleBookAppointment = (repairerId: string, quoteId?: string) => {
    if (!user) {
      // Utiliser le nouveau système unifié pour les rendez-vous
      storePendingAppointmentAction({ 
        repairerId, 
        quoteId 
      });
      navigate('/client-auth');
      return;
    }
    
    setSelectedRepairerId(repairerId);
    setSelectedQuoteId(quoteId);
    setIsAppointmentModalOpen(true);
  };

  const closeQuoteModal = () => {
    setIsQuoteModalOpen(false);
    setSelectedRepairerId(null);
  };

  const closeAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setSelectedRepairerId(null);
    setSelectedQuoteId(undefined);
  };

  return {
    isQuoteModalOpen,
    isAppointmentModalOpen,
    selectedRepairerId,
    selectedQuoteId,
    handleRequestQuote,
    handleBookAppointment,
    closeQuoteModal,
    closeAppointmentModal
  };
};

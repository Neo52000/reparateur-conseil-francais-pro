
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePendingQuoteAction } from '@/hooks/usePendingQuoteAction';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QuoteFormData {
  device_type: string;
  device_brand: string;
  device_model: string;
  repair_type: string;
  issue_description: string;
  client_email: string;
  client_name: string;
}

export const useQuoteForm = (repairerId: string, isOpen: boolean, onClose: () => void) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { storePendingQuoteAction, executePendingAction, clearPendingAction } = usePendingQuoteAction();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<QuoteFormData>({
    device_type: '',
    device_brand: '',
    device_model: '',
    repair_type: '',
    issue_description: '',
    client_email: '',
    client_name: ''
  });
  const [loading, setLoading] = useState(false);

  // Pré-remplir les données utilisateur si connecté
  useEffect(() => {
    if (user && profile) {
      setFormData(prev => ({
        ...prev,
        client_email: user.email || '',
        client_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      }));
    }
  }, [user, profile]);

  // Restaurer les données d'une action en attente
  useEffect(() => {
    if (isOpen && user) {
      const pendingData = executePendingAction();
      if (pendingData && pendingData.repairerId === repairerId) {
        setFormData({
          device_type: pendingData.device_type,
          device_brand: pendingData.device_brand,
          device_model: pendingData.device_model,
          repair_type: pendingData.repair_type,
          issue_description: pendingData.issue_description,
          client_email: pendingData.client_email,
          client_name: pendingData.client_name
        });
        clearPendingAction();
        toast({
          title: "Données restaurées",
          description: "Votre formulaire de devis a été restauré après connexion."
        });
      }
    }
  }, [isOpen, user, repairerId, executePendingAction, clearPendingAction, toast]);

  const handleAuthRedirect = () => {
    storePendingQuoteAction({
      ...formData,
      repairerId
    });
    onClose();
    navigate('/client-auth');
  };

  const resetForm = () => {
    setFormData({
      device_type: '',
      device_brand: '',
      device_model: '',
      repair_type: '',
      issue_description: '',
      client_email: '',
      client_name: ''
    });
  };

  const submitQuote = async (selectedBrand: any, selectedModel: any, selectedRepairType: any) => {
    if (!user) {
      handleAuthRedirect();
      return;
    }
    
    // Validation des champs obligatoires
    if (!formData.device_type || !formData.device_brand || !formData.device_model || 
        !formData.repair_type || !formData.client_email || !formData.client_name) {
      toast({
        title: "Champs obligatoires",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const quoteData = {
        client_id: user.id,
        repairer_id: repairerId,
        device_brand: selectedBrand?.name || formData.device_brand,
        device_model: selectedModel?.model_name || formData.device_model,
        repair_type: selectedRepairType?.name || formData.repair_type,
        issue_description: formData.issue_description,
        client_email: formData.client_email,
        client_name: formData.client_name
      };

      console.log('🔄 Sending quote request:', quoteData);

      const { data, error } = await supabase
        .from('quotes_with_timeline')
        .insert([quoteData])
        .select('assignment_status');

      if (error) {
        console.error('❌ Error inserting quote:', error);
        throw error;
      }

      // Envoyer la notification au réparateur
      try {
        await supabase
          .from('notifications_system')
          .insert([{
            user_id: repairerId,
            user_type: 'repairer',
            notification_type: 'quote_request',
            title: 'Nouvelle demande de devis',
            message: `Demande de devis pour ${quoteData.device_brand} ${quoteData.device_model} - ${quoteData.repair_type}`
          }]);
      } catch (notifError) {
        console.error('⚠️ Error sending notification:', notifError);
      }

      // Déterminer le message en fonction du statut d'attribution
      const assignmentStatus = data?.[0]?.assignment_status;
      const successMessage = assignmentStatus === 'pending_admin_assignment' 
        ? "Votre devis est en cours de traitement. Un administrateur l'attribuera prochainement à un réparateur qualifié."
        : "Votre demande de devis a été transmise au réparateur. Il a 24h pour vous répondre.";

      toast({
        title: "Demande envoyée !",
        description: successMessage
      });

      onClose();
      resetForm();
    } catch (error) {
      console.error('❌ Error submitting quote request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de devis. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    user,
    submitQuote
  };
};

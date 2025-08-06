import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useQualiReparSubmission = () => {
  const [submitting, setSubmitting] = useState(false);

  const submitDossier = async (dossierId: string, submissionMethod: 'email' | 'api' = 'email') => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('qualirepar-submission', {
        body: {
          dossierId,
          submissionMethod
        }
      });

      if (error) throw error;

      toast.success(`Dossier envoyé avec succès ! Référence de suivi: ${data.tracking_reference}`);
      return data;
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Erreur lors de l\'envoi du dossier');
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const getSubmissionStatus = async (dossierId: string) => {
    try {
      const { data, error } = await supabase
        .from('qualirepar_submissions')
        .select('*')
        .eq('dossier_id', dossierId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching submission status:', error);
      return null;
    }
  };

  return {
    submitDossier,
    getSubmissionStatus,
    submitting
  };
};
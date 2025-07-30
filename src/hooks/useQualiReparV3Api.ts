import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  QualiReparV3AuthResponse,
  QualiReparV3NewClaimRequest,
  QualiReparV3NewClaimResponse,
  QualiReparV3UploadRequest,
  QualiReparV3UploadResponse,
  QualiReparV3ConfirmResponse
} from '@/types/qualirepar';

export const useQualiReparV3Api = () => {
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const authenticateV3 = async (username: string, password: string): Promise<QualiReparV3AuthResponse | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('qualirepar-v3-auth', {
        body: { Username: username, Password: password }
      });

      if (error) throw error;

      setAuthToken(data.AccessToken);
      toast.success('Authentification réussie');
      return data;
    } catch (error) {
      console.error('V3 Auth error:', error);
      toast.error('Erreur d\'authentification');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createClaim = async (claimData: QualiReparV3NewClaimRequest): Promise<QualiReparV3NewClaimResponse | null> => {
    if (!authToken) {
      toast.error('Token d\'authentification manquant');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('qualirepar-v3-new-claim', {
        body: claimData,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (error) throw error;

      toast.success('Demande créée avec succès');
      return data;
    } catch (error) {
      console.error('V3 Create claim error:', error);
      toast.error('Erreur lors de la création de la demande');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateUploadUrl = async (
    reimbursementClaimId: string, 
    uploadRequest: QualiReparV3UploadRequest
  ): Promise<QualiReparV3UploadResponse | null> => {
    if (!authToken) {
      toast.error('Token d\'authentification manquant');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('qualirepar-v3-upload-file', {
        body: {
          ...uploadRequest,
          reimbursementClaimId // Pass as body param since URL construction is complex
        },
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (error) throw error;

      toast.success('URL d\'upload générée');
      return data;
    } catch (error) {
      console.error('V3 Upload URL error:', error);
      toast.error('Erreur lors de la génération de l\'URL');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (uploadUrl: string, file: File): Promise<boolean> => {
    setLoading(true);
    try {
      // Direct upload to the generated URL (no auth token needed)
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      toast.success('Fichier uploadé avec succès');
      return true;
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Erreur lors de l\'upload du fichier');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const confirmClaim = async (reimbursementClaimId: string): Promise<QualiReparV3ConfirmResponse | null> => {
    if (!authToken) {
      toast.error('Token d\'authentification manquant');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('qualirepar-v3-confirm-claim', {
        body: { reimbursementClaimId },
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (error) throw error;

      toast.success(`Demande confirmée - N° SAP: ${data.SapServiceOrder}`);
      return data;
    } catch (error) {
      console.error('V3 Confirm claim error:', error);
      toast.error('Erreur lors de la confirmation');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getClaimStatus = async (reimbursementClaimId: string) => {
    if (!authToken) {
      toast.error('Token d\'authentification manquant');
      return null;
    }

    setLoading(true);
    try {
      // This would call the GET /reimbursement-claims/{id} endpoint
      // For now, we'll query our local database
      const { data, error } = await supabase
        .from('qualirepar_dossiers')
        .select('*')
        .eq('reimbursement_claim_id', reimbursementClaimId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('V3 Get claim status error:', error);
      toast.error('Erreur lors de la récupération du statut');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    authToken,
    authenticateV3,
    createClaim,
    generateUploadUrl,
    uploadFile,
    confirmClaim,
    getClaimStatus
  };
};
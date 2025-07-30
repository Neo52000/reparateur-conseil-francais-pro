import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentUploadOptions {
  fileType: 'serial_tag' | 'invoice' | 'device_picture' | 'claim_request';
  reimbursementClaimId: string;
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

interface DocumentValidationResult {
  isValid: boolean;
  errors: string[];
  metadata: {
    fileSize: number;
    fileType: string;
    dimensions?: { width: number; height: number };
    checksum: string;
  };
}

export const useQualiReparV3DocumentManager = () => {
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);

  // Validation avancée des documents
  const validateDocument = useCallback(async (file: File, options: DocumentUploadOptions): Promise<DocumentValidationResult> => {
    setValidating(true);
    const errors: string[] = [];

    try {
      // 1. Validation de la taille
      const maxSize = (options.maxSizeInMB || 10) * 1024 * 1024;
      if (file.size > maxSize) {
        errors.push(`Fichier trop volumineux (max ${options.maxSizeInMB || 10}MB)`);
      }

      // 2. Validation du type MIME
      const allowedTypes = options.allowedTypes || [
        'image/jpeg', 'image/png', 'image/webp', 'application/pdf'
      ];
      if (!allowedTypes.includes(file.type)) {
        errors.push('Type de fichier non autorisé');
      }

      // 3. Validation spécifique par type de document
      if (options.fileType === 'invoice' && !file.type.includes('pdf') && !file.type.includes('image')) {
        errors.push('Les factures doivent être au format PDF ou image');
      }

      if (options.fileType === 'device_picture' && !file.type.includes('image')) {
        errors.push('Les photos d\'appareil doivent être des images');
      }

      // 4. Calcul du checksum
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const checksum = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // 5. Validation des dimensions pour les images
      let dimensions;
      if (file.type.includes('image')) {
        dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.src = URL.createObjectURL(file);
        });

        // Validation minimale des dimensions
        if (dimensions.width < 100 || dimensions.height < 100) {
          errors.push('Image trop petite (minimum 100x100 pixels)');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        metadata: {
          fileSize: file.size,
          fileType: file.type,
          dimensions,
          checksum
        }
      };

    } catch (error) {
      console.error('Erreur validation document:', error);
      return {
        isValid: false,
        errors: ['Erreur lors de la validation du fichier'],
        metadata: {
          fileSize: file.size,
          fileType: file.type,
          checksum: ''
        }
      };
    } finally {
      setValidating(false);
    }
  }, []);

  // Upload sécurisé vers Supabase Storage
  const uploadDocument = useCallback(async (file: File, options: DocumentUploadOptions) => {
    setUploading(true);

    try {
      // 1. Validation préalable
      const validation = await validateDocument(file, options);
      if (!validation.isValid) {
        throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
      }

      // 2. Génération du nom de fichier sécurisé
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${supabase.auth.getUser()?.data.user?.id}/${options.reimbursementClaimId}/${options.fileType}_${timestamp}_${sanitizedName}`;

      // 3. Upload vers le storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('qualirepar-documents-v3')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 4. Enregistrement en base
      const { data: documentRecord, error: dbError } = await supabase
        .from('qualirepar_documents')
        .insert({
          dossier_id: options.reimbursementClaimId,
          file_type: options.fileType,
          file_path: uploadData.path,
          file_name: file.name,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          file_validation_status: 'validated',
          file_metadata: validation.metadata,
          file_checksum: validation.metadata.checksum,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success('Document uploadé avec succès');
      return {
        success: true,
        document: documentRecord,
        path: uploadData.path
      };

    } catch (error) {
      console.error('Erreur upload document:', error);
      toast.error(`Erreur upload: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setUploading(false);
    }
  }, [validateDocument]);

  // Récupération des documents d'un dossier
  const getDocuments = useCallback(async (reimbursementClaimId: string) => {
    try {
      const { data, error } = await supabase
        .from('qualirepar_documents')
        .select('*')
        .eq('dossier_id', reimbursementClaimId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erreur récupération documents:', error);
      toast.error('Erreur lors du chargement des documents');
      return [];
    }
  }, []);

  // Suppression d'un document
  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      // 1. Récupérer les infos du document
      const { data: doc, error: fetchError } = await supabase
        .from('qualirepar_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Supprimer du storage
      const { error: storageError } = await supabase.storage
        .from('qualirepar-documents-v3')
        .remove([doc.file_path]);

      if (storageError) console.warn('Erreur suppression storage:', storageError);

      // 3. Supprimer de la base
      const { error: dbError } = await supabase
        .from('qualirepar_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast.success('Document supprimé');
      return true;
    } catch (error) {
      console.error('Erreur suppression document:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, []);

  return {
    uploading,
    validating,
    validateDocument,
    uploadDocument,
    getDocuments,
    deleteDocument
  };
};
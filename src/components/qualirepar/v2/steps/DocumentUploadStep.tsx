import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { QualiReparDossier } from '@/types/qualirepar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

interface DocumentUploadStepProps {
  dossier: QualiReparDossier;
  onComplete: (data: { allDocumentsUploaded: boolean }) => void;
  loading: boolean;
}

interface UploadedDocument {
  type: string;
  fileName: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

const REQUIRED_DOCUMENTS = [
  { type: 'FACTURE', label: 'Facture', description: 'Facture de réparation (PDF ou image)', required: true },
  { type: 'BON_DEPOT', label: 'Bon de dépôt', description: 'Bon de dépôt du client', required: true },
  { type: 'SERIALTAG', label: 'Plaque signalétique', description: 'Photo de la plaque signalétique', required: true },
  { type: 'PHOTO_PRODUIT', label: 'Photos produit', description: 'Photos du produit (max 10)', required: false, multiple: true },
];

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  dossier,
  onComplete,
  loading
}) => {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[], documentType: string) => {
    if (rejectedFiles.length > 0) {
      toast.error('Fichier non accepté. Veuillez vérifier le format et la taille.');
      return;
    }

    for (const file of acceptedFiles) {
      await uploadDocument(file, documentType);
    }
  }, [dossier.id]);

  const uploadDocument = async (file: File, documentType: string) => {
    setUploading(true);
    
    const documentId = `${documentType}_${Date.now()}`;
    const newDoc: UploadedDocument = {
      type: documentType,
      fileName: file.name,
      status: 'uploading',
      progress: 0
    };

    setUploadedDocuments(prev => [...prev, newDoc]);

    try {
      // Étape 1: Obtenir l'URL d'upload depuis l'API QualiRépar
      const { data: uploadResponse, error: uploadError } = await supabase.functions.invoke('qualirepar-upload', {
        body: {
          dossierId: dossier.id,
          documentType,
          fileName: file.name
        }
      });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Simuler le progress
      setUploadedDocuments(prev => 
        prev.map(doc => 
          doc.fileName === file.name && doc.type === documentType
            ? { ...doc, progress: 50 }
            : doc
        )
      );

      // Étape 2: Upload du fichier via l'URL PUT fournie par l'API
      // En production, utiliser l'URL retournée par l'API
      const uploadUrl = uploadResponse.uploadUrl;
      
      // Upload réel du fichier via PUT
      const formData = new FormData();
      formData.append('file', file);

      const uploadResult = await fetch(uploadUrl, {
        method: 'PUT',
        body: file
      });

      if (!uploadResult.ok) {
        throw new Error('Upload failed');
      }

      // Étape 3: Confirmer l'upload dans notre base
      const { error: confirmError } = await supabase
        .from('qualirepar_documents')
        .update({
          upload_status: 'completed',
          file_size: file.size,
          mime_type: file.type,
          is_validated: true,
          updated_at: new Date().toISOString()
        })
        .eq('dossier_id', dossier.id)
        .eq('official_document_type', documentType)
        .eq('file_name', file.name);

      if (confirmError) {
        throw new Error('Failed to confirm upload');
      }

      // Mettre à jour le statut du document
      setUploadedDocuments(prev => 
        prev.map(doc => 
          doc.fileName === file.name && doc.type === documentType
            ? { ...doc, status: 'completed', progress: 100 }
            : doc
        )
      );

      toast.success(`Document ${documentType} uploadé avec succès`);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadedDocuments(prev => 
        prev.map(doc => 
          doc.fileName === file.name && doc.type === documentType
            ? { ...doc, status: 'error', error: error.message }
            : doc
        )
      );
      toast.error(`Erreur lors de l'upload: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (fileName: string, type: string) => {
    setUploadedDocuments(prev => 
      prev.filter(doc => !(doc.fileName === fileName && doc.type === type))
    );
  };

  const getDocumentStatus = (documentType: string) => {
    const docs = uploadedDocuments.filter(doc => doc.type === documentType);
    if (docs.length === 0) return 'missing';
    if (docs.some(doc => doc.status === 'completed')) return 'completed';
    if (docs.some(doc => doc.status === 'uploading')) return 'uploading';
    if (docs.some(doc => doc.status === 'error')) return 'error';
    return 'pending';
  };

  const allRequiredDocumentsUploaded = () => {
    const requiredTypes = REQUIRED_DOCUMENTS.filter(doc => doc.required).map(doc => doc.type);
    return requiredTypes.every(type => getDocumentStatus(type) === 'completed');
  };

  const createDropzone = (documentType: string, multiple = false) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files, rejected) => onDrop(files, rejected, documentType),
      accept: {
        'image/*': ['.png', '.jpg', '.jpeg'],
        'application/pdf': ['.pdf']
      },
      maxSize: 10 * 1024 * 1024, // 10MB
      multiple
    });

    return { getRootProps, getInputProps, isDragActive };
  };

  const handleContinue = () => {
    if (allRequiredDocumentsUploaded()) {
      onComplete({ allDocumentsUploaded: true });
    } else {
      toast.error('Veuillez uploader tous les documents requis');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-emerald-600" />
          Étape 2: Upload des documents
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Uploadez les pièces justificatives via l'API sécurisée du Fonds Réparation
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {(dossier.reimbursement_claim_id || dossier.temporary_claim_id) && (
          <Alert className="border-blue-200 bg-blue-50">
            <FileText className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              ID temporaire de demande: <strong>{dossier.reimbursement_claim_id || dossier.temporary_claim_id}</strong>
            </AlertDescription>
          </Alert>
        )}

        {REQUIRED_DOCUMENTS.map((docType) => {
          const status = getDocumentStatus(docType.type);
          const uploadedDocs = uploadedDocuments.filter(doc => doc.type === docType.type);
          const { getRootProps, getInputProps, isDragActive } = createDropzone(docType.type, docType.multiple);

          return (
            <div key={docType.type} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium flex items-center gap-2">
                    {docType.label}
                    {docType.required && <span className="text-red-500">*</span>}
                    {status === 'completed' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                  </h3>
                  <p className="text-sm text-muted-foreground">{docType.description}</p>
                </div>
                <Badge variant={
                  status === 'completed' ? 'default' :
                  status === 'uploading' ? 'secondary' :
                  status === 'error' ? 'destructive' : 'outline'
                }>
                  {status === 'completed' ? 'Uploadé' :
                   status === 'uploading' ? 'En cours' :
                   status === 'error' ? 'Erreur' : 'En attente'}
                </Badge>
              </div>

              {/* Zone de drop */}
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                `}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {isDragActive ? 'Déposez le fichier ici' : 'Cliquez ou glissez-déposez'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, PNG, JPG (max 10MB)
                </p>
              </div>

              {/* Liste des fichiers uploadés */}
              {uploadedDocs.length > 0 && (
                <div className="space-y-2">
                  {uploadedDocs.map((doc, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.fileName}</p>
                        {doc.status === 'uploading' && (
                          <Progress value={doc.progress} className="h-1 mt-1" />
                        )}
                        {doc.status === 'error' && (
                          <p className="text-xs text-red-600">{doc.error}</p>
                        )}
                      </div>
                      {doc.status === 'completed' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                      {doc.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(doc.fileName, doc.type)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Résumé et bouton */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Documents requis uploadés:</span>
            <span className="text-sm">
              {REQUIRED_DOCUMENTS.filter(doc => doc.required && getDocumentStatus(doc.type) === 'completed').length}/
              {REQUIRED_DOCUMENTS.filter(doc => doc.required).length}
            </span>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleContinue}
              disabled={loading || uploading || !allRequiredDocumentsUploaded()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? 'Validation...' : 'Continuer vers la confirmation'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadStep;
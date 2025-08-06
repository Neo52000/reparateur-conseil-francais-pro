import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  CheckCircle, 
  XCircle, 
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface QualiReparDocument {
  id: string;
  dossier_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  is_validated: boolean;
  validation_notes?: string;
  created_at: string;
}

interface QualiReparDocumentManagerProps {
  dossierId: string;
  onDocumentAdded?: () => void;
}

const documentTypes = [
  { value: 'invoice', label: 'Facture', icon: FileText },
  { value: 'proof_of_eligibility', label: 'Preuve d\'éligibilité', icon: File },
  { value: 'device_photo', label: 'Photo de l\'appareil', icon: Image },
  { value: 'repair_report', label: 'Rapport de réparation', icon: FileText },
  { value: 'client_signature', label: 'Signature client', icon: File }
];

const QualiReparDocumentManager: React.FC<QualiReparDocumentManagerProps> = ({
  dossierId,
  onDocumentAdded
}) => {
  const [documents, setDocuments] = useState<QualiReparDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('qualirepar_documents')
        .select('*')
        .eq('dossier_id', dossierId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data || []) as QualiReparDocument[]);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Erreur lors du chargement des documents');
    }
  }, [dossierId]);

  React.useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!selectedType) {
      toast.error('Veuillez sélectionner un type de document');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Le fichier ne doit pas dépasser 10MB');
      return;
    }

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${dossierId}_${selectedType}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('qualirepar-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save document record
      const { data, error } = await supabase
        .from('qualirepar_documents')
        .insert({
          dossier_id: dossierId,
          document_type: selectedType,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          is_validated: false
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Document uploadé avec succès');
      setSelectedType('');
      loadDocuments();
      onDocumentAdded?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload du document');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string, filePath: string) => {
    try {
      // Delete from storage
      await supabase.storage
        .from('qualirepar-documents')
        .remove([filePath]);

      // Delete record
      const { error } = await supabase
        .from('qualirepar_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast.success('Document supprimé');
      loadDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const downloadDocument = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('qualirepar-documents')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeIcon = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.icon : File;
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Ajouter des documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Type de document</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type de document" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">
                Glissez-déposez vos fichiers ici
              </p>
              <p className="text-gray-600 mb-4">
                ou cliquez pour sélectionner
              </p>
              <Input
                type="file"
                className="hidden"
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                disabled={uploading || !selectedType}
              />
              <Button
                variant="outline"
                disabled={uploading || !selectedType}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                {uploading ? 'Upload en cours...' : 'Choisir un fichier'}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Formats acceptés: PDF, JPG, PNG, DOC, DOCX (max 10MB)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents uploadés ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <File className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Aucun document uploadé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const IconComponent = getDocumentTypeIcon(doc.document_type);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-gray-500" />
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge variant="outline">
                            {getDocumentTypeLabel(doc.document_type)}
                          </Badge>
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.is_validated ? (
                        <Badge className="bg-emerald-100 text-emerald-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Validé
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600">
                          <XCircle className="h-3 w-3 mr-1" />
                          En attente
                        </Badge>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadDocument(doc.file_path, doc.file_name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDocument(doc.id, doc.file_path)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QualiReparDocumentManager;
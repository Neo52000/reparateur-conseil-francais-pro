import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, X, FileIcon, Image as ImageIcon, FileText, Film } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  messageId?: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

interface UploadedFile {
  id?: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  messageId,
  onUploadComplete,
  maxFiles = 5,
  maxSizeMB = 10
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Film className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf')) return 'pdf';
    return 'document';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: 'Limite atteinte',
        description: `Vous ne pouvez uploader que ${maxFiles} fichiers maximum`,
        variant: 'destructive'
      });
      return;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSizeBytes) {
        toast({
          title: 'Fichier trop volumineux',
          description: `${file.name} dépasse ${maxSizeMB}MB`,
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const uploadedFiles: UploadedFile[] = [];

      for (const file of validFiles) {
        // Upload vers Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `message-attachments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);

        // Générer thumbnail pour images
        let thumbnailUrl;
        if (file.type.startsWith('image/')) {
          // Ici vous pourriez générer un thumbnail
          // Pour l'instant on utilise l'image originale
          thumbnailUrl = publicUrl;
        }

        const uploadedFile: UploadedFile = {
          name: file.name,
          type: file.type,
          size: file.size,
          url: publicUrl,
          thumbnailUrl
        };

        // Si messageId existe, enregistrer dans la DB
        if (messageId) {
          const { data, error: dbError } = await supabase
            .from('message_attachments' as any)
            .insert({
              message_id: messageId,
              file_name: file.name,
              file_type: getFileType(file.type),
              file_size: file.size,
              storage_path: filePath,
              thumbnail_path: thumbnailUrl,
              mime_type: file.type
            } as any)
            .select()
            .single();

          if (!dbError && data) {
            uploadedFile.id = data.id;
          }
        }

        uploadedFiles.push(uploadedFile);
      }

      setFiles(prev => [...prev, ...uploadedFiles]);
      onUploadComplete?.(uploadedFiles);

      toast({
        title: 'Fichiers uploadés',
        description: `${uploadedFiles.length} fichier(s) ajouté(s) avec succès`
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erreur d\'upload',
        description: 'Impossible d\'uploader les fichiers',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = async (index: number) => {
    const file = files[index];
    
    // Supprimer de la DB si id existe
    if (file.id) {
      await supabase
        .from('message_attachments' as any)
        .delete()
        .eq('id', file.id);
    }

    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {/* Bouton d'upload */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || files.length >= maxFiles}
        >
          <Paperclip className="h-4 w-4 mr-2" />
          {uploading ? 'Upload...' : 'Joindre fichier'}
        </Button>
        {files.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {files.length}/{maxFiles} fichier(s)
          </span>
        )}
      </div>

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 border rounded-md bg-muted/50"
            >
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {file.thumbnailUrl && (
                <img
                  src={file.thumbnailUrl}
                  alt={file.name}
                  className="h-10 w-10 object-cover rounded"
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload } from 'lucide-react';

interface FileUploadAreaProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  supportedFormats: string[];
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  fileInputRef,
  onFileInputChange,
  supportedFormats
}) => {
  return (
    <Card 
      className={`border-2 border-dashed transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <CardContent className="flex flex-col items-center justify-center py-6">
        <FileText className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-2 text-center">
          Glissez un fichier ici ou cliquez pour sélectionner
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Formats supportés: {supportedFormats.join(', ')}
        </p>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">
            Preprocessing intelligent
          </Badge>
          <Badge variant="outline">
            Mode conservateur par défaut
          </Badge>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onFileSelect}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Choisir un fichier
        </Button>
        
        <Input
          ref={fileInputRef}
          type="file"
          accept={supportedFormats.join(',')}
          onChange={onFileInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export default FileUploadArea;

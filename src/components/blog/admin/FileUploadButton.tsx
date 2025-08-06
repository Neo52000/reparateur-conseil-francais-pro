
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadButtonProps {
  onFileContent: (content: string) => void;
  className?: string;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({ onFileContent, className }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const supportedFormats = ['.md', '.txt', '.json'];

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return supportedFormats.includes(extension);
  };

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) {
      toast({
        title: "Format non supporté",
        description: "Seuls les fichiers .md, .txt et .json sont acceptés",
        variant: "destructive"
      });
      return;
    }

    try {
      const content = await readFileContent(file);
      onFileContent(content);
      toast({
        title: "Fichier importé",
        description: `Le contenu de ${file.name} a été ajouté à l'éditeur`
      });
    } catch (error) {
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire le contenu du fichier",
        variant: "destructive"
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className={className}>
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-6">
          <FileText className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2 text-center">
            Glissez un fichier ici ou cliquez pour sélectionner
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Formats supportés: {supportedFormats.join(', ')}
          </p>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Choisir un fichier
          </Button>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept={supportedFormats.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadButton;

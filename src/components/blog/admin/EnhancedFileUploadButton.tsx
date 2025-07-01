
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, AlertCircle, Eye, Settings, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ContentPreprocessor, PreprocessOptions } from '@/services/blog/contentPreprocessor';
import ContentPreview from './ContentPreview';

interface EnhancedFileUploadButtonProps {
  onFileContent: (content: string) => void;
  className?: string;
}

const EnhancedFileUploadButton: React.FC<EnhancedFileUploadButtonProps> = ({ 
  onFileContent, 
  className 
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [originalContent, setOriginalContent] = useState('');
  const [processedContent, setProcessedContent] = useState('');
  const [detectedFormat, setDetectedFormat] = useState<any>(null);
  const [preprocessOptions, setPreprocessOptions] = useState<PreprocessOptions>({
    preserveFormatting: true,
    cleanMetadata: true,
    convertCallouts: true,
    normalizeLineBreaks: true
  });

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

  const processFileContent = (content: string) => {
    // Détecter le format
    const format = ContentPreprocessor.detectFormat(content);
    setDetectedFormat(format);

    // Traiter le contenu
    let processed = ContentPreprocessor.preprocess(content, preprocessOptions);
    
    // Traitement spécifique selon la source
    if (format.source === 'claude') {
      processed = ContentPreprocessor.processClaudeExport(processed);
    }

    // Validation
    const validation = ContentPreprocessor.validateProcessedContent(processed);
    if (!validation.isValid) {
      toast({
        title: "Attention",
        description: `Problèmes détectés: ${validation.issues.join(', ')}`,
        variant: "destructive"
      });
    }

    setOriginalContent(content);
    setProcessedContent(processed);
    setShowPreview(true);
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
      processFileContent(content);
      
      toast({
        title: "Fichier lu avec succès",
        description: `${file.name} analysé - prévisualisez avant d'importer`
      });
    } catch (error) {
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire le contenu du fichier",
        variant: "destructive"
      });
    }
  };

  const handleImport = (useProcessed: boolean = true) => {
    const contentToUse = useProcessed ? processedContent : originalContent;
    onFileContent(contentToUse);
    setShowPreview(false);
    
    toast({
      title: "Contenu importé",
      description: useProcessed ? "Version traitée importée" : "Version originale importée"
    });
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

  const reprocessContent = () => {
    if (originalContent) {
      processFileContent(originalContent);
    }
  };

  if (showPreview) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu avant import
              </CardTitle>
              <div className="flex items-center gap-2">
                {detectedFormat && (
                  <Badge variant="outline">
                    {detectedFormat.source} ({Math.round(detectedFormat.confidence * 100)}%)
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Options de preprocessing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Options de traitement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={preprocessOptions.preserveFormatting}
                      onChange={(e) => setPreprocessOptions(prev => ({
                        ...prev,
                        preserveFormatting: e.target.checked
                      }))}
                    />
                    <span>Préserver le formatage</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={preprocessOptions.cleanMetadata}
                      onChange={(e) => setPreprocessOptions(prev => ({
                        ...prev,
                        cleanMetadata: e.target.checked
                      }))}
                    />
                    <span>Nettoyer les métadonnées</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={preprocessOptions.convertCallouts}
                      onChange={(e) => setPreprocessOptions(prev => ({
                        ...prev,
                        convertCallouts: e.target.checked
                      }))}
                    />
                    <span>Convertir les callouts</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={preprocessOptions.normalizeLineBreaks}
                      onChange={(e) => setPreprocessOptions(prev => ({
                        ...prev,
                        normalizeLineBreaks: e.target.checked
                      }))}
                    />
                    <span>Normaliser les sauts</span>
                  </label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reprocessContent}
                  className="w-full"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Retraiter avec ces options
                </Button>
              </CardContent>
            </Card>

            {/* Aperçu comparatif */}
            <Tabs defaultValue="processed" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="processed">Version traitée</TabsTrigger>
                <TabsTrigger value="original">Version originale</TabsTrigger>
              </TabsList>
              
              <TabsContent value="processed" className="mt-4">
                <div className="max-h-96 overflow-y-auto">
                  <ContentPreview content={processedContent} />
                </div>
              </TabsContent>
              
              <TabsContent value="original" className="mt-4">
                <div className="max-h-96 overflow-y-auto">
                  <ContentPreview content={originalContent} />
                </div>
              </TabsContent>
            </Tabs>

            {/* Actions d'import */}
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={() => handleImport(true)} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Importer la version traitée
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleImport(false)}
                className="flex-1"
              >
                Importer l'original
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <Badge variant="secondary" className="mb-4">
            Preprocessing intelligent activé
          </Badge>
          
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

export default EnhancedFileUploadButton;

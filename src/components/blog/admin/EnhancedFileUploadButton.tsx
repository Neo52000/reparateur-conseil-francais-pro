import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Eye, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ContentPreprocessor, PreprocessOptions, DetectedFormat, ContentComparison } from '@/services/blog/contentPreprocessor';
import ContentPreview from './ContentPreview';
import FileUploadArea from './file-upload/FileUploadArea';
import PreprocessingOptions from './file-upload/PreprocessingOptions';
import ContentAnalysisCard from './file-upload/ContentAnalysisCard';

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
  const [detectedFormat, setDetectedFormat] = useState<DetectedFormat | null>(null);
  const [contentComparison, setContentComparison] = useState<ContentComparison | null>(null);
  const [preprocessOptions, setPreprocessOptions] = useState<PreprocessOptions>({
    preserveFormatting: true,
    cleanMetadata: true,
    convertCallouts: false,
    normalizeLineBreaks: true,
    conservative: true
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
    console.log('🔄 Processing file content...');
    
    const format = ContentPreprocessor.detectFormat(content);
    setDetectedFormat(format);

    let processed = ContentPreprocessor.preprocess(content, preprocessOptions);
    
    if (format.source === 'claude') {
      processed = ContentPreprocessor.processClaudeExport(processed);
    }

    const comparison = ContentPreprocessor.compareContents(content, processed);
    setContentComparison(comparison);

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
        title: "Fichier lu avec succès ✅",
        description: `${file.name} analysé - prévisualisez avant d'importer`
      });
    } catch (error) {
      console.error('❌ File reading error:', error);
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
      title: "Contenu importé ✅",
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
                {contentComparison && contentComparison.majorChanges.length > 0 && (
                  <Badge variant="destructive">
                    {contentComparison.majorChanges.length} changement(s) majeur(s)
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {contentComparison && (
              <ContentAnalysisCard comparison={contentComparison} />
            )}

            <PreprocessingOptions
              options={preprocessOptions}
              onOptionsChange={setPreprocessOptions}
              onReprocess={reprocessContent}
            />

            <Tabs defaultValue="original" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="original">Version originale</TabsTrigger>
                <TabsTrigger value="processed">
                  Version traitée
                  {contentComparison?.majorChanges?.length > 0 && (
                    <span className="ml-1 text-xs bg-orange-500 text-white rounded-full px-1">
                      !
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="original" className="mt-4">
                <div className="max-h-96 overflow-y-auto">
                  <ContentPreview content={originalContent} />
                </div>
              </TabsContent>
              
              <TabsContent value="processed" className="mt-4">
                <div className="max-h-96 overflow-y-auto">
                  <ContentPreview content={processedContent} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={() => handleImport(false)} className="flex-1" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importer l'original
                <Badge variant="secondary" className="ml-2">Recommandé</Badge>
              </Button>
              <Button 
                onClick={() => handleImport(true)}
                className="flex-1"
                variant={contentComparison?.majorChanges?.length > 0 ? "destructive" : "default"}
              >
                Importer la version traitée
                {contentComparison?.majorChanges?.length > 0 && (
                  <Badge variant="secondary" className="ml-2">⚠️</Badge>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <FileUploadArea
        isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileSelect={() => fileInputRef.current?.click()}
        fileInputRef={fileInputRef}
        onFileInputChange={handleFileInputChange}
        supportedFormats={supportedFormats}
      />
    </div>
  );
};

export default EnhancedFileUploadButton;

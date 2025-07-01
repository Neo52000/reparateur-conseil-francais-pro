
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, AlertCircle, Eye, Settings, Wand2, ArrowLeft } from 'lucide-react';
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
  const [contentComparison, setContentComparison] = useState<any>(null);
  const [preprocessOptions, setPreprocessOptions] = useState<PreprocessOptions>({
    preserveFormatting: true,
    cleanMetadata: true,
    convertCallouts: false, // Désactivé par défaut
    normalizeLineBreaks: true,
    conservative: true // Mode conservateur par défaut
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
    console.log('📋 Original content preview:', content.substring(0, 200));
    
    // Détecter le format
    const format = ContentPreprocessor.detectFormat(content);
    setDetectedFormat(format);
    console.log('🔍 Detected format:', format);

    // Traiter le contenu
    let processed = ContentPreprocessor.preprocess(content, preprocessOptions);
    
    // Traitement spécifique selon la source (mode conservateur)
    if (format.source === 'claude') {
      processed = ContentPreprocessor.processClaudeExport(processed);
    }

    // Comparer les contenus
    const comparison = ContentPreprocessor.compareContents(content, processed);
    setContentComparison(comparison);
    console.log('📊 Content comparison:', comparison);

    // Validation
    const validation = ContentPreprocessor.validateProcessedContent(processed);
    if (!validation.isValid) {
      console.warn('⚠️ Validation issues:', validation.issues);
      toast({
        title: "Attention",
        description: `Problèmes détectés: ${validation.issues.join(', ')}`,
        variant: "destructive"
      });
    }

    setOriginalContent(content);
    setProcessedContent(processed);
    setShowPreview(true);
    
    console.log('✅ Processing complete');
    console.log('📝 Processed content preview:', processed.substring(0, 200));
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
    console.log(`📤 Importing ${useProcessed ? 'processed' : 'original'} content`);
    console.log('📋 Content preview:', contentToUse.substring(0, 200));
    
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
      console.log('🔄 Reprocessing with new options:', preprocessOptions);
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
            {/* Informations sur les changements */}
            {contentComparison && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-sm space-y-1">
                    <p><strong>Analyse des modifications:</strong></p>
                    <p>• Lignes modifiées: {contentComparison.linesChanged}</p>
                    <p>• Caractères modifiés: {contentComparison.charactersChanged}</p>
                    {contentComparison.majorChanges.length > 0 && (
                      <div>
                        <p>• Changements majeurs:</p>
                        <ul className="ml-4 list-disc">
                          {contentComparison.majorChanges.map((change: string, index: number) => (
                            <li key={index}>{change}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Options de preprocessing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Options de traitement
                  {preprocessOptions.conservative && (
                    <Badge variant="secondary">Mode conservateur</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={preprocessOptions.conservative}
                      onChange={(e) => setPreprocessOptions(prev => ({
                        ...prev,
                        conservative: e.target.checked
                      }))}
                    />
                    <span>Mode conservateur (recommandé)</span>
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

            {/* Actions d'import */}
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

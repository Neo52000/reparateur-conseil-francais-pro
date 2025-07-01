
import React, { useState, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Maximize2, Minimize2, Eye, EyeOff, FileText, Save } from 'lucide-react';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import './enhanced-markdown-editor.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  placeholder?: string;
  height?: number;
  onSave?: () => void;
  showSaveButton?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  title = "Éditeur Markdown",
  placeholder = "Commencez à écrire votre contenu en Markdown...",
  height = 400,
  onSave,
  showSaveButton = false
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'live' | 'preview'>('live');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const handleChange = useCallback((val?: string) => {
    const newValue = val || '';
    onChange(newValue);
    
    // Calculer les statistiques
    const words = newValue
      .replace(/[#*_`]/g, '') // Retirer les caractères markdown
      .split(/\s+/)
      .filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(newValue.length);
  }, [onChange]);

  return (
    <Card className={isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex gap-1">
            <Badge variant="outline">{wordCount} mots</Badge>
            <Badge variant="outline">{charCount} caractères</Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Contrôles d'affichage */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={previewMode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('edit')}
              className="rounded-r-none"
              title="Mode édition uniquement"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === 'live' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('live')}
              className="rounded-none"
              title="Mode édition + aperçu"
            >
              Mixte
            </Button>
            <Button
              variant={previewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('preview')}
              className="rounded-l-none"
              title="Mode aperçu uniquement"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {showSaveButton && onSave && (
            <Button onClick={onSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className={isFullscreen ? 'h-[calc(100vh-120px)]' : `h-[${height}px]`}>
          <MDEditor
            value={value}
            onChange={handleChange}
            preview={previewMode}
            hideToolbar={false}
            data-color-mode="light"
            height={isFullscreen ? window.innerHeight - 120 : height}
            textareaProps={{
              placeholder,
              style: {
                fontSize: 14,
                lineHeight: 1.6,
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
              }
            }}
            // Configuration avancée pour GFM
            components={{
              preview: (source, state, dispatch) => {
                return (
                  <div className="w-md-editor-preview-content">
                    {/* Le contenu sera rendu avec nos styles harmonisés */}
                  </div>
                );
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MarkdownEditor;

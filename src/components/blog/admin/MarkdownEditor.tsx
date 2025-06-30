import React, { useState, useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Maximize2, Minimize2, Eye, EyeOff, FileText, Save } from 'lucide-react';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import './markdown-editor.css';

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

  const handleChange = useCallback((val?: string) => {
    const newValue = val || '';
    onChange(newValue);
    
    // Calculer le nombre de mots (approximatif)
    const words = newValue
      .replace(/[#*_`]/g, '') // Retirer les caractères markdown
      .split(/\s+/)
      .filter(word => word.length > 0);
    setWordCount(words.length);
  }, [onChange]);

  const insertTemplate = (template: string) => {
    const newValue = value + '\n\n' + template;
    onChange(newValue);
  };

  const templates = [
    {
      name: 'Guide étape par étape',
      content: `## Guide de réparation

### Étape 1: Préparation
- [ ] Outil nécessaire 1
- [ ] Outil nécessaire 2

### Étape 2: Démontage
1. Première action
2. Deuxième action

### Étape 3: Réparation
> ⚠️ **Attention**: Information importante à retenir

### Étape 4: Remontage
- Procédure inverse du démontage

> ✅ **Conseil**: Astuce utile pour réussir`
    },
    {
      name: 'Avertissement sécurité',
      content: `> ⚠️ **ATTENTION - SÉCURITÉ**
> 
> Information importante concernant la sécurité lors de cette réparation.
> Ne pas ignorer ces consignes.`
    },
    {
      name: 'Astuce technique',
      content: `> 💡 **Conseil d'expert**
> 
> Astuce technique pour faciliter la réparation ou éviter les erreurs courantes.`
    }
  ];

  return (
    <Card className={isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </CardTitle>
          <Badge variant="outline">{wordCount} mots</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Templates rapides */}
          <div className="flex gap-1">
            {templates.map((template, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => insertTemplate(template.content)}
                title={`Insérer: ${template.name}`}
              >
                {template.name}
              </Button>
            ))}
          </div>
          
          {/* Contrôles d'affichage */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={previewMode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('edit')}
              className="rounded-r-none"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === 'live' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('live')}
              className="rounded-none"
            >
              Mixte
            </Button>
            <Button
              variant={previewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('preview')}
              className="rounded-l-none"
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
            previewOptions={{
              rehypePlugins: [[require('rehype-highlight')]],
              remarkPlugins: [[require('remark-gfm')], [require('remark-breaks')]]
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MarkdownEditor;

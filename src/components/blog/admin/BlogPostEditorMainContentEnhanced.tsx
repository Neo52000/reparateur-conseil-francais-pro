
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Code, Eye, Upload, Template } from 'lucide-react';
import MarkdownEditor from './MarkdownEditor';
import ContentPreview from './ContentPreview';
import AIEnhancementButton from './AIEnhancementButton';
import FileUploadButton from './FileUploadButton';
import TemplateSelector from './TemplateSelector';

interface BlogPostEditorMainContentEnhancedProps {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onExcerptChange: (excerpt: string) => void;
  onContentChange: (content: string) => void;
}

const BlogPostEditorMainContentEnhanced: React.FC<BlogPostEditorMainContentEnhancedProps> = ({
  title,
  slug,
  excerpt,
  content,
  onTitleChange,
  onSlugChange,
  onExcerptChange,
  onContentChange
}) => {
  const [editorMode, setEditorMode] = useState<'markdown' | 'simple'>('markdown');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleTemplateSelect = (templateContent: string) => {
    const newContent = content + '\n\n' + templateContent;
    onContentChange(newContent);
    setShowTemplates(false);
  };

  const handleFileContent = (fileContent: string) => {
    const newContent = content + '\n\n' + fileContent;
    onContentChange(newContent);
    setShowFileUpload(false);
  };

  return (
    <div className="space-y-6">
      {/* En-tête et slug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informations principales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="title">Titre de l'article</Label>
              <AIEnhancementButton
                field="title"
                currentValue={title}
                onEnhanced={onTitleChange}
                size="sm"
                content={content}
              />
            </div>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Entrez le titre de votre article..."
              className="text-lg font-medium"
            />
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="slug">URL (slug)</Label>
              <AIEnhancementButton
                field="slug"
                currentValue={slug}
                onEnhanced={onSlugChange}
                size="sm"
                content={title}
              />
            </div>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="url-de-votre-article"
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              L'URL sera: /blog/article/{slug}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="excerpt">Extrait (optionnel)</Label>
              <AIEnhancementButton
                field="excerpt"
                currentValue={excerpt}
                onEnhanced={onExcerptChange}
                size="sm"
                content={content}
              />
            </div>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => onExcerptChange(e.target.value)}
              placeholder="Résumé court de l'article qui apparaîtra dans les listes..."
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommandé: 150-160 caractères pour un bon référencement
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Éditeur de contenu */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Contenu de l'article</h3>
            <AIEnhancementButton
              field="content"
              currentValue={content}
              onEnhanced={onContentChange}
              size="sm"
              content={content}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <Template className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFileUpload(!showFileUpload)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importer fichier
            </Button>
            <Badge variant={editorMode === 'markdown' ? 'default' : 'outline'}>
              Markdown
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditorMode(editorMode === 'markdown' ? 'simple' : 'markdown')}
            >
              {editorMode === 'markdown' ? (
                <>
                  <Code className="h-4 w-4 mr-2" />
                  Mode simple
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Mode Markdown
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Templates et upload de fichier */}
        {showTemplates && (
          <div className="mb-4">
            <TemplateSelector onTemplateSelect={handleTemplateSelect} />
          </div>
        )}

        {showFileUpload && (
          <div className="mb-4">
            <FileUploadButton onFileContent={handleFileContent} />
          </div>
        )}

        {editorMode === 'markdown' ? (
          <MarkdownEditor
            value={content}
            onChange={onContentChange}
            title="Contenu de l'article"
            placeholder="# Mon titre d'article

Commencez à écrire votre contenu en Markdown...

## Sous-titre

Votre contenu avec **formatage**, *italique*, et [liens](https://example.com).

### Liste de vérification
- [ ] Tâche 1
- [x] Tâche terminée

> 💡 **Conseil**: Utilisez les templates ci-dessus pour insérer rapidement du contenu formaté."
            height={500}
          />
        ) : (
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Édition
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Aperçu
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <Textarea
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    placeholder="Contenu de votre article..."
                    rows={20}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-4">
              <ContentPreview content={content} title="Aperçu de l'article" />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default BlogPostEditorMainContentEnhanced;

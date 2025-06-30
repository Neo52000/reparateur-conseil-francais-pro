
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Code, Eye } from 'lucide-react';
import MarkdownEditor from './MarkdownEditor';
import ContentPreview from './ContentPreview';

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
            <Label htmlFor="title">Titre de l'article</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Entrez le titre de votre article..."
              className="text-lg font-medium"
            />
          </div>
          
          <div>
            <Label htmlFor="slug">URL (slug)</Label>
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
            <Label htmlFor="excerpt">Extrait (optionnel)</Label>
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
          <h3 className="text-lg font-semibold">Contenu de l'article</h3>
          <div className="flex items-center gap-2">
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

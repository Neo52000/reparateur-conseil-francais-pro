
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AIEnhancementButton from './AIEnhancementButton';
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
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contenu principal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Titre avec IA */}
          <div>
            <Label htmlFor="title">Titre</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Titre de l'article"
                className="flex-1"
              />
              <AIEnhancementButton
                field="title"
                currentValue={title}
                onEnhanced={onTitleChange}
                content={content}
              />
            </div>
          </div>

          {/* Slug avec IA */}
          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="slug"
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
                placeholder="slug-de-larticle"
                className="flex-1"
              />
              <AIEnhancementButton
                field="slug"
                currentValue={title}
                onEnhanced={onSlugChange}
                content={content}
              />
            </div>
          </div>

          {/* Extrait avec IA */}
          <div>
            <Label htmlFor="excerpt">Extrait</Label>
            <div className="flex gap-2 mt-2">
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => onExcerptChange(e.target.value)}
                placeholder="Court résumé de l'article"
                rows={3}
                className="flex-1"
              />
              <div className="flex flex-col justify-start pt-1">
                <AIEnhancementButton
                  field="excerpt"
                  currentValue={title}
                  onEnhanced={onExcerptChange}
                  content={content}
                />
              </div>
            </div>
          </div>

          {/* Contenu avec prévisualisation */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="content">Contenu</Label>
              <AIEnhancementButton
                field="content"
                currentValue={content}
                onEnhanced={onContentChange}
                size="sm"
                variant="ghost"
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => onContentChange(e.target.value)}
                  placeholder="Contenu complet de l'article"
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
              <div className="hidden lg:block">
                <ContentPreview content={content} title="Aperçu formaté" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPostEditorMainContentEnhanced;

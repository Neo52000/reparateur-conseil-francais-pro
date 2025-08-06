
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BlogPostEditorMainContentProps {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onExcerptChange: (excerpt: string) => void;
  onContentChange: (content: string) => void;
}

const BlogPostEditorMainContent: React.FC<BlogPostEditorMainContentProps> = ({
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
    <Card>
      <CardHeader>
        <CardTitle>Contenu principal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Titre de l'article"
          />
        </div>

        <div>
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="slug-de-larticle"
          />
        </div>

        <div>
          <Label htmlFor="excerpt">Extrait</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => onExcerptChange(e.target.value)}
            placeholder="Court résumé de l'article"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="content">Contenu</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Contenu complet de l'article (Markdown supporté)"
            rows={15}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogPostEditorMainContent;

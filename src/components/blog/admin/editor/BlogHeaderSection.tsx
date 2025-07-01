
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import AIEnhancementButton from '../AIEnhancementButton';

interface BlogHeaderSectionProps {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onExcerptChange: (excerpt: string) => void;
}

const BlogHeaderSection: React.FC<BlogHeaderSectionProps> = ({
  title,
  slug,
  excerpt,
  content,
  onTitleChange,
  onSlugChange,
  onExcerptChange
}) => {
  return (
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
  );
};

export default BlogHeaderSection;

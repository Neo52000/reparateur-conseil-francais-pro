
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { BlogCategory } from '@/types/blog';

interface BlogPostEditorSidebarProps {
  status: 'draft' | 'pending' | 'scheduled' | 'published' | 'archived';
  visibility: 'public' | 'repairers' | 'both';
  categoryId: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  categories: BlogCategory[];
  onStatusChange: (status: 'draft' | 'pending' | 'scheduled' | 'published' | 'archived') => void;
  onVisibilityChange: (visibility: 'public' | 'repairers' | 'both') => void;
  onCategoryChange: (categoryId: string) => void;
  onMetaTitleChange: (metaTitle: string) => void;
  onMetaDescriptionChange: (metaDescription: string) => void;
  onKeywordsChange: (keywords: string) => void;
  onSave: () => void;
}

const BlogPostEditorSidebar: React.FC<BlogPostEditorSidebarProps> = ({
  status,
  visibility,
  categoryId,
  metaTitle,
  metaDescription,
  keywords,
  categories,
  onStatusChange,
  onVisibilityChange,
  onCategoryChange,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onKeywordsChange,
  onSave
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Publication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="status">Statut</Label>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="scheduled">Programmé</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="visibility">Visibilité</Label>
            <Select value={visibility} onValueChange={onVisibilityChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="repairers">Réparateurs uniquement</SelectItem>
                <SelectItem value="both">Les deux</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Select value={categoryId} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="meta_title">Titre SEO</Label>
            <Input
              id="meta_title"
              value={metaTitle}
              onChange={(e) => onMetaTitleChange(e.target.value)}
              placeholder="Titre pour les moteurs de recherche"
            />
          </div>

          <div>
            <Label htmlFor="meta_description">Description SEO</Label>
            <Textarea
              id="meta_description"
              value={metaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              placeholder="Description pour les moteurs de recherche"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="keywords">Mots-clés (séparés par des virgules)</Label>
            <Input
              id="keywords"
              value={keywords.join(', ')}
              onChange={(e) => onKeywordsChange(e.target.value)}
              placeholder="réparation, smartphone, conseil"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPostEditorSidebar;

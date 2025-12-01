
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { BlogCategory } from '@/types/blog';
import AIEnhancementButton from './AIEnhancementButton';

interface BlogPostEditorSidebarEnhancedProps {
  status: 'draft' | 'pending' | 'scheduled' | 'published' | 'archived';
  visibility: 'public' | 'repairers' | 'both';
  categoryId: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  categories: BlogCategory[];
  title: string;
  content: string;
  onStatusChange: (status: 'draft' | 'pending' | 'scheduled' | 'published' | 'archived') => void;
  onVisibilityChange: (visibility: 'public' | 'repairers' | 'both') => void;
  onCategoryChange: (categoryId: string) => void;
  onMetaTitleChange: (metaTitle: string) => void;
  onMetaDescriptionChange: (metaDescription: string) => void;
  onKeywordsChange: (keywords: string) => void;
  onSave: () => void;
}

const BlogPostEditorSidebarEnhanced: React.FC<BlogPostEditorSidebarEnhancedProps> = ({
  status,
  visibility,
  categoryId,
  metaTitle,
  metaDescription,
  keywords,
  categories,
  title,
  content,
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
            <Select 
              value={categoryId || "none"} 
              onValueChange={(value) => onCategoryChange(value === "none" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune catégorie</SelectItem>
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
          <CardTitle>SEO Optimisé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Titre SEO avec IA */}
          <div>
            <Label htmlFor="meta_title">Titre SEO (max 60 caractères)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="meta_title"
                value={metaTitle}
                onChange={(e) => onMetaTitleChange(e.target.value)}
                placeholder="Titre pour les moteurs de recherche"
                className="flex-1"
                maxLength={60}
              />
              <AIEnhancementButton
                field="meta_title"
                currentValue={title}
                onEnhanced={onMetaTitleChange}
                content={content}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metaTitle.length}/60 caractères
            </p>
          </div>

          {/* Description SEO avec IA */}
          <div>
            <Label htmlFor="meta_description">Description SEO (max 160 caractères)</Label>
            <div className="flex gap-2 mt-2">
              <Textarea
                id="meta_description"
                value={metaDescription}
                onChange={(e) => onMetaDescriptionChange(e.target.value)}
                placeholder="Description pour les moteurs de recherche"
                rows={3}
                className="flex-1"
                maxLength={160}
              />
              <div className="flex flex-col justify-start pt-1">
                <AIEnhancementButton
                  field="meta_description"
                  currentValue={title}
                  onEnhanced={onMetaDescriptionChange}
                  content={content}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metaDescription.length}/160 caractères
            </p>
          </div>

          {/* Mots-clés avec IA */}
          <div>
            <Label htmlFor="keywords">Mots-clés SEO</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="keywords"
                value={keywords.join(', ')}
                onChange={(e) => onKeywordsChange(e.target.value)}
                placeholder="réparation, smartphone, conseil"
                className="flex-1"
              />
              <AIEnhancementButton
                field="keywords"
                currentValue={title}
                onEnhanced={(newKeywords) => onKeywordsChange(newKeywords)}
                content={content}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Séparez les mots-clés par des virgules
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPostEditorSidebarEnhanced;

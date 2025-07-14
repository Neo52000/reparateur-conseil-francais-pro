
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Upload } from 'lucide-react';
import FileUploadButton from './FileUploadButton';

interface BlogPostEditorImageSectionProps {
  featuredImageUrl: string;
  onImageUrlChange: (url: string) => void;
  onShowImageGenerator: () => void;
  onAutoGenerateImage: () => void;
  articleTitle: string;
}

const BlogPostEditorImageSection: React.FC<BlogPostEditorImageSectionProps> = ({
  featuredImageUrl,
  onImageUrlChange,
  onShowImageGenerator,
  onAutoGenerateImage,
  articleTitle
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Image à la une</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button 
              variant="default" 
              size="sm"
              onClick={onAutoGenerateImage}
              disabled={!articleTitle.trim()}
              className="flex-1"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Générer depuis le titre
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onShowImageGenerator}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Générateur avancé
            </Button>
          </div>
          <div>
            <Label htmlFor="featured_image">URL de l'image</Label>
            <Input
              id="featured_image"
              value={featuredImageUrl}
              onChange={(e) => onImageUrlChange(e.target.value)}
              placeholder="https://exemple.com/image.jpg"
            />
          </div>

          <div>
            <Label>Ou importer depuis votre ordinateur</Label>
            <FileUploadButton
              onFileContent={(content) => {
                // Pour les images, on ne peut pas directement utiliser le contenu texte
                // Il faudrait un système d'upload de fichiers image
                console.log('Image content loaded, but needs file upload system');
              }}
              className="mt-2"
            />
          </div>
          {featuredImageUrl && (
            <div className="border rounded-lg p-4">
              <img 
                src={featuredImageUrl} 
                alt="Aperçu" 
                className="max-w-full h-48 object-cover rounded"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogPostEditorImageSection;

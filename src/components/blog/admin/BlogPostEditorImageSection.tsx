
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2 } from 'lucide-react';

interface BlogPostEditorImageSectionProps {
  featuredImageUrl: string;
  onImageUrlChange: (url: string) => void;
  onShowImageGenerator: () => void;
}

const BlogPostEditorImageSection: React.FC<BlogPostEditorImageSectionProps> = ({
  featuredImageUrl,
  onImageUrlChange,
  onShowImageGenerator
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Image à la une
          <Button 
            variant="outline" 
            size="sm"
            onClick={onShowImageGenerator}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Générer avec IA
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="featured_image">URL de l'image</Label>
            <Input
              id="featured_image"
              value={featuredImageUrl}
              onChange={(e) => onImageUrlChange(e.target.value)}
              placeholder="https://exemple.com/image.jpg"
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

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useBlogHeaderImage } from '@/hooks/blog/useBlogHeaderImage';

const BlogHeaderImageManager: React.FC = () => {
  const { headerImageUrl, loading, generateHeaderImage } = useBlogHeaderImage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Image d'en-tête du blog
        </CardTitle>
        <CardDescription>
          Générez une image moderne pour l'en-tête de votre blog
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {headerImageUrl && (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <img
              src={headerImageUrl}
              alt="Header preview"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none" />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={generateHeaderImage}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {headerImageUrl ? 'Régénérer l\'image' : 'Générer l\'image'}
              </>
            )}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          L'image sera générée avec Gemini AI et optimisée pour l'en-tête du blog avec des tons émeraude.
        </p>
      </CardContent>
    </Card>
  );
};

export default BlogHeaderImageManager;

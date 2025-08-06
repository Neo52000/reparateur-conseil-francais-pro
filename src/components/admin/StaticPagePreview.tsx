
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface StaticPagePreviewProps {
  title: string;
  content: string;
  metaDescription: string;
}

const StaticPagePreview: React.FC<StaticPagePreviewProps> = ({
  title,
  content,
  metaDescription
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Aperçu de la page
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!content?.trim() ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucun contenu à prévisualiser</p>
            <p className="text-sm mt-2">Ajoutez du contenu pour voir l'aperçu</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Aperçu SEO */}
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Aperçu dans les résultats de recherche
              </h3>
              <div className="space-y-1">
                <div className="text-blue-600 text-lg font-medium line-clamp-1">
                  {title || 'Titre de la page'}
                </div>
                <div className="text-green-700 text-sm">
                  exemple.com/page-url
                </div>
                <div className="text-gray-600 text-sm line-clamp-2">
                  {metaDescription || 'Description meta de la page...'}
                </div>
              </div>
            </div>

            {/* Contenu de la page */}
            <div className="border rounded-lg">
              <div className="p-3 bg-muted/30 border-b text-sm font-medium text-muted-foreground">
                Contenu de la page
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StaticPagePreview;

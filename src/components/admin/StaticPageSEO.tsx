
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, Globe, Tag } from 'lucide-react';

interface StaticPageSEOProps {
  formData: {
    slug: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
  };
  onFormChange: (field: string, value: string) => void;
}

const StaticPageSEO: React.FC<StaticPageSEOProps> = ({
  formData,
  onFormChange
}) => {
  const titleLength = formData.meta_title?.length || 0;
  const descriptionLength = formData.meta_description?.length || 0;

  const getTitleColor = () => {
    if (titleLength === 0) return 'text-gray-400';
    if (titleLength <= 60) return 'text-green-600';
    return 'text-red-600';
  };

  const getDescriptionColor = () => {
    if (descriptionLength === 0) return 'text-gray-400';
    if (descriptionLength <= 160) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            URL et référencement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug de l'URL *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => onFormChange('slug', e.target.value)}
              placeholder="conditions-generales-utilisation"
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              URL finale : <span className="font-mono">votresite.com/{formData.slug}</span>
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="meta_title">Titre SEO *</Label>
              <Badge variant="outline" className={getTitleColor()}>
                {titleLength}/60
              </Badge>
            </div>
            <Input
              id="meta_title"
              value={formData.meta_title}
              onChange={(e) => onFormChange('meta_title', e.target.value)}
              placeholder="Titre optimisé pour les moteurs de recherche"
              maxLength={80}
            />
            {titleLength > 60 && (
              <p className="text-sm text-red-600">
                Le titre est trop long pour un affichage optimal dans Google
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="meta_description">Description SEO *</Label>
              <Badge variant="outline" className={getDescriptionColor()}>
                {descriptionLength}/160
              </Badge>
            </div>
            <Textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) => onFormChange('meta_description', e.target.value)}
              placeholder="Description qui apparaîtra dans les résultats de recherche"
              rows={3}
              maxLength={200}
            />
            {descriptionLength > 160 && (
              <p className="text-sm text-red-600">
                La description est trop longue pour un affichage optimal dans Google
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_keywords">Mots-clés SEO</Label>
            <Input
              id="meta_keywords"
              value={formData.meta_keywords}
              onChange={(e) => onFormChange('meta_keywords', e.target.value)}
              placeholder="réparation, smartphone, téléphone (séparés par des virgules)"
            />
            <p className="text-sm text-muted-foreground">
              Mots-clés principaux pour le référencement (optionnel)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Conseils SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p>Utilisez des mots-clés naturels dans le titre et la description</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p>Le slug doit être court, descriptif et sans caractères spéciaux</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p>La description doit inciter au clic tout en étant informative</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p>Structurez le contenu avec des titres H1, H2, H3</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaticPageSEO;

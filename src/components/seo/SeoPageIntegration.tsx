import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, ExternalLink, Zap } from 'lucide-react';
import { LocalSeoPage } from '@/services/localSeoService';

interface SeoPageIntegrationProps {
  city: string;
  serviceType: string;
  onViewSeoPage?: (slug: string) => void;
}

const SeoPageIntegration: React.FC<SeoPageIntegrationProps> = ({
  city,
  serviceType,
  onViewSeoPage
}) => {
  const seoSlug = `reparateur-${serviceType}-${city.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Page SEO locale disponible
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Optimisé SEO
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Une page spécialement optimisée pour le référencement local est disponible pour cette recherche.
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {city}
          </span>
          <span className="capitalize">{serviceType}</span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => window.open(`/${seoSlug}`, '_blank')}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Voir la page SEO
          </Button>
          {onViewSeoPage && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewSeoPage(seoSlug)}
            >
              Intégrer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SeoPageIntegration;
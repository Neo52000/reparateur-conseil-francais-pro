import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Star, 
  Clock, 
  Shield, 
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react';
import { generateStructuredData, generateMetaTags } from '@/utils/seoUtils';
import NotFound from './NotFound';

export default function LocalSeoPage() {
  const { serviceType, city } = useParams<{ serviceType: string; city: string }>();
  
  // Generate the slug from URL parameters
  const slug = `reparateur-${serviceType}-${city}`;

  const { data: seoPage, isLoading, error } = useQuery({
    queryKey: ['local-seo-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('local_seo_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('Error fetching SEO page:', error);
        return null;
      }

      return data;
    },
    enabled: !!slug
  });

  const { data: repairers } = useQuery({
    queryKey: ['repairers', city, serviceType],
    queryFn: async () => {
      if (!city) return [];
      
      const { data, error } = await supabase
        .from('repairers')
        .select('*')
        .ilike('city', `%${city}%`)
        .eq('is_verified', true)
        .order('rating', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching repairers:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!city
  });

  // Track page view
  React.useEffect(() => {
    if (seoPage?.id) {
      const trackView = async () => {
        try {
          // Update page views directly
          await supabase
            .from('local_seo_pages')
            .update({ page_views: (seoPage.page_views || 0) + 1 })
            .eq('id', seoPage.id);
        } catch (error) {
          console.error('Error tracking page view:', error);
        }
      };
      trackView();
    }
  }, [seoPage?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!seoPage) {
    return <NotFound />;
  }

  const currentUrl = `https://topreparateurs.fr/reparateur-${serviceType}-${city}`;
  const structuredData = generateStructuredData({ page: seoPage, url: currentUrl });
  const metaTags = generateMetaTags(seoPage, currentUrl);

  return (
    <>
      <Helmet>
        <title>{metaTags.title}</title>
        <meta name="description" content={metaTags.description} />
        <meta name="keywords" content={metaTags.keywords} />
        <link rel="canonical" href={currentUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={metaTags.title} />
        <meta property="og:description" content={metaTags.description} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTags.title} />
        <meta name="twitter:description" content={metaTags.description} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex justify-center items-center gap-4 mb-6">
                <MapPin className="h-8 w-8 text-primary" />
                <Badge variant="secondary" className="px-4 py-2">
                  {seoPage.city}
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                {seoPage.h1_title || seoPage.title}
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                {seoPage.meta_description}
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Badge variant="secondary" className="px-4 py-2">
                  <Star className="h-4 w-4 mr-2" />
                  {seoPage.repairer_count} réparateurs disponibles
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Note moyenne: {seoPage.average_rating}/5
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Shield className="h-4 w-4 mr-2" />
                  Réparateurs certifiés
                </Badge>
              </div>
              
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                {seoPage.cta_text || "Trouver un réparateur"}
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              
              {/* Content */}
              <div className="lg:col-span-2 space-y-8">
                {seoPage.content_paragraph_1 && (
                  <Card className="p-8">
                    <div className="prose max-w-none">
                      <p className="text-lg leading-relaxed">
                        {seoPage.content_paragraph_1}
                      </p>
                    </div>
                  </Card>
                )}

                {seoPage.content_paragraph_2 && (
                  <Card className="p-8">
                    <div className="prose max-w-none">
                      <p className="text-lg leading-relaxed">
                        {seoPage.content_paragraph_2}
                      </p>
                    </div>
                  </Card>
                )}

                {/* Benefits */}
                <Card className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Pourquoi choisir un réparateur à {seoPage.city} ?</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Proximité</h3>
                        <p className="text-sm text-muted-foreground">Intervention rapide à {seoPage.city}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Certification</h3>
                        <p className="text-sm text-muted-foreground">Réparateurs qualifiés et certifiés</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Garantie</h3>
                        <p className="text-sm text-muted-foreground">Toutes réparations garanties</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Devis gratuit</h3>
                        <p className="text-sm text-muted-foreground">Diagnostic et devis sans engagement</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact rapide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" size="lg">
                      Obtenir un devis gratuit
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      Réponse en moins de 2h
                    </p>
                  </CardContent>
                </Card>

                {/* Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques {seoPage.city}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Réparateurs actifs</span>
                      <Badge variant="secondary">{seoPage.repairer_count}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Note moyenne</span>
                      <Badge variant="secondary">{seoPage.average_rating}/5</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Délai moyen</span>
                      <Badge variant="secondary">24h</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Featured Repairers */}
                {repairers && repairers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Réparateurs recommandés</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {repairers.slice(0, 3).map((repairer) => (
                        <div key={repairer.id} className="border rounded-lg p-3">
                          <h4 className="font-semibold text-sm">{repairer.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs">{repairer.rating || 4.8}/5</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{repairer.address}</p>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" size="sm">
                        Voir tous les réparateurs
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Besoin d'une réparation à {seoPage.city} ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Trouvez le réparateur idéal près de chez vous en quelques clics
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90"
            >
              {seoPage.cta_text || "Rechercher un réparateur"}
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
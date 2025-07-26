import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Star, 
  Phone, 
  Clock, 
  CheckCircle, 
  Users,
  Award,
  ArrowRight,
  Zap
} from 'lucide-react';
import { localSeoService, LocalSeoPage as LocalSeoPageType } from '@/services/localSeoService';
import { generateStructuredData, generateMetaTags } from '@/utils/seoUtils';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const LocalSeoPage = () => {
  const { service, city, slug: routeSlug } = useParams<{ service: string, city: string, slug: string }>();
  const slug = routeSlug || (service && city ? `reparateur-${service}-${city}` : '');
  const [page, setPage] = useState<LocalSeoPageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPage(slug);
    } else {
      setNotFound(true);
      setLoading(false);
    }
  }, [slug]);

  const loadPage = async (pageSlug: string) => {
    try {
      console.log('🔍 Recherche page SEO avec slug:', pageSlug);
      
      // Essayer d'abord avec le slug exact
      let pageData = await localSeoService.getPageBySlug(pageSlug);
      
      // Si pas trouvé, essayer avec les variations d'accents
      if (!pageData) {
        // Normaliser le slug pour gérer les accents
        const normalizedSlug = pageSlug
          .replace(/é/g, 'e')
          .replace(/è/g, 'e')
          .replace(/à/g, 'a')
          .replace(/ç/g, 'c');
          
        console.log('🔍 Tentative avec slug normalisé:', normalizedSlug);
        pageData = await localSeoService.getPageBySlug(normalizedSlug);
      }
      
      // Si toujours pas trouvé, essayer l'inverse (sans accents vers avec accents)
      if (!pageData && !pageSlug.includes('é')) {
        const accentedSlug = pageSlug.replace(/reparateur/g, 'réparateur');
        console.log('🔍 Tentative avec accents:', accentedSlug);
        pageData = await localSeoService.getPageBySlug(accentedSlug);
      }
      
      if (pageData) {
        console.log('✅ Page SEO trouvée:', pageData.slug);
        setPage(pageData);
        // Enregistrer la vue
        await localSeoService.trackPageView(pageData.id);
      } else {
        console.log('❌ Aucune page SEO trouvée pour:', pageSlug);
        setNotFound(true);
      }
    } catch (error) {
      console.error('Erreur chargement page SEO:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (notFound || !page) {
    return <Navigate to="/404" replace />;
  }

  const serviceTypeLabels = {
    smartphone: 'Smartphone',
    tablette: 'Tablette',
    ordinateur: 'Ordinateur'
  };

  const getMapEmbedUrl = (city: string) => {
    const query = encodeURIComponent(`réparateur ${serviceTypeLabels[page.service_type as keyof typeof serviceTypeLabels]} ${city}`);
    return `https://www.google.com/maps/embed/v1/search?key=YOUR_API_KEY&q=${query}&zoom=12`;
  };

  const currentUrl = `${window.location.origin}/${page.slug}`;
  const structuredData = generateStructuredData({ page, url: currentUrl });
  const metaTags = generateMetaTags(page, currentUrl);

  return (
    <>
      <Helmet>
        <title>{metaTags.title}</title>
        <meta name="description" content={metaTags.description} />
        <meta name="keywords" content={metaTags.keywords} />
        <meta name="author" content={metaTags.author} />
        <meta name="robots" content={metaTags.robots} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={metaTags.canonical} />
        
        {/* Open Graph */}
        <meta property="og:type" content={metaTags.og.type} />
        <meta property="og:title" content={metaTags.og.title} />
        <meta property="og:description" content={metaTags.og.description} />
        <meta property="og:url" content={metaTags.og.url} />
        <meta property="og:site_name" content={metaTags.og.siteName} />
        <meta property="og:locale" content={metaTags.og.locale} />
        <meta property="og:image" content={metaTags.og.image} />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content={metaTags.twitter.card} />
        <meta name="twitter:title" content={metaTags.twitter.title} />
        <meta name="twitter:description" content={metaTags.twitter.description} />
        <meta name="twitter:image" content={metaTags.twitter.image} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-20">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">
                  {page.h1_title}
                </h1>
                
                <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
                  <Badge variant="secondary" className="text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {page.city}
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    <Users className="w-4 h-4 mr-1" />
                    {page.repairer_count} réparateurs
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    <Star className="w-4 h-4 mr-1" />
                    {page.average_rating}/5
                  </Badge>
                </div>

                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  {page.meta_description.replace(/[⚡✓]/g, '').trim()}
                </p>

                <Button size="lg" className="text-lg px-8 py-3">
                  <Zap className="w-5 h-5 mr-2" />
                  {page.cta_text}
                </Button>
              </div>
            </div>
          </section>

          <div className="container mx-auto px-4 py-16">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Contenu principal */}
              <div className="lg:col-span-2 space-y-8">
                {/* Contenu généré */}
                <div className="prose prose-lg max-w-none">
                  <div className="space-y-6">
                    <div className="text-base leading-relaxed text-foreground">
                      {page.content_paragraph_1}
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="text-base leading-relaxed text-foreground">
                      {page.content_paragraph_2}
                    </div>
                  </div>
                </div>

                {/* Avantages */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Pourquoi choisir nos réparateurs ?</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Intervention rapide</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Pièces de qualité</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Garantie incluse</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Tarifs transparents</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Témoignages */}
                {page.sample_testimonials?.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">Ce que disent nos clients</h3>
                      <div className="space-y-4">
                        {page.sample_testimonials.slice(0, 3).map((testimonial: any, index: number) => (
                          <div key={index} className="border-l-4 border-primary pl-4">
                            <p className="text-muted-foreground italic">"{testimonial.comment}"</p>
                            <p className="text-sm font-medium mt-2">- {testimonial.author}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* CTA Card */}
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-semibold mb-4">Besoin d'une réparation ?</h3>
                    <p className="text-muted-foreground mb-4">
                      Obtenez rapidement un devis gratuit de nos experts certifiés.
                    </p>
                    <Button className="w-full text-lg py-3">
                      <Phone className="w-5 h-5 mr-2" />
                      {page.cta_text}
                    </Button>
                  </CardContent>
                </Card>

                {/* Informations locales */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Informations pratiques</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Zone d'intervention</p>
                          <p className="text-sm text-muted-foreground">{page.city} et environs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Horaires</p>
                          <p className="text-sm text-muted-foreground">Lun-Sam: 9h-19h</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Qualité certifiée</p>
                          <p className="text-sm text-muted-foreground">Note {page.average_rating}/5</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Carte Google Maps */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Réparateurs à {page.city}</h3>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Carte interactive disponible</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Voir la carte
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default LocalSeoPage;
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Phone, Mail, Globe, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DOMPurify from 'dompurify';
import NotFound from './NotFound';

interface RepairerSeoPageData {
  id: string;
  repairer_id: string;
  title: string;
  meta_description: string;
  h1_title: string;
  intro_paragraph: string;
  services_description: string;
  why_choose_us: string;
  structured_data: any;
  is_published: boolean;
  repairer: {
    id: string;
    name: string;
    business_name?: string;
    address: string;
    city: string;
    postal_code: string;
    phone?: string;
    email?: string;
    website?: string;
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
    rating?: number;
    review_count?: number;
    is_verified: boolean;
    opening_hours?: any;
  };
}

const RepairerSeoPage = () => {
  const { city, repairerName } = useParams<{ city: string; repairerName: string }>();
  const [pageData, setPageData] = useState<RepairerSeoPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadPageData();
  }, [city, repairerName]);

  const loadPageData = async () => {
    if (!city || !repairerName) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      // Construire le slug à partir de l'URL
      const slug = `${city}-${repairerName}`;

      // Récupérer la page avec les données du réparateur
      const { data, error } = await supabase
        .from('repairer_seo_pages')
        .select(`
          *,
          repairer:repairers(*)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error || !data) {
        console.error('Page SEO non trouvée:', error);
        setNotFound(true);
      } else {
        setPageData(data as any);
        
        // Incrémenter le compteur de vues en arrière-plan
        supabase
          .from('repairer_seo_pages')
          .update({ page_views: (data.page_views || 0) + 1 })
          .eq('id', data.id)
          .then(({ error }) => {
            if (error) console.error('❌ Failed to track page view:', error);
            else console.log('✅ Page view tracked');
          });
      }
    } catch (err) {
      console.error('Erreur chargement page:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (notFound || !pageData) {
    return <NotFound />;
  }

  const { repairer } = pageData;
  const businessName = repairer.business_name || repairer.name;
  const lat = repairer.lat || repairer.latitude;
  const lng = repairer.lng || repairer.longitude;
  const googleMapsUrl = lat && lng 
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(repairer.address + ', ' + repairer.city)}`;

  return (
    <>
      <Helmet>
        <title>{pageData.title}</title>
        <meta name="description" content={pageData.meta_description} />
        <meta property="og:title" content={pageData.title} />
        <meta property="og:description" content={pageData.meta_description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageData.title} />
        <meta name="twitter:description" content={pageData.meta_description} />
        <script type="application/ld+json">
          {JSON.stringify(pageData.structured_data)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{pageData.h1_title}</h1>
            <p className="text-xl md:text-2xl mb-2">{businessName} – Spécialiste à {repairer.city}</p>
            {repairer.is_verified && (
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mt-2">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-medium">Professionnel vérifié TopRéparateurs.fr</span>
              </div>
            )}
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="md:col-span-2 space-y-8">
              {/* Introduction */}
              <Card className="p-6">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pageData.intro_paragraph) }}
                />
              </Card>

              {/* Services */}
              <Card className="p-6">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pageData.services_description) }}
                />
              </Card>

              {/* Pourquoi nous choisir */}
              <Card className="p-6">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pageData.why_choose_us) }}
                />
              </Card>
            </div>

            {/* Sidebar - Coordonnées */}
            <div className="space-y-6">
              <Card className="p-6 sticky top-4">
                <h3 className="text-2xl font-bold mb-4">Coordonnées</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{repairer.address}</p>
                      <p className="text-muted-foreground">{repairer.postal_code} {repairer.city}</p>
                    </div>
                  </div>

                  {repairer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                      <a href={`tel:${repairer.phone}`} className="hover:text-primary transition-colors">
                        {repairer.phone}
                      </a>
                    </div>
                  )}

                  {repairer.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                      <a href={`mailto:${repairer.email}`} className="hover:text-primary transition-colors break-all">
                        {repairer.email}
                      </a>
                    </div>
                  )}

                  {repairer.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                      <a 
                        href={repairer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors break-all"
                      >
                        Site web
                      </a>
                    </div>
                  )}

                  {repairer.opening_hours && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium mb-1">Horaires d'ouverture</p>
                        <p className="text-muted-foreground">
                          {typeof repairer.opening_hours === 'string' 
                            ? repairer.opening_hours 
                            : 'Lun-Ven 09:00-18:00'}
                        </p>
                      </div>
                    </div>
                  )}

                  {repairer.rating && (
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Star className="w-5 h-5 text-yellow-500 fill-current flex-shrink-0" />
                      <div>
                        <p className="font-bold text-lg">{repairer.rating}/5</p>
                        {repairer.review_count && (
                          <p className="text-sm text-muted-foreground">
                            {repairer.review_count} avis
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => window.location.href = `tel:${repairer.phone}`}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Appeler maintenant
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(googleMapsUrl, '_blank')}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Voir sur Google Maps
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RepairerSeoPage;

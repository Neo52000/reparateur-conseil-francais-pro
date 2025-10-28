import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateStructuredData, generateMetaTags } from '@/utils/seoUtils';
import NotFound from './NotFound';
import HeroSectionLocal from '@/components/seo/HeroSectionLocal';
import ServicesGridLocal from '@/components/seo/ServicesGridLocal';
import BenefitsSection from '@/components/seo/BenefitsSection';
import TestimonialsSection from '@/components/seo/TestimonialsSection';
import LocalRepairerMap from '@/components/seo/LocalRepairerMap';
import FaqAccordion from '@/components/seo/FaqAccordion';
import { Button } from '@/components/ui/button';

export default function ModernLocalSeoPage() {
  const { serviceType, city } = useParams<{ serviceType: string; city: string }>();
  
  const slug = `reparateur-${serviceType}-${city}`;

  const { data: seoPage, isLoading } = useQuery({
    queryKey: ['modern-local-seo-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('local_seo_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  const { data: repairers } = useQuery({
    queryKey: ['repairers-with-location', city],
    queryFn: async () => {
      if (!city) return [];
      
      const { data, error } = await supabase
        .from('repairers')
        .select('*')
        .ilike('city', `%${city}%`)
        .eq('is_verified', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('rating', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!city
  });

  // Track page view
  React.useEffect(() => {
    if (seoPage?.id) {
      supabase
        .from('local_seo_pages')
        .update({ page_views: (seoPage.page_views || 0) + 1 })
        .eq('id', seoPage.id)
        .then(() => console.log('Page view tracked'));
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
        
        <meta property="og:title" content={metaTags.title} />
        <meta property="og:description" content={metaTags.description} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="website" />
        {seoPage.og_image_url && <meta property="og:image" content={seoPage.og_image_url} />}
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTags.title} />
        <meta name="twitter:description" content={metaTags.description} />
        {seoPage.og_image_url && <meta name="twitter:image" content={seoPage.og_image_url} />}
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <HeroSectionLocal 
          seoPage={seoPage}
          serviceType={serviceType!}
          city={city!}
        />

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          
          {/* Services Grid */}
          {seoPage.services && Array.isArray(seoPage.services) && seoPage.services.length > 0 && (
            <ServicesGridLocal services={seoPage.services as any[]} />
          )}

          {/* Benefits Section */}
          <BenefitsSection city={seoPage.city} />

          {/* Content Paragraphs */}
          {(seoPage.content_paragraph_1 || seoPage.content_paragraph_2) && (
            <div className="prose max-w-none bg-white rounded-lg p-8 shadow-sm border border-gray-100">
              {seoPage.content_paragraph_1 && (
                <p className="text-lg leading-relaxed text-foreground mb-6">
                  {seoPage.content_paragraph_1}
                </p>
              )}
              {seoPage.content_paragraph_2 && (
                <p className="text-lg leading-relaxed text-foreground">
                  {seoPage.content_paragraph_2}
                </p>
              )}
            </div>
          )}

          {/* Testimonials */}
          {seoPage.sample_testimonials && Array.isArray(seoPage.sample_testimonials) && seoPage.sample_testimonials.length > 0 && (
            <TestimonialsSection testimonials={seoPage.sample_testimonials as any[]} city={seoPage.city} />
          )}

          {/* Map Section */}
          {repairers && repairers.length > 0 && (
            <LocalRepairerMap 
              city={seoPage.city}
              repairers={repairers}
            />
          )}

          {/* FAQ Section */}
          {seoPage.faq && Array.isArray(seoPage.faq) && seoPage.faq.length > 0 && (
            <FaqAccordion faq={seoPage.faq as any} city={seoPage.city} />
          )}
        </div>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-900 to-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Réservez votre réparation à {seoPage.city} dès aujourd'hui
            </h2>
            <p className="text-xl text-white/90">
              Devis gratuit en moins de 2h • Sans engagement • Intervention rapide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg"
              >
                Obtenir mon devis gratuit
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-6 text-lg"
              >
                Appeler un réparateur
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 pt-6">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Garantie 6 mois</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Intervention rapide</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm">Prix transparents</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

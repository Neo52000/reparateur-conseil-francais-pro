import { useState, useEffect } from 'react';
import { localSeoService, LocalSeoPage } from '@/services/localSeoService';

interface UseSeoIntegrationProps {
  city?: string;
  serviceType?: string;
}

export const useSeoIntegration = ({ city, serviceType }: UseSeoIntegrationProps = {}) => {
  const [seoPage, setSeoPage] = useState<LocalSeoPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (city && serviceType) {
      checkSeoPage();
    }
  }, [city, serviceType]);

  const checkSeoPage = async () => {
    if (!city || !serviceType) return;
    
    setLoading(true);
    try {
      // Vérifier l'accès
      const access = await localSeoService.hasAccess();
      setHasAccess(access);
      
      if (access) {
        const slug = `reparateur-${serviceType}-${city.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const page = await localSeoService.getPageBySlug(slug);
        setSeoPage(page);
      }
    } catch (error) {
      console.error('Erreur vérification page SEO:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSeoPage = async () => {
    if (!city || !serviceType) return false;
    
    try {
      const response = await localSeoService.generateContent({
        city,
        serviceType,
        repairerCount: 1, // Valeur par défaut
        averageRating: 4.8
      });

      if (response.success) {
        const newPage = {
          slug: `reparateur-${serviceType}-${city.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          city,
          city_slug: city.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          service_type: serviceType,
          title: response.content.title,
          meta_description: response.content.metaDescription,
          h1_title: response.content.h1,
          content_paragraph_1: response.content.paragraph1,
          content_paragraph_2: response.content.paragraph2,
          cta_text: 'Obtenez un devis gratuitement',
          repairer_count: 1,
          average_rating: 4.8,
          is_published: true,
          generated_by_ai: true,
          ai_model: response.model
        };

        const createdPage = await localSeoService.createPage(newPage);
        if (createdPage) {
          setSeoPage(createdPage);
          return true;
        }
      }
    } catch (error) {
      console.error('Erreur génération page SEO:', error);
    }
    
    return false;
  };

  return {
    seoPage,
    loading,
    hasAccess,
    hasSeoPage: !!seoPage,
    generateSeoPage,
    refreshSeoPage: checkSeoPage
  };
};
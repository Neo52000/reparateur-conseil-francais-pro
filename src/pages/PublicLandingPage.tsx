import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Clock, Star } from 'lucide-react';

interface LandingPageData {
  id: string;
  name: string;
  config: any;
  repairer_data?: any;
}

const PublicLandingPage: React.FC = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const [pageData, setPageData] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subdomain) {
      fetchLandingPageData();
    }
  }, [subdomain]);

  const fetchLandingPageData = async () => {
    try {
      // Récupérer les données du sous-domaine
      const { data: subdomainData, error: subdomainError } = await supabase
        .from('subdomains')
        .select('*')
        .eq('subdomain', subdomain)
        .eq('is_active', true)
        .single();

      if (subdomainError) throw subdomainError;

      // Récupérer la landing page associée
      let landingPageData = null;
      if (subdomainData.landing_page_id) {
        const { data } = await supabase
          .from('landing_pages')
          .select('*')
          .eq('id', subdomainData.landing_page_id)
          .single();
        landingPageData = data;
      }

      // Récupérer les données du réparateur
      const { data: repairerData } = await supabase
        .from('repairer_profiles')
        .select('*')
        .eq('user_id', subdomainData.repairer_id)
        .single();

      setPageData({
        id: landingPageData?.id || 'default',
        name: landingPageData?.name || 'Page par défaut',
        config: landingPageData?.config || {},
        repairer_data: repairerData
      });
    } catch (error) {
      console.error('Error fetching landing page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Page non trouvée</h1>
          <p className="text-muted-foreground">Ce sous-domaine n'existe pas ou n'est pas actif.</p>
        </div>
      </div>
    );
  }

  const config = pageData.config;
  const hero = config.hero || {};
  const about = config.about || {};
  const services = config.services || {};
  const contact = config.contact || {};
  const style = config.style || {};

  const pageStyles = {
    '--primary-color': style.primary_color || '#2563eb',
    '--secondary-color': style.secondary_color || '#64748b',
    fontFamily: style.font_family || 'Inter, sans-serif'
  } as React.CSSProperties;

  return (
    <div className="min-h-screen" style={pageStyles}>
      {/* Hero Section */}
      <section 
        className="relative py-20 px-6 text-white text-center"
        style={{
          background: hero.background_image 
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${hero.background_image})`
            : `linear-gradient(135deg, var(--primary-color), var(--secondary-color))`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {hero.title || pageData.repairer_data?.name || "Service de Réparation"}
          </h1>
          <p className="text-xl mb-8 opacity-90">
            {hero.subtitle || "Service professionnel de réparation"}
          </p>
          <Button
            size="lg"
            className="bg-white text-black hover:bg-gray-100"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {hero.cta_text || "Contactez-nous"}
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--primary-color)' }}>
            {services.title || "Nos Services"}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {(services.items || []).map((service: any, index: number) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="text-lg font-bold" style={{ color: 'var(--primary-color)' }}>
                  {service.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--primary-color)' }}>
            {contact.title || "Nous Contacter"}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {(contact.phone || pageData.repairer_data?.phone) && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
                  <span>{contact.phone || pageData.repairer_data?.phone}</span>
                </div>
              )}
              {(contact.email || pageData.repairer_data?.email) && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
                  <span>{contact.email || pageData.repairer_data?.email}</span>
                </div>
              )}
              {(contact.address || pageData.repairer_data?.address) && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
                  <span>{contact.address || pageData.repairer_data?.address}</span>
                </div>
              )}
              {contact.hours && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
                  <span>{contact.hours}</span>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Demander un devis</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Votre nom"
                  className="w-full p-3 border rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Votre email"
                  className="w-full p-3 border rounded-lg"
                />
                <textarea
                  placeholder="Décrivez votre problème"
                  rows={4}
                  className="w-full p-3 border rounded-lg"
                />
                <Button 
                  className="w-full"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  Envoyer la demande
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ backgroundColor: 'var(--secondary-color)', color: 'white' }}>
        <p>&copy; 2024 {pageData.repairer_data?.name || pageData.name}. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default PublicLandingPage;
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Smartphone, Monitor, Tablet } from 'lucide-react';

interface LandingPage {
  id: string;
  name: string;
  template_type: string;
  config: any;
  is_active: boolean;
  created_at: string;
}

interface LandingPagePreviewProps {
  page: LandingPage;
  isOpen: boolean;
  onClose: () => void;
}

const LandingPagePreview: React.FC<LandingPagePreviewProps> = ({ page, isOpen, onClose }) => {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const config = page.config || {};
  const hero = config.hero || {};
  const about = config.about || {};
  const services = config.services || {};
  const contact = config.contact || {};
  const style = config.style || {};

  const getContainerClass = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'w-full';
    }
  };

  const previewStyles = {
    '--primary-color': style.primary_color || '#2563eb',
    '--secondary-color': style.secondary_color || '#64748b',
    fontFamily: style.font_family || 'Inter, sans-serif'
  } as React.CSSProperties;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle>Aperçu: {page.name}</DialogTitle>
              <Badge variant={page.is_active ? "default" : "secondary"}>
                {page.is_active ? "Publié" : "Brouillon"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Device Preview Buttons */}
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('tablet')}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>
              
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ouvrir
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 rounded-lg">
          <div className={getContainerClass()}>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={previewStyles}>
              
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
                    {hero.title || "Votre titre principal"}
                  </h1>
                  <p className="text-xl mb-8 opacity-90">
                    {hero.subtitle || "Votre sous-titre accrocheur"}
                  </p>
                  <button
                    className="inline-flex items-center px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                    style={{
                      borderRadius: style.button_style === 'pill' ? '25px' : style.button_style === 'square' ? '4px' : '8px'
                    }}
                  >
                    {hero.cta_text || "Contactez-nous"}
                  </button>
                </div>
              </section>

              {/* About Section */}
              {about.title && (
                <section className="py-16 px-6">
                  <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                      <div>
                        <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--primary-color)' }}>
                          {about.title}
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                          {about.description || "Description de votre service"}
                        </p>
                      </div>
                      {about.image && (
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                          <img 
                            src={about.image} 
                            alt="À propos" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Services Section */}
              {services.title && (
                <section className="py-16 px-6 bg-gray-50">
                  <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--primary-color)' }}>
                      {services.title}
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
              )}

              {/* Contact Section */}
              {contact.title && (
                <section className="py-16 px-6">
                  <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--primary-color)' }}>
                      {contact.title}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        {contact.phone && (
                          <div>
                            <h4 className="font-semibold mb-2">Téléphone</h4>
                            <p className="text-gray-600">{contact.phone}</p>
                          </div>
                        )}
                        {contact.email && (
                          <div>
                            <h4 className="font-semibold mb-2">Email</h4>
                            <p className="text-gray-600">{contact.email}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {contact.address && (
                          <div>
                            <h4 className="font-semibold mb-2">Adresse</h4>
                            <p className="text-gray-600">{contact.address}</p>
                          </div>
                        )}
                        {contact.hours && (
                          <div>
                            <h4 className="font-semibold mb-2">Horaires</h4>
                            <p className="text-gray-600">{contact.hours}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Footer */}
              <footer className="py-8 px-6 text-center" style={{ backgroundColor: 'var(--secondary-color)', color: 'white' }}>
                <p>&copy; 2024 {page.name}. Tous droits réservés.</p>
              </footer>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LandingPagePreview;
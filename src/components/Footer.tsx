import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Linkedin, Twitter, MessageCircle, UserPlus, Clock, Shield, Star, Users, Smartphone, Laptop, Tablet, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFooterConfig } from '@/hooks/useFooterConfig';
import { supabase } from '@/integrations/supabase/client';

const Footer = () => {
  const {
    sections,
    loading
  } = useFooterConfig();
  
  const [availableCities, setAvailableCities] = useState<Array<{ city: string; slug: string }>>([]);

  useEffect(() => {
    const loadCities = async () => {
      const { data, error } = await supabase
        .from('local_seo_pages')
        .select('city, slug')
        .eq('is_published', true)
        .order('city');
      
      if (!error && data) {
        setAvailableCities(data);
      }
    };
    loadCities();
  }, []);
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Bonjour, je souhaite des informations sur vos services de réparation.');
    window.open(`https://wa.me/33745062162?text=${message}`, '_blank');
  };
  const handleEmailClick = () => {
    window.location.href = 'mailto:contact@topreparateurs.fr?subject=Demande d\'information - Réparation';
  };

  // Données structurées JSON-LD pour le SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TopRéparateurs.fr",
    "description": "Plateforme de mise en relation entre particuliers et réparateurs professionnels en France",
    "url": "https://topreparateurs.fr",
    "logo": "https://topreparateurs.fr/lovable-uploads/cb472069-06d7-49a5-bfb1-eb7674f92f49.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+33745062162",
      "contactType": "customer service",
      "email": "contact@topreparateurs.fr",
      "availableLanguage": "French"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "FR"
    },
    "sameAs": ["https://facebook.com/topreparateurs.fr"],
    "serviceType": ["Réparation smartphone", "Réparation tablette", "Réparation ordinateur", "Réparation console de jeux"]
  };
  return <>
      {/* Données structurées pour le SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
      __html: JSON.stringify(structuredData)
    }} />
      
      <footer className="bg-gray-900 text-white" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Section principale du footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            
            {loading ?
          // Loading state
          <div className="lg:col-span-4 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[1, 2, 3, 4].map(i => <div key={i} className="space-y-4">
                      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </div>)}
                </div>
              </div> :
          // Configuration dynamique avec support des sous-sections
          sections.filter(s => !s.parent_id && s.is_active).sort((a, b) => a.display_order - b.display_order).map(section => {
            const childSections = sections.filter(s => s.parent_id === section.id && s.is_active).sort((a, b) => a.display_order - b.display_order);
            return <div key={section.id}>
                      <h3 className="text-lg font-semibold mb-4 text-white">{section.title}</h3>
                      
                      {section.section_key === 'company_info' ? <div className="lg:col-span-1">
                          <div className="mb-6">
                            <img src="/lovable-uploads/cb472069-06d7-49a5-bfb1-eb7674f92f49.png" alt="TopRéparateurs.fr - Logo" className="h-16 object-contain brightness-0 invert" width="200" height="64" />
                          </div>
                          <p className="text-gray-300 mb-6 leading-relaxed">
                            {section.content}
                          </p>
                          
                          {/* Avantages clés */}
                          <div className="space-y-2 text-sm">
                            
                            
                            
                          </div>
                        </div> : section.section_key === 'services' ? <nav aria-label="Services de réparation">
                          <ul className="space-y-3">
                            {section.links.map((link, index) => {
                    const getServiceIcon = (title: string) => {
                      if (title.includes('Smartphone')) return Smartphone;
                      if (title.includes('Tablette')) return Tablet;
                      if (title.includes('Ordinateur')) return Laptop;
                      if (title.includes('Console')) return Gamepad2;
                      return Smartphone;
                    };
                    const IconComponent = getServiceIcon(link.title);
                    return <li key={index}>
                                  <Link to={link.url} className="flex items-center text-gray-300 hover:text-white transition-colors group">
                                    <IconComponent className="h-4 w-4 mr-2 group-hover:text-primary" />
                                    {link.title}
                                  </Link>
                                </li>;
                  })}
                          </ul>
                        </nav> : section.section_key === 'repairer_cta' ? <div className="bg-gradient-to-br from-blue-600 to-orange-600 rounded-lg p-6">
                          <h3 className="font-bold text-white mb-2">{section.title}</h3>
                          <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                            {section.content}
                          </p>
                          {section.links.map((link, index) => <Link key={index} to={link.url}>
                              <Button className={link.className || "bg-white text-blue-600 hover:bg-gray-100 font-semibold w-full"} size="sm">
                                <UserPlus className="h-4 w-4 mr-2" />
                                {link.title}
                              </Button>
                            </Link>)}
                          
                          {/* Stats supprimées - données fictives retirées */}
                        </div> :
              // Sections génériques avec sous-sections
              <div>
                          <p className="text-gray-300 mb-4 text-sm">{section.content}</p>
                          <nav>
                            <ul className="space-y-2">
                              {section.links.map((link, index) => <li key={index}>
                                  <Link to={link.url} className="text-gray-300 hover:text-white transition-colors text-sm">
                                    {link.title}
                                  </Link>
                                </li>)}
                            </ul>
                          </nav>
                          
                          {/* Affichage des sous-sections */}
                          {childSections.length > 0 && <div className="mt-6 space-y-4 border-l-2 border-gray-600 pl-4">
                              {childSections.map(childSection => <div key={childSection.id}>
                                  <h4 className="text-base font-medium text-white mb-2">{childSection.title}</h4>
                                  {childSection.content && <p className="text-gray-400 text-sm mb-2">{childSection.content}</p>}
                                  {childSection.links.length > 0 && <nav>
                                      <ul className="space-y-1">
                                        {childSection.links.map((link, index) => <li key={index}>
                                            <Link to={link.url} className="text-gray-400 hover:text-white transition-colors text-sm">
                                              {link.title}
                                            </Link>
                                          </li>)}
                                      </ul>
                                    </nav>}
                                </div>)}
                            </div>}
                        </div>}
                    </div>;
          })}

            {/* Contact et support - toujours affiché */}
            {!loading && !sections.find(s => s.section_key === 'support') && <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
                <div className="space-y-2">
                  <button onClick={handleEmailClick} className="flex items-center text-gray-300 hover:text-white transition-colors text-sm">
                    <Mail className="h-4 w-4 mr-2 text-primary" />
                    contact@topreparateurs.fr
                  </button>
                  <button onClick={handleWhatsApp} className="flex items-center text-gray-300 hover:text-green-400 transition-colors text-sm">
                    <MessageCircle className="h-4 w-4 mr-2 text-green-400" />
                    07 45 06 21 62 (WhatsApp)
                  </button>
                </div>
              </div>}
          </div>

          {/* Section liens SEO géographiques */}
          <div className="border-t border-gray-700 pt-8 mb-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">
                Réparation smartphone, tablette et ordinateur dans toute la France
              </h2>
              <p className="text-gray-300 mb-6 max-w-3xl mx-auto">
                Trouvez le réparateur le plus proche de chez vous. Intervention rapide, devis gratuit, 
                réparateurs certifiés dans toutes les grandes villes de France.
              </p>
              
              {/* Liens villes principales - optimisés SEO */}
              <nav aria-label="Réparateurs par ville">
                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  {availableCities.length > 0 ? (
                    availableCities.map((location, index, array) => (
                      <div key={location.slug} className="inline-flex items-center">
                        <Link 
                          to={`/${location.slug}`} 
                          className="text-gray-300 hover:text-white transition-colors px-3 py-1 rounded-md hover:bg-gray-800" 
                          aria-label={`Réparateurs smartphone à ${location.city}`}
                        >
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {location.city}
                        </Link>
                        {index < array.length - 1 && <span className="text-gray-500 ml-3">•</span>}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">Chargement des villes...</p>
                  )}
                </div>
              </nav>
              
              <p className="text-gray-400 text-xs mt-4">
                Et dans plus de 200 autres villes en France - Service disponible 7j/7
              </p>
            </div>
          </div>

          {/* Réseaux sociaux et copyright */}
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <span className="text-sm text-gray-300">Suivez-nous :</span>
              <div className="flex space-x-4">
                <a href="https://facebook.com/topreparateurs.fr" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-600 transition-colors" aria-label="Suivre TopRéparateurs sur Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com/company/topreparateurs" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-700 transition-colors" aria-label="Suivre TopRéparateurs sur LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="https://twitter.com/topreparateurs" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition-colors" aria-label="Suivre TopRéparateurs sur Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <button onClick={handleWhatsApp} className="text-gray-300 hover:text-green-500 transition-colors" aria-label="Contacter via WhatsApp">
                  <MessageCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © 2024 <strong>TopRéparateurs.fr</strong> - Tous droits réservés
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Plateforme française de mise en relation - Siret : 12345678901234
              </p>
              <div className="flex gap-3 justify-center md:justify-end mt-2 text-xs">
                <Link to="/legal-notice" className="text-gray-400 hover:text-white transition-colors">
                  Mentions légales
                </Link>
                <span className="text-gray-600">•</span>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  CGU
                </Link>
                <span className="text-gray-600">•</span>
                <Link to="/terms-of-sale" className="text-gray-400 hover:text-white transition-colors">
                  CGV
                </Link>
                <span className="text-gray-600">•</span>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Confidentialité
                </Link>
                <span className="text-gray-600">•</span>
                <Link to="/mes-donnees" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Mes données
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>;
};
export default Footer;
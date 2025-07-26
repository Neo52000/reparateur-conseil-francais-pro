import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Linkedin, Twitter, MessageCircle, UserPlus, Clock, Shield, Star, Users, Smartphone, Laptop, Tablet, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
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
    "sameAs": [
      "https://facebook.com/topreparateurs.fr"
    ],
    "serviceType": [
      "Réparation smartphone",
      "Réparation tablette", 
      "Réparation ordinateur",
      "Réparation console de jeux"
    ]
  };

  return (
    <>
      {/* Données structurées pour le SEO */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <footer className="bg-gray-900 text-white" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Section principale du footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            
            {/* Logo et description d'entreprise */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <img 
                  src="/lovable-uploads/cb472069-06d7-49a5-bfb1-eb7674f92f49.png" 
                  alt="TopRéparateurs.fr - Logo" 
                  className="h-16 object-contain brightness-0 invert"
                  width="200"
                  height="64"
                />
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                <strong>TopRéparateurs.fr</strong> est la plateforme de référence pour trouver un réparateur qualifié près de chez vous. 
                Réparation smartphones, tablettes, ordinateurs et consoles de jeux - Devis gratuit et intervention rapide.
              </p>
              
              {/* Avantages clés */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-400" />
                  <span>Réparateurs certifiés</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-400" />
                  <span>Intervention sous 24h</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-400" />
                  <span>Satisfaction garantie</span>
                </div>
              </div>
            </div>

            {/* Services de réparation */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Nos Services</h3>
              <nav aria-label="Services de réparation">
                <ul className="space-y-3">
                  <li>
                    <Link 
                      to="/reparation-smartphone" 
                      className="flex items-center text-gray-300 hover:text-white transition-colors group"
                    >
                      <Smartphone className="h-4 w-4 mr-2 group-hover:text-primary" />
                      Réparation Smartphone
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/reparation-tablette" 
                      className="flex items-center text-gray-300 hover:text-white transition-colors group"
                    >
                      <Tablet className="h-4 w-4 mr-2 group-hover:text-primary" />
                      Réparation Tablette
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/reparation-ordinateur" 
                      className="flex items-center text-gray-300 hover:text-white transition-colors group"
                    >
                      <Laptop className="h-4 w-4 mr-2 group-hover:text-primary" />
                      Réparation Ordinateur
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/reparation-console" 
                      className="flex items-center text-gray-300 hover:text-white transition-colors group"
                    >
                      <Gamepad2 className="h-4 w-4 mr-2 group-hover:text-primary" />
                      Réparation Console
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Contact et support */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Contact & Support</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Nous contacter</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={handleEmailClick}
                      className="flex items-center text-gray-300 hover:text-white transition-colors"
                      aria-label="Envoyer un email"
                    >
                      <Mail className="h-4 w-4 mr-2 text-primary" />
                      contact@topreparateurs.fr
                    </button>
                    <button 
                      onClick={handleWhatsApp}
                      className="flex items-center text-gray-300 hover:text-green-400 transition-colors"
                      aria-label="Contacter via WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4 mr-2 text-green-400" />
                      07 45 06 21 62 (WhatsApp)
                    </button>
                  </div>
                </div>

                {/* Informations légales */}
                <div>
                  <h4 className="font-medium mb-2">Informations légales</h4>
                  <nav aria-label="Liens légaux">
                    <ul className="space-y-1">
                      <li>
                        <Link 
                          to="/privacy-policy" 
                          className="text-gray-300 hover:text-white transition-colors text-sm"
                        >
                          Politique de confidentialité
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/terms" 
                          className="text-gray-300 hover:text-white transition-colors text-sm"
                        >
                          Conditions générales
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/cookies" 
                          className="text-gray-300 hover:text-white transition-colors text-sm"
                        >
                          Gestion des cookies
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>

            {/* CTA Réparateurs */}
            <div>
              <div className="bg-gradient-to-br from-blue-600 to-orange-600 rounded-lg p-6">
                <h3 className="font-bold text-white mb-2">
                  Vous êtes réparateur ?
                </h3>
                <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                  Rejoignez notre réseau de plus de 5000 réparateurs professionnels et développez votre activité
                </p>
                <Link to="/repairer/plans">
                  <Button 
                    className="bg-white text-blue-600 hover:bg-gray-100 font-semibold w-full"
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Rejoindre le réseau
                  </Button>
                </Link>
                
                {/* Stats rapides */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                  <div className="bg-white/10 rounded p-2">
                    <div className="font-bold text-white">5000+</div>
                    <div className="text-xs text-blue-100">Réparateurs</div>
                  </div>
                  <div className="bg-white/10 rounded p-2">
                    <div className="font-bold text-white">50K+</div>
                    <div className="text-xs text-blue-100">Réparations</div>
                  </div>
                </div>
              </div>
            </div>
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
                  {[
                    { city: 'Paris', slug: 'paris' },
                    { city: 'Lyon', slug: 'lyon' },
                    { city: 'Marseille', slug: 'marseille' },
                    { city: 'Toulouse', slug: 'toulouse' },
                    { city: 'Nice', slug: 'nice' },
                    { city: 'Nantes', slug: 'nantes' },
                    { city: 'Strasbourg', slug: 'strasbourg' },
                    { city: 'Montpellier', slug: 'montpellier' },
                    { city: 'Bordeaux', slug: 'bordeaux' },
                    { city: 'Lille', slug: 'lille' },
                    { city: 'Rennes', slug: 'rennes' },
                    { city: 'Reims', slug: 'reims' }
                  ].map((location, index, array) => (
                    <React.Fragment key={location.slug}>
                      <Link 
                        to={`/reparateur-smartphone-${location.slug}`}
                        className="text-gray-300 hover:text-white transition-colors px-3 py-1 rounded-md hover:bg-gray-800"
                        aria-label={`Réparateurs smartphone à ${location.city}`}
                      >
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {location.city}
                      </Link>
                      {index < array.length - 1 && (
                        <span className="text-gray-500">•</span>
                      )}
                    </React.Fragment>
                  ))}
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
                <a 
                  href="https://facebook.com/topreparateurs.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-blue-600 transition-colors"
                  aria-label="Suivre TopRéparateurs sur Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="https://linkedin.com/company/topreparateurs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-blue-700 transition-colors"
                  aria-label="Suivre TopRéparateurs sur LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href="https://twitter.com/topreparateurs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                  aria-label="Suivre TopRéparateurs sur Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <button
                  onClick={handleWhatsApp}
                  className="text-gray-300 hover:text-green-500 transition-colors"
                  aria-label="Contacter via WhatsApp"
                >
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
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
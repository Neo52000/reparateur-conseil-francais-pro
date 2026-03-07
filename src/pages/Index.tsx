import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import ModernHero from '@/components/modern/ModernHero';
import TrustSignals from '@/components/modern/TrustSignals';
import RepairerResultsGrid from '@/components/modern/RepairerResultsGrid';
import BlogSection from '@/components/modern/BlogSection';
import HomepageFAQSchema from '@/components/seo/HomepageFAQSchema';
import InternalLinksSection from '@/components/seo/InternalLinksSection';
import Footer from '@/components/Footer';
import heroImage from '@/assets/hero-repair-workshop.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        {/* Meta Title < 60 chars, keyword "réparateur" en premier */}
        <title>Réparateur près de chez vous | Comparateur gratuit - TopRéparateurs</title>
        <meta 
          name="description" 
          content="Trouvez un réparateur certifié pour smartphone, tablette ou ordinateur. Comparez les prix, lisez les avis et obtenez un devis gratuit. Plus de 2000 pros en France." 
        />
        <meta name="keywords" content="réparateur smartphone, réparation téléphone, réparateur tablette, réparation ordinateur, réparateur certifié, devis gratuit réparation, réparation express, réparateur près de moi" />
        <link rel="canonical" href="https://topreparateurs.fr/" />
        
        {/* Preload hero image for LCP */}
        <link rel="preload" as="image" href={heroImage} fetchPriority="high" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://topreparateurs.fr/" />
        <meta property="og:title" content="Trouvez le meilleur réparateur près de chez vous" />
        <meta property="og:description" content="Comparateur gratuit de réparateurs certifiés. Smartphone, tablette, ordinateur, console. Devis gratuit et intervention rapide." />
        <meta property="og:image" content="https://topreparateurs.fr/og-image.jpg" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content="TopRéparateurs" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Trouvez le meilleur réparateur près de chez vous" />
        <meta name="twitter:description" content="Comparateur gratuit de réparateurs certifiés en France" />
        <meta name="twitter:image" content="https://topreparateurs.fr/og-image.jpg" />
        
        {/* Technical SEO */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="author" content="TopRéparateurs" />
        <html lang="fr" />
        <meta name="geo.region" content="FR" />
        <meta name="geo.placename" content="France" />
        
        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "TopRéparateurs",
            "url": "https://topreparateurs.fr",
            "logo": "https://topreparateurs.fr/lovable-uploads/cb472069-06d7-49a5-bfb1-eb7674f92f49.png",
            "description": "Plateforme de mise en relation avec des réparateurs professionnels certifiés en France",
            "foundingDate": "2025",
            "founder": {
              "@type": "Person",
              "name": "Elie REINE"
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "10 rue Toupot de Béveaux",
              "addressLocality": "Chaumont",
              "postalCode": "52000",
              "addressCountry": "FR"
            },
            "sameAs": [
              "https://www.facebook.com/topreparateurs",
              "https://www.linkedin.com/company/topreparateurs"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "contact@topreparateurs.fr",
              "telephone": "+33745062162",
              "availableLanguage": ["French"]
            }
          })}
        </script>
        
        {/* Structured Data - WebSite + SearchAction */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "TopRéparateurs",
            "url": "https://topreparateurs.fr",
            "description": "Comparateur gratuit de réparateurs certifiés en France",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://topreparateurs.fr/search?city={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>

        {/* Structured Data - BreadcrumbList */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Accueil",
                "item": "https://topreparateurs.fr/"
              }
            ]
          })}
        </script>
        
        {/* Structured Data - Service */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Comparateur de réparateurs d'appareils électroniques",
            "provider": {
              "@type": "Organization",
              "name": "TopRéparateurs"
            },
            "serviceType": "Mise en relation avec des réparateurs professionnels",
            "description": "Service gratuit de comparaison et mise en relation avec des réparateurs certifiés pour smartphones, tablettes, ordinateurs et consoles",
            "areaServed": {
              "@type": "Country",
              "name": "France"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR",
              "description": "Comparaison et devis gratuits"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Services de réparation",
              "itemListElement": [
                { "@type": "OfferCatalog", "name": "Réparation smartphone" },
                { "@type": "OfferCatalog", "name": "Réparation tablette" },
                { "@type": "OfferCatalog", "name": "Réparation ordinateur" },
                { "@type": "OfferCatalog", "name": "Réparation console de jeux" }
              ]
            }
          })}
        </script>
      </Helmet>

      <Navigation />

      <main>
        {/* Hero avec H1 optimisé et keyword dans les 100 premiers mots */}
        <ModernHero />

        {/* Trust Signals - E-A-T */}
        <TrustSignals />

        {/* Réparateurs populaires */}
        <RepairerResultsGrid />

        {/* Maillage interne : services + villes + ressources */}
        <InternalLinksSection />

        {/* FAQ optimisée Featured Snippets */}
        <HomepageFAQSchema />

        {/* Blog - Contenu frais */}
        <BlogSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;

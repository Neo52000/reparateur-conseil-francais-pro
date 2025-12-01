import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import ModernHero from '@/components/modern/ModernHero';
import TrustSignals from '@/components/modern/TrustSignals';
import RepairerResultsGrid from '@/components/modern/RepairerResultsGrid';
import BlogSection from '@/components/modern/BlogSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>TopRéparateurs - Trouvez le meilleur réparateur près de chez vous | Comparateur Gratuit</title>
        <meta 
          name="description" 
          content="Trouvez rapidement un réparateur certifié près de chez vous pour smartphone, tablette, ordinateur et console. Devis gratuit, intervention express et garantie incluse. Comparateur gratuit de professionnels vérifiés." 
        />
        <meta name="keywords" content="réparateur smartphone, réparation téléphone, réparateur tablette, réparation ordinateur, réparateur certifié, devis gratuit réparation, réparation express, réparateur près de moi, service réparation mobile, atelier réparation, dépannage smartphone" />
        <link rel="canonical" href="https://topreparateurs.fr/" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://topreparateurs.fr/" />
        <meta property="og:title" content="TopRéparateurs - Le Doctolib de la réparation" />
        <meta property="og:description" content="Trouvez un réparateur certifié près de chez vous en quelques clics. Devis gratuit et intervention rapide." />
        <meta property="og:image" content="https://topreparateurs.fr/og-image.jpg" />
        <meta property="og:locale" content="fr_FR" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://topreparateurs.fr/" />
        <meta property="twitter:title" content="TopRéparateurs - Trouvez votre réparateur" />
        <meta property="twitter:description" content="Comparateur gratuit de réparateurs certifiés" />
        <meta property="twitter:image" content="https://topreparateurs.fr/og-image.jpg" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="author" content="TopRéparateurs" />
        <meta name="language" content="fr" />
        <meta name="geo.region" content="FR" />
        <meta name="geo.placename" content="France" />
        
        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "TopRéparateurs",
            "url": "https://topreparateurs.fr",
            "logo": "https://topreparateurs.fr/logo.png",
            "description": "Plateforme de mise en relation avec des réparateurs professionnels certifiés",
            "sameAs": [
              "https://www.facebook.com/topreparateurs",
              "https://www.linkedin.com/company/topreparateurs"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "contact@topreparateurs.fr",
              "availableLanguage": ["French"]
            }
          })}
        </script>
        
        {/* Structured Data - WebSite */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "TopRéparateurs",
            "url": "https://topreparateurs.fr",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://topreparateurs.fr/search?city={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
        
        {/* Structured Data - Service */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Service de mise en relation avec des réparateurs",
            "provider": {
              "@type": "Organization",
              "name": "TopRéparateurs"
            },
            "serviceType": "Réparation d'appareils électroniques",
            "areaServed": {
              "@type": "Country",
              "name": "France"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR",
              "description": "Service de comparaison gratuit"
            }
          })}
        </script>
      </Helmet>

      {/* Header minimaliste sticky */}
      <Navigation />

      <main>
        {/* Hero avec glassmorphism search */}
        <ModernHero />

        {/* Trust Signals */}
        <TrustSignals />

        {/* Résultats réparateurs en grille */}
        <RepairerResultsGrid />

        {/* Section Blog */}
        <BlogSection />
      </main>

      {/* Footer simple */}
      <Footer />
    </div>
  );
};

export default Index;
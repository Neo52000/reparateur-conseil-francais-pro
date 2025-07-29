
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import DynamicPricingSection from '@/components/landing/DynamicPricingSection';
import SimpleFAQ from '@/components/landing/SimpleFAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import StickyCTA from '@/components/landing/StickyCTA';

const RepairerPlans = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/repairer-auth');
  };

  const handleWatchDemo = () => {
    navigate('/repairer/demo');
  };

  const handleSelectPlan = (planId: string) => {
    // Redirect to signup with selected plan
    navigate('/repairer-auth', { state: { selectedPlan: planId } });
  };

  const handleContactSupport = () => {
    // You can implement contact modal or redirect to contact page
    window.open('mailto:support@topreparateurs.fr', '_blank');
  };

  const scrollToPlans = () => {
    const element = document.getElementById('plans-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Plans Réparateurs - Solution complète pour digitaliser votre activité | TopRéparateurs</title>
        <meta 
          name="description" 
          content="Découvrez nos plans pour réparateurs : POS certifié NF525, boutique en ligne, référencement local, gestion QualiRépar. 7 jours d'essai gratuit." 
        />
        <meta name="keywords" content="réparateur smartphone, solution POS, boutique en ligne, référencement local, QualiRépar, caisse enregistreuse" />
        <link rel="canonical" href="https://topreparateurs.fr/repairer/plans" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Plans Réparateurs - Solution complète pour digitaliser votre activité" />
        <meta property="og:description" content="POS certifié NF525, boutique en ligne, référencement local. Rejoignez 2500+ réparateurs qui font confiance à TopRéparateurs." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://topreparateurs.fr/repairer/plans" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "TopRéparateurs - Solution complète pour réparateurs",
            "description": "Solution tout-en-un pour réparateurs : POS certifié NF525, boutique en ligne, référencement local, gestion QualiRépar",
            "brand": {
              "@type": "Brand",
              "name": "TopRéparateurs"
            },
            "offers": {
              "@type": "AggregateOffer",
              "lowPrice": "0",
              "highPrice": "999",
              "priceCurrency": "EUR"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <HeroSection 
          onGetStarted={handleGetStarted}
          onWatchDemo={handleWatchDemo}
        />

        {/* Features Section */}
        <FeaturesSection />

        {/* Dynamic Pricing Section */}
        <DynamicPricingSection onSelectPlan={handleSelectPlan} />

        {/* Resources Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Découvrez nos ressources</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="group">
                <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold mb-3">Témoignages</h3>
                  <p className="text-muted-foreground mb-4">Découvrez ce que nos réparateurs disent de nos solutions</p>
                  <a 
                    href="/repairer/temoignages" 
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                  >
                    Voir les témoignages →
                  </a>
                </div>
              </div>
              <div className="group">
                <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold mb-3">FAQ</h3>
                  <p className="text-muted-foreground mb-4">Trouvez des réponses à toutes vos questions</p>
                  <a 
                    href="/repairer/faq" 
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                  >
                    Consulter la FAQ →
                  </a>
                </div>
              </div>
              <div className="group">
                <div className="bg-background rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold mb-3">Démo</h3>
                  <p className="text-muted-foreground mb-4">Réservez une démonstration personnalisée</p>
                  <a 
                    href="/repairer/demo" 
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                  >
                    Réserver une démo →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simple FAQ */}
        <SimpleFAQ />

        {/* Final CTA */}
        <FinalCTA 
          onGetStarted={handleGetStarted}
          onContactSupport={handleContactSupport}
        />

        {/* Sticky CTA for mobile */}
        <StickyCTA onGetStarted={handleGetStarted} />
      </div>
    </>
  );
};

export default RepairerPlans;

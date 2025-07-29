
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

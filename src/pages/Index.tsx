
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import RepairersCarouselSection from '@/components/sections/RepairersCarouselSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { ContactSection } from '@/components/sections/ContactSection';
import Footer from '@/components/Footer';
import { CallToActionSection } from '@/components/sections/CallToActionSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import CookieConsent from '@/components/CookieBanner';
import { supabase } from '@/integrations/supabase/client';
import AdBannerDisplay from '@/components/advertising/AdBannerDisplay';

const Index = () => {
  const [isCookieConsentGiven, setIsCookieConsentGiven] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    setIsCookieConsentGiven(consent === 'true');
  }, []);

  const handleCookieConsent = (given: boolean) => {
    localStorage.setItem('cookie_consent', given.toString());
    setIsCookieConsentGiven(given);
  };

  const handleRepairerSignup = () => {
    if (user) {
      navigate('/repairer/onboarding');
    } else {
      toast({
        title: "Inscription Réparateur",
        description: "Veuillez vous connecter pour vous inscrire en tant que réparateur.",
      });
      navigate('/repairer/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main>
        <HeroSection onRepairerSignup={handleRepairerSignup} />

        <FeaturesSection />

        <HowItWorksSection />
        
        {/* Client Ad Banner - Above repairers carousel */}
        <section className="py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
            <AdBannerDisplay 
              targetType="client" 
              placement="home-above-carousel"
              className="mb-6"
            />
          </div>
        </section>

        <RepairersCarouselSection />

        <TestimonialsSection />

        <CallToActionSection />

        <FaqSection />

        <ContactSection />
      </main>

      <Footer />

      {!isCookieConsentGiven && (
        <CookieConsent onConsent={handleCookieConsent} />
      )}
    </div>
  );
};

export default Index;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/sections/HeroSection';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieBanner';
import RepairersCarouselSection from '@/components/sections/RepairersCarouselSection';
import AdBannerDisplay from '@/components/advertising/AdBannerDisplay';

const Index = () => {
  const [isCookieConsentGiven, setIsCookieConsentGiven] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    setIsCookieConsentGiven(consent === 'true');
  }, []);

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

  const handleViewProfile = (repairer: any) => {
    console.log('View profile:', repairer);
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleQuickSearch = () => {
    // Navigate to search page with current search parameters
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main>
        <HeroSection 
          searchTerm={searchTerm}
          selectedLocation={selectedLocation}
          onSearchTermChange={setSearchTerm}
          onLocationChange={setSelectedLocation}
          onQuickSearch={handleQuickSearch}
        />

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

        <RepairersCarouselSection 
          onViewProfile={handleViewProfile}
          onCall={handleCall}
        />
      </main>

      <Footer />

      {!isCookieConsentGiven && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <CookieConsent />
        </div>
      )}
    </div>
  );
};

export default Index;

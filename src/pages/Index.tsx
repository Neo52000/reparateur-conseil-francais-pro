
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HeroSection from '@/components/sections/HeroSection';
import QuickStatsSection from '@/components/sections/QuickStatsSection';
import RepairersCarouselSection from '@/components/sections/RepairersCarouselSection';
import { Repairer } from '@/types/repairer';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleQuickSearch = () => {
    console.log('Quick search triggered:', { searchTerm, selectedLocation });
  };

  const handleViewProfile = (repairer: Repairer) => {
    console.log('View profile:', repairer);
  };

  const handleCall = (phone: string) => {
    console.log('Call:', phone);
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <HeroSection 
          searchTerm={searchTerm}
          selectedLocation={selectedLocation}
          onSearchTermChange={setSearchTerm}
          onLocationChange={setSelectedLocation}
          onQuickSearch={handleQuickSearch}
        />
        <QuickStatsSection />
        <RepairersCarouselSection 
          onViewProfile={handleViewProfile}
          onCall={handleCall}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;

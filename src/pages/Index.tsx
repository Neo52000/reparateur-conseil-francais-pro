
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HeroSection from '@/components/sections/HeroSection';
import QuickStatsSection from '@/components/sections/QuickStatsSection';
import RepairersCarouselSection from '@/components/sections/RepairersCarouselSection';
import BlogWidget from '@/components/blog/BlogWidget';
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
        
        {/* Section Blog Widget */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <RepairersCarouselSection 
                  onViewProfile={handleViewProfile}
                  onCall={handleCall}
                />
              </div>
              <div className="lg:col-span-1">
                <BlogWidget limit={4} />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;

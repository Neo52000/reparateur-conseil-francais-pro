
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HeroSectionSimplified from '@/components/sections/HeroSectionSimplified';
import RepairersCarouselSection from '@/components/sections/RepairersCarouselSection';
import QuickStatsSection from '@/components/sections/QuickStatsSection';
import SearchModeSelector from '@/components/search/SearchModeSelector';
import QuickSearchModal from '@/components/search/QuickSearchModal';
import EnhancedRepairersMap from '@/components/search/EnhancedRepairersMap';
import RepairerProfileModal from '@/components/RepairerProfileModal';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [showMapSearch, setShowMapSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState<any>(null);

  const handleViewProfile = (repairer: any) => {
    setSelectedRepairerId(repairer.id);
  };

  const handleCall = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleQuickSearchResults = (filters: any) => {
    setSearchFilters(filters);
    setShowMapSearch(true);
  };

  if (showMapSearch) {
    return (
      <EnhancedRepairersMap
        searchFilters={searchFilters}
        onClose={() => {
          setShowMapSearch(false);
          setSearchFilters(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main>
        <HeroSectionSimplified />
        
        {/* Search Section */}
        <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="container mx-auto px-4">
            <SearchModeSelector
              onQuickSearch={() => setShowQuickSearch(true)}
              onMapSearch={() => setShowMapSearch(true)}
            />
          </div>
        </section>

        <RepairersCarouselSection 
          onViewProfile={handleViewProfile}
          onCall={handleCall}
        />
        
        <QuickStatsSection />
      </main>

      <Footer />

      {/* Modals */}
      <QuickSearchModal
        isOpen={showQuickSearch}
        onClose={() => setShowQuickSearch(false)}
        onSearch={handleQuickSearchResults}
      />

      {selectedRepairerId && (
        <RepairerProfileModal
          isOpen={!!selectedRepairerId}
          onClose={() => setSelectedRepairerId(null)}
          repairerId={selectedRepairerId}
        />
      )}
    </div>
  );
};

export default Index;

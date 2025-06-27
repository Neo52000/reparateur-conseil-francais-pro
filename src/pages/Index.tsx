
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HeroSectionSimplified from '@/components/sections/HeroSectionSimplified';
import RepairersCarouselSection from '@/components/sections/RepairersCarouselSection';
import QuickStatsSection from '@/components/sections/QuickStatsSection';
import QuickSearchModal from '@/components/search/QuickSearchModal';
import EnhancedRepairersMap from '@/components/search/EnhancedRepairersMap';
import RepairerProfileModal from '@/components/RepairerProfileModal';
import { useAuth } from '@/hooks/useAuth';

interface SearchCriteria {
  deviceType: string;
  brand: string;
  model: string;
  repairType: string;
  city: string;
  postalCode: string;
}

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

  const handleHeroQuickSearch = (searchCriteria: SearchCriteria) => {
    // Transform search criteria to filters format
    const filters = {
      city: searchCriteria.city,
      postalCode: searchCriteria.postalCode,
      deviceType: searchCriteria.deviceType,
      brand: searchCriteria.brand,
      model: searchCriteria.model,
      repairType: searchCriteria.repairType
    };
    setSearchFilters(filters);
    setShowMapSearch(true);
  };

  const handleHeroMapSearch = () => {
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
        <HeroSectionSimplified 
          onQuickSearch={handleHeroQuickSearch}
          onMapSearch={handleHeroMapSearch}
        />

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

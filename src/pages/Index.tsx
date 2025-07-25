import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HeroSectionSimplified from '@/components/sections/HeroSectionSimplified';
import RepairersCarouselSection from '@/components/sections/RepairersCarouselSection';
import TrustSection from '@/components/sections/TrustSection';
import QuickStatsSection from '@/components/sections/QuickStatsSection';
import BlogSectionHomepage from '@/components/sections/BlogSectionHomepage';
import QuickSearchModal from '@/components/search/QuickSearchModal';
import EnhancedRepairersMap from '@/components/search/EnhancedRepairersMap';
import RepairerProfileModal from '@/components/RepairerProfileModal';
import AdBannerDisplay from '@/components/advertising/AdBannerDisplay';
import ChatWidget from '@/components/chatbot/ChatWidget';
import { useAuth } from '@/hooks/useAuth';
import { usePendingAction } from '@/hooks/usePendingAction';
import { useQuoteAndAppointment } from '@/hooks/useQuoteAndAppointment';

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
  
  try {
    const { user } = useAuth();
    const { pendingAction, clearPendingAction } = usePendingAction();
    const {
      isQuoteModalOpen,
      isAppointmentModalOpen,
      selectedRepairerId,
      selectedQuoteId,
      handleRequestQuote,
      handleBookAppointment,
      closeQuoteModal,
      closeAppointmentModal
    } = useQuoteAndAppointment();
    
    const [selectedRepairerForProfile, setSelectedRepairerForProfile] = useState<string | null>(null);
    const [showQuickSearch, setShowQuickSearch] = useState(false);
    const [showMapSearch, setShowMapSearch] = useState(false);
    const [searchFilters, setSearchFilters] = useState<any>(null);

    console.log('🏠 Index page rendering');

  // Gérer la restauration des actions après connexion
  useEffect(() => {
    if (user && pendingAction) {
      if (pendingAction.type === 'quote_request') {
        const data = pendingAction.data as any;
        if (data.repairerId) {
          handleRequestQuote(data.repairerId);
        }
        clearPendingAction();
      } else if (pendingAction.type === 'appointment_request') {
        const data = pendingAction.data as { repairerId: string; quoteId?: string };
        handleBookAppointment(data.repairerId, data.quoteId);
        clearPendingAction();
      }
    }
  }, [user, pendingAction, handleRequestQuote, handleBookAppointment, clearPendingAction]);

  // Gérer l'ancien système pour les devis (rétrocompatibilité)
  useEffect(() => {
    if (user) {
      const oldPendingQuote = localStorage.getItem('pendingQuoteAction');
      if (oldPendingQuote) {
        try {
          const data = JSON.parse(oldPendingQuote);
          if (data.type === 'quote_request' && data.data?.repairerId) {
            handleRequestQuote(data.data.repairerId);
          }
        } catch (error) {
          console.error('Error parsing old pending quote:', error);
        }
        localStorage.removeItem('pendingQuoteAction');
      }
    }
  }, [user, handleRequestQuote]);

  const handleViewProfile = (repairer: any) => {
    setSelectedRepairerForProfile(repairer.id);
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

        {/* Section bannière publicitaire - déplacée au-dessus du carrousel */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AdBannerDisplay 
            placement="homepage_carousel" 
            className=""
          />
        </div>

        <RepairersCarouselSection 
          onViewProfile={handleViewProfile}
          onCall={handleCall}
        />
        
        <TrustSection />
        
        <QuickStatsSection />
        
        {/* Section blog avant le footer */}
        <BlogSectionHomepage />
      </main>

      <Footer />

      {/* Widget de Chat IA */}
      <ChatWidget />

      {/* Modals */}
      <QuickSearchModal
        isOpen={showQuickSearch}
        onClose={() => setShowQuickSearch(false)}
        onSearch={handleQuickSearchResults}
      />

      {selectedRepairerForProfile && (
        <RepairerProfileModal
          isOpen={!!selectedRepairerForProfile}
          onClose={() => setSelectedRepairerForProfile(null)}
          repairerId={selectedRepairerForProfile}
        />
      )}
    </div>
  );
  } catch (error) {
    console.error('Erreur critique dans Index:', error);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">Une erreur s'est produite lors du chargement de la page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }
};

export default Index;

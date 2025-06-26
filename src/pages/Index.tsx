
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import HeroSectionSimplified from '@/components/sections/HeroSectionSimplified';
import QuickStatsSection from '@/components/sections/QuickStatsSection';
import MainMapSection from '@/components/sections/MainMapSection';
import RepairersCarouselSection from '@/components/sections/RepairersCarouselSection';
import Footer from '@/components/Footer';
import RepairerProfileModal from '@/components/RepairerProfileModal';
import { useSearchStore } from '@/stores/searchStore';

/**
 * Page d'accueil simplifiée
 * Version optimisée pour éviter les erreurs de rendu
 */
const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { toast } = useToast();
  const { 
    filters, 
    isSearchActive, 
    searchMode, 
    performSearch, 
    setSearchTerm: setStoreSearchTerm, 
    clearSearch
  } = useSearchStore();

  const handleQuickSearch = () => {
    console.log('Recherche déclenchée:', { searchTerm, selectedLocation });
    
    const serviceText = searchTerm.trim() ? `"${searchTerm.trim()}"` : "Non spécifié";
    const locationText = filters.city || filters.postalCode || selectedLocation.trim() || "Non spécifiée";
    
    setStoreSearchTerm(searchTerm);
    performSearch();
    
    toast({
      title: "Recherche lancée",
      description: `Service : ${serviceText} / Localisation : ${locationText}`,
    });
  };

  const handleViewProfile = (repairer: any) => {
    console.log('Ouverture du profil:', repairer.id);
    setSelectedRepairerId(repairer.id);
    setIsProfileModalOpen(true);
  };

  const handleCall = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedRepairerId(null);
  };

  const handleResetSearch = () => {
    clearSearch();
    setSearchTerm('');
    setSelectedLocation('');
    toast({
      title: "Recherche réinitialisée",
      description: "Nouvelle recherche disponible."
    });
  };

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
        <HeroSectionSimplified
          searchTerm={searchTerm}
          selectedLocation={selectedLocation}
          onSearchTermChange={setSearchTerm}
          onLocationChange={setSelectedLocation}
          onQuickSearch={handleQuickSearch}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <QuickStatsSection />

          {isSearchActive && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Recherche active ({searchMode === 'quick' ? 'Rapide' : 'Carte'})
                  </h3>
                  <p className="text-blue-700">
                    Filtres : 
                    {filters.searchTerm && ` Service: "${filters.searchTerm}"`}
                    {filters.city && ` Ville: "${filters.city}"`}
                    {filters.postalCode && ` CP: "${filters.postalCode}"`}
                  </p>
                </div>
                <button 
                  onClick={handleResetSearch}
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}

          {(isSearchActive || searchMode === 'map') && (
            <MainMapSection />
          )}

          <RepairersCarouselSection
            onViewProfile={handleViewProfile}
            onCall={handleCall}
          />
        </div>

        {selectedRepairerId && (
          <RepairerProfileModal
            isOpen={isProfileModalOpen}
            onClose={handleCloseProfileModal}
            repairerId={selectedRepairerId}
          />
        )}

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Erreur critique dans Index:', error);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Service temporairement indisponible</h1>
          <p className="text-gray-600">Veuillez recharger la page</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }
};

export default Index;

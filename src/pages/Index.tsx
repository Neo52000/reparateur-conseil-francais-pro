
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import HeroSection from '@/components/sections/HeroSection';
import QuickStatsSection from '@/components/sections/QuickStatsSection';
import MainMapSection from '@/components/sections/MainMapSection';
import RepairersCarouselSection from '@/components/sections/RepairersCarouselSection';
import Footer from '@/components/Footer';
import RepairerProfileModal from '@/components/RepairerProfileModal';
import { useSearchStore } from '@/stores/searchStore';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { toast } = useToast();
  const { filters, isSearchActive } = useSearchStore();

  const handleQuickSearch = () => {
    console.log('Button clicked - searchTerm:', searchTerm, 'selectedLocation:', selectedLocation);
    
    // Construire le message de confirmation avec les valeurs saisies
    const serviceText = searchTerm.trim() ? `"${searchTerm.trim()}"` : "Non spécifié";
    
    // Vérifier les données de localisation dans le store
    let locationText = "Non spécifiée";
    if (filters.city && filters.postalCode) {
      locationText = `"${filters.city} (${filters.postalCode})"`;
    } else if (selectedLocation.trim()) {
      locationText = `"${selectedLocation.trim()}"`;
    }
    
    // Vérifier si au moins un champ est rempli
    const hasService = searchTerm.trim();
    const hasLocation = filters.city || filters.postalCode || selectedLocation.trim();
    
    if (!hasService && !hasLocation) {
      toast({
        title: "Recherche incomplète",
        description: "Veuillez saisir un service ou une localisation pour effectuer votre recherche.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Recherche rapide lancée",
      description: `Service : ${serviceText} / Localisation : ${locationText}`,
    });

    console.log('Recherche avec filtres:', {
      service: searchTerm.trim() || null,
      location: selectedLocation.trim() || null,
      city: filters.city || null,
      postalCode: filters.postalCode || null
    });
  };

  const handleViewProfile = (repairer: any) => {
    console.log('Opening profile for:', repairer.id);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Hero Section avec image pleine largeur et recherche dessus */}
      <HeroSection
        searchTerm={searchTerm}
        selectedLocation={selectedLocation}
        onSearchTermChange={setSearchTerm}
        onLocationChange={setSelectedLocation}
        onQuickSearch={handleQuickSearch}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <QuickStatsSection />

        {/* Indicateur de recherche active */}
        {isSearchActive && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Recherche active</h3>
                <p className="text-blue-700">
                  Filtres appliqués : 
                  {filters.searchTerm && ` Service: "${filters.searchTerm}"`}
                  {filters.city && ` Ville: "${filters.city}"`}
                  {filters.postalCode && ` CP: "${filters.postalCode}"`}
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}

        {/* Main Content - Carte pleine page */}
        <MainMapSection />

        {/* Carrousel des réparateurs */}
        <RepairersCarouselSection
          onViewProfile={handleViewProfile}
          onCall={handleCall}
        />
      </div>

      {/* Modal de profil réparateur */}
      {selectedRepairerId && (
        <RepairerProfileModal
          isOpen={isProfileModalOpen}
          onClose={handleCloseProfileModal}
          repairerId={selectedRepairerId}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;

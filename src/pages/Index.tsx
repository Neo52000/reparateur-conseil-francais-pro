
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import HeroSection from '@/components/sections/HeroSection';
import QuickStatsSection from '@/components/sections/QuickStatsSection';
import MainMapSection from '@/components/sections/MainMapSection';
import RepairersCarouselSection from '@/components/sections/RepairersCarouselSection';
import Footer from '@/components/Footer';
import RepairerProfileModal from '@/components/RepairerProfileModal';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedRepairerId, setSelectedRepairerId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { toast } = useToast();

  const handleQuickSearch = () => {
    console.log('Button clicked - searchTerm:', searchTerm, 'selectedLocation:', selectedLocation);
    toast({
      title: "Recherche rapide",
      description: `Service : "${searchTerm}" / Localisation : "${selectedLocation}"`,
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

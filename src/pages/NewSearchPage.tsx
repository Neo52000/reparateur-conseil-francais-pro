
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchModeSelector from '@/components/search/SearchModeSelector';
import QuickSearchModal from '@/components/search/QuickSearchModal';
import EnhancedRepairersMap from '@/components/search/EnhancedRepairersMap';

const NewSearchPage: React.FC = () => {
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [showMapSearch, setShowMapSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState<any>(null);

  const handleQuickSearchResults = (filters: any) => {
    setSearchFilters(filters);
    setShowMapSearch(true);
  };

  const handleBackToHome = () => {
    window.location.href = '/';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={handleBackToHome}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center justify-center min-h-[600px]">
          <SearchModeSelector
            onQuickSearch={() => setShowQuickSearch(true)}
            onMapSearch={() => setShowMapSearch(true)}
          />
        </div>

        {/* Quick Search Modal */}
        <QuickSearchModal
          isOpen={showQuickSearch}
          onClose={() => setShowQuickSearch(false)}
          onSearch={handleQuickSearchResults}
        />
      </div>
    </div>
  );
};

export default NewSearchPage;

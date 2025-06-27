
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SearchModeSelector from '@/components/search/SearchModeSelector';

interface SearchCriteria {
  deviceType: string;
  brand: string;
  model: string;
  repairType: string;
  city: string;
  postalCode: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickSearch: (searchCriteria: SearchCriteria) => void;
  onMapSearch: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onQuickSearch,
  onMapSearch
}) => {
  const handleQuickSearch = (searchCriteria: SearchCriteria) => {
    onQuickSearch(searchCriteria);
    onClose();
  };

  const handleMapSearch = () => {
    onMapSearch();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900 mb-4">
            Trouvez votre réparateur
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <SearchModeSelector
            onQuickSearch={handleQuickSearch}
            onMapSearch={handleMapSearch}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import SearchFilters from '@/components/SearchFilters';

interface FiltersSectionProps {
  showFilters: boolean;
  onToggleFilters: () => void;
}

const FiltersSection: React.FC<FiltersSectionProps> = ({
  showFilters,
  onToggleFilters
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={onToggleFilters}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6">
          <SearchFilters />
        </div>
      )}
    </>
  );
};

export default FiltersSection;

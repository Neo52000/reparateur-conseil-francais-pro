import React, { memo, useMemo } from 'react';
import RepairerProfileModal from '@/components/RepairerProfileModal';
import QuoteRequestModal from '@/components/modals/QuoteRequestModal';
import AppointmentModal from '@/components/modals/AppointmentModal';
import EnhancedRepairersMap from '@/components/search/EnhancedRepairersMap';
import SearchFilters from '@/components/SearchFilters';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRepairersOptimized } from '@/hooks/useRepairersOptimized';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/utils/logger';

const SearchPageOptimized = memo(() => {
  const [viewMode, setViewMode] = React.useState<'list' | 'map'>('map');
  const [showFilters, setShowFilters] = React.useState(false);
  const [searchFilters, setSearchFilters] = React.useState({});
  
  const { userLocation } = useGeolocation();
  
  // Mémoriser les filtres pour éviter les re-renders
  const memoizedFilters = useMemo(() => searchFilters, [searchFilters]);
  
  const { repairers, loading, error } = useRepairersOptimized(memoizedFilters, userLocation);

  // Debug info optimisé
  React.useEffect(() => {
    logger.debug('SearchPage state:', { count: repairers.length, loading, error });
  }, [repairers.length, loading, error]);

  const handleFiltersChange = React.useCallback((newFilters: any) => {
    setSearchFilters(newFilters);
  }, []);

  const toggleFilters = React.useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const clearFilters = React.useCallback(() => {
    setSearchFilters({});
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(searchFilters).length > 0;
  }, [searchFilters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header optimisé */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Recherche de réparateurs
              </h1>
              {repairers.length > 0 && (
                <Badge variant="secondary">
                  {repairers.length} résultat{repairers.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFilters}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtres
                {hasActiveFilters && (
                  <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <SearchFilters 
              onFiltersChange={handleFiltersChange}
              initialFilters={searchFilters}
            />
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Vue carte optimisée */}
        <EnhancedRepairersMap 
          searchFilters={memoizedFilters}
          onClose={() => {}}
        />
      </div>
    </div>
  );
});

SearchPageOptimized.displayName = 'SearchPageOptimized';

export default SearchPageOptimized;
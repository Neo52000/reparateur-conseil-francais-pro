
import React, { useState } from 'react';
import { MapPin, List, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SearchFilters from '@/components/SearchFilters';
import RepairersList from '@/components/RepairersList';
import EnhancedRepairersMap from './EnhancedRepairersMap';
import { useRepairers } from '@/hooks/useRepairers';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSeoIntegration } from '@/hooks/useSeoIntegration';
import SeoPageIntegration from '@/components/seo/SeoPageIntegration';

const SearchPage = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});
  
  const { userLocation } = useGeolocation();
  const { repairers, loading, error } = useRepairers(searchFilters, userLocation);

  // Intégration SEO pour suggestion automatique  
  const { hasSeoPage, hasAccess } = useSeoIntegration({
    city: 'Paris', // Ville par défaut pour démonstration
    serviceType: 'smartphone'
  });

  // Debug info
  React.useEffect(() => {
    console.log('SearchPage - Repairers state:', { count: repairers.length, loading, error });
  }, [repairers, loading, error]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">Recherche de réparateurs</h1>
              <Badge variant="outline">
                {loading ? 'Chargement...' : `${repairers.length} résultat${repairers.length !== 1 ? 's' : ''}`}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Filtres
              </Button>
              
              <div className="flex rounded-md overflow-hidden border">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setViewMode('map')}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <SearchFilters />
          </div>
        </div>
      )}

      {/* Debug info for imported repairers */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Erreur:</strong> {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {!loading && !error && repairers.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Aucun réparateur trouvé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Il semble qu'aucun réparateur ne soit disponible avec les critères actuels.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p><strong>Vérifications possibles :</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Les réparateurs importés sont-ils marqués comme "vérifiés" ?</li>
                  <li>Y a-t-il des filtres trop restrictifs appliqués ?</li>
                  <li>Les coordonnées géographiques sont-elles correctes ?</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Suggestion page SEO */}
        {hasSeoPage && hasAccess && (
          <div className="mb-6">
            <SeoPageIntegration
              city="Paris"
              serviceType="smartphone"
            />
          </div>
        )}
        
        {viewMode === 'map' ? (
          <EnhancedRepairersMap searchFilters={searchFilters} repairers={repairers} />
        ) : (
          <RepairersList filters={searchFilters} />
        )}
      </div>
    </div>
  );
};

export default SearchPage;

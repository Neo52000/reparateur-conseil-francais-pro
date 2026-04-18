/**
 * Page de recherche IA — même shell visuel que SearchPage classique.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Map, List, SlidersHorizontal, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import SearchModeTabs from './SearchModeTabs';
import { AISearchBar } from './AISearchBar';
import { AISearchResultsList } from './AISearchResultsList';
import { useAISearch } from '@/hooks/useAISearch';
import type { MatchedRepairer, ParsedSearchIntent } from '@/services/search';

interface AISearchPageProps {
  onClose?: () => void;
  initialQuery?: string;
}

export const AISearchPage: React.FC<AISearchPageProps> = ({ onClose, initialQuery = '' }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);

  const [maxDistance, setMaxDistance] = useState(50);
  const [minRating, setMinRating] = useState(0);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyClaimed, setOnlyClaimed] = useState(false);

  const { search, result, loading, error } = useAISearch({ logQueries: true });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      search(q, { maxDistanceKm: maxDistance, minRating, onlyVerified, onlyClaimed });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (query: string, _intent: ParsedSearchIntent) => {
    setSearchParams({ q: query });
    await search(query, { maxDistanceKm: maxDistance, minRating, onlyVerified, onlyClaimed });
  };

  const handleSelectRepairer = (repairer: MatchedRepairer) => {
    navigate(`/repairer/${repairer.id}`);
  };

  const handleContactRepairer = (repairer: MatchedRepairer) => {
    if (repairer.phone) {
      window.location.href = `tel:${repairer.phone}`;
    }
  };

  const applyFilters = () => {
    const q = searchParams.get('q');
    if (q) {
      search(q, { maxDistanceKm: maxDistance, minRating, onlyVerified, onlyClaimed });
    }
    setShowFilters(false);
  };

  const activeFilterCount =
    (maxDistance !== 50 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (onlyVerified ? 1 : 0) +
    (onlyClaimed ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Sticky header */}
      <div className="sticky top-16 md:top-20 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="container py-3 md:py-4 space-y-3">
          <div className="flex justify-center md:justify-start">
            <SearchModeTabs />
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-stretch">
            <div className="flex-1">
              <AISearchBar onSearch={handleSearch} showIntentPreview showSuggestions />
            </div>

            <div className="flex items-center gap-2">
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 relative">
                    <SlidersHorizontal className="h-4 w-4 mr-2" aria-hidden />
                    Filtres
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[90vw] max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>

                  <div className="space-y-6 mt-6">
                    <div className="space-y-3">
                      <Label className="font-medium">Distance maximale : {maxDistance} km</Label>
                      <Slider
                        value={[maxDistance]}
                        onValueChange={v => setMaxDistance(v[0])}
                        min={5}
                        max={100}
                        step={5}
                        aria-label="Distance maximale en kilomètres"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="font-medium">Note minimale : {minRating}/5</Label>
                      <Slider
                        value={[minRating]}
                        onValueChange={v => setMinRating(v[0])}
                        min={0}
                        max={5}
                        step={0.5}
                        aria-label="Note minimale"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="space-y-0.5">
                        <Label htmlFor="ai-verified" className="font-medium">Réparateurs vérifiés uniquement</Label>
                        <p className="text-xs text-muted-foreground">Identité et compétences validées</p>
                      </div>
                      <Switch id="ai-verified" checked={onlyVerified} onCheckedChange={setOnlyVerified} />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="space-y-0.5">
                        <Label htmlFor="ai-claimed" className="font-medium">Fiches revendiquées uniquement</Label>
                        <p className="text-xs text-muted-foreground">Profils gérés par le réparateur</p>
                      </div>
                      <Switch id="ai-claimed" checked={onlyClaimed} onCheckedChange={setOnlyClaimed} />
                    </div>

                    <Button onClick={applyFilters} className="w-full">Appliquer les filtres</Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'list' | 'map')}>
                <TabsList className="h-10">
                  <TabsTrigger value="list" className="gap-1.5">
                    <List className="h-4 w-4" aria-hidden />
                    <span className="hidden sm:inline">Liste</span>
                  </TabsTrigger>
                  <TabsTrigger value="map" className="gap-1.5">
                    <Map className="h-4 w-4" aria-hidden />
                    <span className="hidden sm:inline">Carte</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="container py-6">
        {viewMode === 'list' ? (
          <AISearchResultsList
            result={result}
            loading={loading}
            error={error}
            onSelectRepairer={handleSelectRepairer}
            onContactRepairer={handleContactRepairer}
            showMatchScores
          />
        ) : (
          <div className="h-[60vh] rounded-2xl border border-border bg-muted/40 flex flex-col items-center justify-center gap-2 shadow-elev-1">
            <Info className="h-5 w-5 text-muted-foreground" aria-hidden />
            <p className="text-muted-foreground text-sm">Vue carte IA en cours d'intégration</p>
            <Button variant="outline" size="sm" onClick={() => setViewMode('list')}>
              Revenir à la liste
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AISearchPage;

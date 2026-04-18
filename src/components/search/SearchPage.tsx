import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, List, SlidersHorizontal, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navigation from '@/components/Navigation';
import SearchModeTabs from './SearchModeTabs';
import RepairersList from '@/components/RepairersList';
import EnhancedRepairersMap from './EnhancedRepairersMap';
import { useRepairers } from '@/hooks/useRepairers';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSeoIntegration } from '@/hooks/useSeoIntegration';
import SeoPageIntegration from '@/components/seo/SeoPageIntegration';
import type { SearchFilters as SearchFiltersType } from '@/types/searchFilters';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);

  // Search inputs (controlled)
  const [device, setDevice] = useState(searchParams.get('q') ?? '');
  const [city, setCity] = useState(searchParams.get('city') ?? '');

  // Filter state
  const [distance, setDistance] = useState<number>(50);
  const [minRating, setMinRating] = useState<number>(0);
  const [openNow, setOpenNow] = useState(false);
  const [fastResponse, setFastResponse] = useState(false);

  // Computed filters for the data hook
  const [appliedFilters, setAppliedFilters] = useState<SearchFiltersType>({
    searchTerm: searchParams.get('q') ?? undefined,
    city: searchParams.get('city') ?? undefined,
  });

  const { userLocation } = useGeolocation();
  const { repairers, loading, error } = useRepairers(appliedFilters, userLocation);
  const { hasSeoPage, hasAccess } = useSeoIntegration({
    city: appliedFilters.city || 'Paris',
    serviceType: 'smartphone',
  });

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const c = searchParams.get('city') ?? '';
    setDevice(q);
    setCity(c);
    setAppliedFilters(prev => ({ ...prev, searchTerm: q || undefined, city: c || undefined }));
  }, [searchParams]);

  const submitSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (device.trim()) params.set('q', device.trim()); else params.delete('q');
    if (city.trim()) params.set('city', city.trim()); else params.delete('city');
    setSearchParams(params, { replace: true });
  };

  const applyFilters = () => {
    setAppliedFilters(prev => ({
      ...prev,
      distance,
      minRating: minRating > 0 ? minRating : undefined,
      openNow: openNow || undefined,
      fastResponse: fastResponse || undefined,
    }));
    setShowFilters(false);
  };

  const resetFilters = () => {
    setDistance(50);
    setMinRating(0);
    setOpenNow(false);
    setFastResponse(false);
    setAppliedFilters({
      searchTerm: device.trim() || undefined,
      city: city.trim() || undefined,
    });
  };

  const activeFilterCount =
    (appliedFilters.distance && appliedFilters.distance !== 50 ? 1 : 0) +
    (appliedFilters.minRating ? 1 : 0) +
    (appliedFilters.openNow ? 1 : 0) +
    (appliedFilters.fastResponse ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Sticky search bar */}
      <div className="sticky top-16 md:top-20 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="container py-3 md:py-4 space-y-3">
          <div className="flex justify-center md:justify-start">
            <SearchModeTabs />
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-stretch">
            <div className="flex flex-1 gap-2 bg-card rounded-xl shadow-elev-1 border border-border p-1.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
                <Input
                  type="text"
                  placeholder="iPhone 13, écran cassé…"
                  value={device}
                  onChange={e => setDevice(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitSearch()}
                  className="h-10 pl-9 border-0 bg-transparent focus-visible:ring-0"
                  aria-label="Appareil ou panne"
                />
              </div>
              <div className="hidden sm:block w-px bg-border" aria-hidden />
              <div className="relative sm:w-48">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden />
                <Input
                  type="text"
                  placeholder="Ville"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitSearch()}
                  className="h-10 pl-9 border-0 bg-transparent focus-visible:ring-0"
                  aria-label="Ville"
                />
              </div>
              <Button onClick={submitSearch} className="h-10 px-4" aria-label="Lancer la recherche">
                <Search className="h-4 w-4 sm:mr-2" aria-hidden />
                <span className="hidden sm:inline">Rechercher</span>
              </Button>
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
                      <Label className="font-medium">Distance maximale : {distance} km</Label>
                      <Slider
                        value={[distance]}
                        onValueChange={v => setDistance(v[0])}
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
                        <Label htmlFor="open-now" className="font-medium">Ouvert maintenant</Label>
                        <p className="text-xs text-muted-foreground">Réparateurs avec créneau immédiat</p>
                      </div>
                      <Switch id="open-now" checked={openNow} onCheckedChange={setOpenNow} />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="space-y-0.5">
                        <Label htmlFor="fast-response" className="font-medium">Réponse rapide</Label>
                        <p className="text-xs text-muted-foreground">Devis sous 24h en moyenne</p>
                      </div>
                      <Switch id="fast-response" checked={fastResponse} onCheckedChange={setFastResponse} />
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <Button onClick={applyFilters} className="w-full">Appliquer les filtres</Button>
                      <Button onClick={resetFilters} variant="ghost" className="w-full">Réinitialiser</Button>
                    </div>
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
                    <MapPin className="h-4 w-4" aria-hidden />
                    <span className="hidden sm:inline">Carte</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Result count + AI suggestion */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-sm">
            <div className="text-muted-foreground">
              {loading ? (
                'Recherche en cours…'
              ) : (
                <>
                  <strong className="text-foreground">{repairers.length}</strong> réparateur{repairers.length !== 1 ? 's' : ''} trouvé{repairers.length !== 1 ? 's' : ''}
                  {appliedFilters.city && <> à <strong className="text-foreground">{appliedFilters.city}</strong></>}
                </>
              )}
            </div>
            <Link
              to="/ai-search"
              className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Essayer le diagnostic IA
            </Link>
          </div>
        </div>
      </div>

      {/* SEO suggestion */}
      {hasSeoPage && hasAccess && (
        <div className="container pt-4">
          <SeoPageIntegration city={appliedFilters.city || 'Paris'} serviceType="smartphone" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="container pt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" aria-hidden />
            <AlertDescription>
              <strong>Erreur :</strong> {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && repairers.length === 0 && (
        <div className="container py-10">
          <Card className="max-w-2xl mx-auto shadow-elev-2">
            <CardHeader>
              <CardTitle className="text-xl">Aucun réparateur trouvé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Aucun réparateur ne correspond à vos critères actuels.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>Élargissez la distance dans les filtres</li>
                <li>Essayez une autre ville à proximité</li>
                <li>Réinitialisez les filtres pour voir tous les résultats</li>
              </ul>
              <div className="flex gap-2 pt-2">
                <Button onClick={resetFilters} variant="outline">Réinitialiser les filtres</Button>
                <Link to="/ai-search">
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" aria-hidden />
                    Tenter le diagnostic IA
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      <main className="container py-6">
        {viewMode === 'map' ? (
          <EnhancedRepairersMap searchFilters={appliedFilters} repairers={repairers} />
        ) : (
          <RepairersList filters={appliedFilters} />
        )}
      </main>
    </div>
  );
};

export default SearchPage;

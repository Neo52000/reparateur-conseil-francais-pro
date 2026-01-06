/**
 * Page de recherche IA complète
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Map, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AISearchBar } from './AISearchBar';
import { AISearchResultsList } from './AISearchResultsList';
import { useAISearch } from '@/hooks/useAISearch';
import type { MatchedRepairer, ParsedSearchIntent } from '@/services/search';

interface AISearchPageProps {
  onClose?: () => void;
  initialQuery?: string;
}

export const AISearchPage: React.FC<AISearchPageProps> = ({
  onClose,
  initialQuery = '',
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtres
  const [maxDistance, setMaxDistance] = useState(50);
  const [minRating, setMinRating] = useState(0);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyClaimed, setOnlyClaimed] = useState(false);
  
  const {
    search,
    result,
    loading,
    error,
    intent,
  } = useAISearch({ logQueries: true });
  
  // Recherche initiale si query dans URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      search(q, { maxDistanceKm: maxDistance, minRating, onlyVerified, onlyClaimed });
    }
  }, []);
  
  const handleSearch = async (query: string, parsedIntent: ParsedSearchIntent) => {
    setSearchParams({ q: query });
    await search(query, {
      maxDistanceKm: maxDistance,
      minRating,
      onlyVerified,
      onlyClaimed,
    });
  };
  
  const handleSelectRepairer = (repairer: MatchedRepairer) => {
    navigate(`/repairer/${repairer.id}`);
  };
  
  const handleContactRepairer = (repairer: MatchedRepairer) => {
    if (repairer.phone) {
      window.location.href = `tel:${repairer.phone}`;
    }
  };
  
  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };
  
  const applyFilters = () => {
    const q = searchParams.get('q');
    if (q) {
      search(q, { maxDistanceKm: maxDistance, minRating, onlyVerified, onlyClaimed });
    }
    setShowFilters(false);
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex-1">
              <AISearchBar
                onSearch={handleSearch}
                showIntentPreview={true}
                showSuggestions={true}
              />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'map')}>
            <TabsList>
              <TabsTrigger value="list">
                <List className="h-4 w-4 mr-2" />
                Liste
              </TabsTrigger>
              <TabsTrigger value="map">
                <Map className="h-4 w-4 mr-2" />
                Carte
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtres de recherche</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Distance */}
                <div className="space-y-3">
                  <Label>Distance maximale : {maxDistance} km</Label>
                  <Slider
                    value={[maxDistance]}
                    onValueChange={(v) => setMaxDistance(v[0])}
                    min={5}
                    max={100}
                    step={5}
                  />
                </div>
                
                {/* Note minimum */}
                <div className="space-y-3">
                  <Label>Note minimale : {minRating}/5</Label>
                  <Slider
                    value={[minRating]}
                    onValueChange={(v) => setMinRating(v[0])}
                    min={0}
                    max={5}
                    step={0.5}
                  />
                </div>
                
                {/* Réparateurs vérifiés */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="verified">Réparateurs vérifiés uniquement</Label>
                  <Switch
                    id="verified"
                    checked={onlyVerified}
                    onCheckedChange={setOnlyVerified}
                  />
                </div>
                
                {/* Fiches revendiquées */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="claimed">Fiches revendiquées uniquement</Label>
                  <Switch
                    id="claimed"
                    checked={onlyClaimed}
                    onCheckedChange={setOnlyClaimed}
                  />
                </div>
                
                <Button onClick={applyFilters} className="w-full">
                  Appliquer les filtres
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Results */}
        {viewMode === 'list' ? (
          <AISearchResultsList
            result={result}
            loading={loading}
            error={error}
            onSelectRepairer={handleSelectRepairer}
            onContactRepairer={handleContactRepairer}
            showMatchScores={true}
          />
        ) : (
          <div className="h-[600px] rounded-lg border bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">
              Vue carte en cours d'intégration...
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AISearchPage;

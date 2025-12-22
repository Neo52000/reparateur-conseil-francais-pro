import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Flame } from 'lucide-react';
import FirecrawlScraper from './FirecrawlScraper';

// Lazy import to avoid circular dependencies
const GooglePlacesScraperContent = React.lazy(() => import('./GooglePlacesScraper'));

const ScrapingHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('google-places');

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Hub de Scraping</h1>
        <p className="text-muted-foreground">
          Collectez des données de réparateurs via différentes sources
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="google-places" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Google Places
          </TabsTrigger>
          <TabsTrigger value="firecrawl" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Firecrawl
          </TabsTrigger>
        </TabsList>

        <TabsContent value="google-places" className="mt-6">
          <React.Suspense fallback={<div className="p-8 text-center text-muted-foreground">Chargement...</div>}>
            <GooglePlacesScraperContent />
          </React.Suspense>
        </TabsContent>

        <TabsContent value="firecrawl" className="mt-6">
          <FirecrawlScraper />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrapingHub;

import React, { useState, Component, ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Flame, AlertTriangle, RefreshCw } from 'lucide-react';
import FirecrawlScraper from './FirecrawlScraper';

// Lazy import to avoid circular dependencies
const GooglePlacesScraperContent = React.lazy(() => import('./GooglePlacesScraper'));

// ErrorBoundary for lazy loading failures (e.g., stale cache)
interface LazyErrorBoundaryState {
  hasError: boolean;
}

class LazyLoadErrorBoundary extends Component<{ children: ReactNode }, LazyErrorBoundaryState> {
  state: LazyErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): LazyErrorBoundaryState {
    return { hasError: true };
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="m-4">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Module non disponible</h3>
            <p className="text-muted-foreground mb-4">
              Une nouvelle version de l'application est disponible.
            </p>
            <Button onClick={this.handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recharger l'application
            </Button>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}

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
          <LazyLoadErrorBoundary>
            <React.Suspense fallback={<div className="p-8 text-center text-muted-foreground">Chargement...</div>}>
              <GooglePlacesScraperContent />
            </React.Suspense>
          </LazyLoadErrorBoundary>
        </TabsContent>

        <TabsContent value="firecrawl" className="mt-6">
          <FirecrawlScraper />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScrapingHub;

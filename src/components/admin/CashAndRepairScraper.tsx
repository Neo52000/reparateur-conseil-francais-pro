import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Phone, Mail, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ScrapingResult {
  success: boolean;
  message: string;
  stats: {
    locationsFound: number;
    inserted: number;
    errors: number;
    source: string;
  };
  locations: Array<{
    name: string;
    address: string;
    city: string;
    phone?: string;
    email?: string;
  }>;
  error?: string;
}

export const CashAndRepairScraper: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScrapingResult | null>(null);
  const { toast } = useToast();

  const handleStartScraping = async () => {
    setIsLoading(true);
    setProgress(0);
    setResult(null);

    try {
      toast({
        title: "Scraping démarré",
        description: "Extraction des données Cash & Repair en cours...",
      });

      // Simulation du progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 1000);

      console.log('🚀 Démarrage du scraping Cash & Repair...');
      
      const { data, error } = await supabase.functions.invoke('scrape-cashandrepair', {
        body: {}
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        throw new Error(error.message || 'Erreur lors du scraping');
      }

      setResult(data);

      if (data.success) {
        toast({
          title: "Scraping réussi !",
          description: `${data.stats.inserted} nouveaux réparateurs ajoutés`,
        });
      } else {
        toast({
          title: "Erreur de scraping",
          description: data.error || "Une erreur est survenue",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Erreur scraping:', error);
      setProgress(100);
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      setResult({
        success: false,
        message: 'Échec du scraping',
        stats: { locationsFound: 0, inserted: 0, errors: 1, source: 'cashandrepair' },
        locations: [],
        error: errorMessage
      });

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Scraper Cash & Repair
          </CardTitle>
          <CardDescription>
            Ajouter automatiquement les ateliers Cash & Repair depuis leur site officiel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Source: https://ateliers.cashandrepair.fr
              </p>
              <p className="text-xs text-muted-foreground">
                Utilise Firecrawl pour extraire les données des ateliers
              </p>
            </div>
            <Button 
              onClick={handleStartScraping}
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                'Démarrer'
              )}
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Extraction en cours... {progress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Résultats du Scraping
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {result.stats.locationsFound}
                </div>
                <div className="text-sm text-muted-foreground">Trouvées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result.stats.inserted}
                </div>
                <div className="text-sm text-muted-foreground">Ajoutées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {result.stats.errors}
                </div>
                <div className="text-sm text-muted-foreground">Erreurs</div>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  {result.stats.source}
                </Badge>
              </div>
            </div>

            {/* Message */}
            <div className={`p-3 rounded-lg ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="text-sm font-medium">{result.message}</p>
              {result.error && (
                <p className="text-xs mt-1 opacity-80">{result.error}</p>
              )}
            </div>

            {/* Échantillon des locations */}
            {result.locations && result.locations.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Échantillon des réparateurs trouvés :</h4>
                <div className="space-y-3">
                  {result.locations.slice(0, 3).map((location, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h5 className="font-medium">{location.name}</h5>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{location.address}, {location.city}</span>
                          </div>
                          {location.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{location.phone}</span>
                            </div>
                          )}
                          {location.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{location.email}</span>
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Cash & Repair
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {result.locations.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... et {result.locations.length - 3} autres
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
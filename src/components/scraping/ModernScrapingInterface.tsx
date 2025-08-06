
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Brain, MapPin, Globe, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ModernScrapingInterface = () => {
  const [searchTerm, setSearchTerm] = useState('réparation téléphone');
  const [location, setLocation] = useState('Paris');
  const [source, setSource] = useState('pages_jaunes');
  const [maxResults, setMaxResults] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleScraping = async () => {
    setLoading(true);
    setResults([]);

    try {
      console.log('🚀 Démarrage du scraping moderne:', { searchTerm, location, source, maxResults });

      const { data, error } = await supabase.functions.invoke('modern-scraping', {
        body: {
          searchTerm,
          location,
          source,
          maxResults,
          testMode: false
        }
      });

      if (error) {
        console.error('❌ Erreur Edge Function:', error);
        throw error;
      }

      console.log('✅ Résultat du scraping:', data);

      if (data.success) {
        setResults(data.results || []);
        toast({
          title: "Scraping réussi avec Firecrawl",
          description: `${data.processedCount} réparateurs trouvés et ${data.savedCount} sauvegardés en base`,
        });
      } else {
        throw new Error(data.error || 'Erreur lors du scraping');
      }

    } catch (error: any) {
      console.error('❌ Erreur scraping:', error);
      toast({
        title: "Erreur de scraping",
        description: error.message || "Une erreur est survenue lors du scraping",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Scraping Moderne avec Firecrawl + IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Firecrawl Configuré
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                <Brain className="h-3 w-3 mr-1" />
                Mistral AI Actif
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                <MapPin className="h-3 w-3 mr-1" />
                Nominatim Gratuit
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Terme de recherche</label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="réparation téléphone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ville</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Source</label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pages_jaunes">Pages Jaunes</SelectItem>
                    <SelectItem value="google_maps">Google Maps</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nombre max de résultats</label>
                <Input
                  type="number"
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value) || 10)}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <Button 
              onClick={handleScraping} 
              disabled={loading || !searchTerm || !location}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scraping en cours avec Firecrawl...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Lancer le scraping Firecrawl
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Firecrawl</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Globe className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Scraping web avec Firecrawl</h4>
                <p className="text-sm text-gray-600">
                  Utilise l'API Firecrawl (configurée dans Supabase) pour extraire les données des sites web de manière fiable et structurée.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Classification IA avec Mistral</h4>
                <p className="text-sm text-gray-600">
                  Utilise l'API Mistral (configurée dans Supabase) pour identifier automatiquement les vrais réparateurs de smartphones.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Géocodage Nominatim</h4>
                <p className="text-sm text-gray-600">
                  Service gratuit d'OpenStreetMap pour convertir les adresses en coordonnées GPS précises.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats du scraping ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{result.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        📍 {result.address}, {result.city} ({result.postal_code})
                      </p>
                      {result.phone && (
                        <p className="text-sm text-gray-500 mt-1">
                          📞 {result.phone}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        🔧 Services: {result.services?.join(', ') || 'Réparation générale'}
                      </p>
                      <p className="text-sm text-gray-500">
                        📱 Spécialités: {result.specialties?.join(', ') || 'Tout mobile'}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <Badge className="bg-green-100 text-green-800 mb-2">
                        ✅ Validé par IA
                      </Badge>
                      <div className="text-xs text-gray-500">
                        <p>Lat: {result.lat?.toFixed(4)}</p>
                        <p>Lng: {result.lng?.toFixed(4)}</p>
                        <p>Source: {result.source}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Scraping en cours avec Firecrawl... Veuillez patienter.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModernScrapingInterface;

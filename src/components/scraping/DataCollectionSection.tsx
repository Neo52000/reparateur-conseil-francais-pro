import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Globe, Download, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ScrapingProgressViewer from './ScrapingProgressViewer';
import ResultsPreviewTable from './ResultsPreviewTable';

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  search_keywords: string[];
  scraping_prompts: any;
}

interface DataCollectionSectionProps {
  category: BusinessCategory;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

const DataCollectionSection: React.FC<DataCollectionSectionProps> = ({
  category,
  isLoading,
  onLoadingChange
}) => {
  const { toast } = useToast();
  const [location, setLocation] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [activeCollectionTab, setActiveCollectionTab] = useState('serper');
  const [scrapingInProgress, setScrapingInProgress] = useState(false);
  const [integrating, setIntegrating] = useState(false);

  const generateSerperQuery = () => {
    if (customQuery) return customQuery;
    const baseKeyword = category.search_keywords[0] || category.name;
    return location ? `${baseKeyword} ${location}` : baseKeyword;
  };

  const handleSerperSearch = async () => {
    onLoadingChange(true);
    try {
      const query = generateSerperQuery();
      console.log('🔍 Démarrage recherche Serper avec:', { query, location });
      
      const { data, error } = await supabase.functions.invoke('serper-search', {
        body: {
          query,
          type: 'search',
          location: location || 'France',
          num: 20
        }
      });

      if (error) {
        console.error('❌ Erreur Serper API:', error);
        throw error;
      }
      
      console.log('✅ Réponse Serper reçue:', data);
      const results = data.results || [];
      setResults(results);
      toast({
        title: "Recherche Serper réussie",
        description: `${results.length} résultats trouvés`
      });
    } catch (error: any) {
      console.error('Erreur Serper:', error);
      toast({
        title: "Erreur Serper",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      onLoadingChange(false);
    }
  };

  const handleFirecrawlScraping = async () => {
    onLoadingChange(true);
    setScrapingInProgress(true);
    try {
      const searchTerm = category.search_keywords[0] || category.name;
      const { data, error } = await supabase.functions.invoke('modern-scraping', {
        body: {
          searchTerm: searchTerm,
          location: location || 'France',
          source: 'pages_jaunes',
          maxResults: 20,
          testMode: true
        }
      });

      if (error) throw error;
      
      if (data?.results && data.results.length > 0) {
        setResults(data.results);
        toast({
          title: "Scraping Firecrawl réussi",
          description: `${data.results.length} résultats trouvés`
        });
      } else {
        toast({
          title: "Scraping terminé",
          description: "Aucun résultat trouvé pour cette recherche"
        });
      }
    } catch (error: any) {
      console.error('Erreur Firecrawl:', error);
      toast({
        title: "Erreur Firecrawl",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      onLoadingChange(false);
      setScrapingInProgress(false);
    }
  };

  const handleIntegrateToDatabase = async (selectedResults: any[]) => {
    setIntegrating(true);
    try {
      const { data, error } = await supabase.functions.invoke('modern-scraping', {
        body: {
          searchTerm: category.search_keywords[0] || category.name,
          location: location || 'France',
          source: 'integration',
          maxResults: selectedResults.length,
          testMode: false,
          preProcessedResults: selectedResults
        }
      });

      if (error) throw error;
      
      toast({
        title: "Intégration réussie",
        description: `${selectedResults.length} réparateurs ajoutés à la base de données`
      });
      
      // Nettoyer les résultats après intégration
      setResults([]);
    } catch (error: any) {
      console.error('Erreur intégration:', error);
      toast({
        title: "Erreur d'intégration",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIntegrating(false);
    }
  };

  const exportResults = () => {
    if (results.length === 0) {
      toast({
        title: "Aucun résultat",
        description: "Pas de données à exporter",
        variant: "destructive"
      });
      return;
    }

    const csv = [
      ['Titre', 'URL', 'Description', 'Position'].join(','),
      ...results.map(r => [
        `"${r.title || ''}"`,
        `"${r.link || ''}"`,
        `"${r.snippet || ''}"`,
        r.position || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultats-${category.name.toLowerCase()}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Paramètres de recherche */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Localisation</Label>
          <Input
            id="location"
            placeholder="Ex: Paris, Lyon, France..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="customQuery">Requête personnalisée (optionnel)</Label>
          <Input
            id="customQuery"
            placeholder={`Ex: ${category.search_keywords[0] || category.name}`}
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {/* Méthodes de collecte */}
      <Tabs value={activeCollectionTab} onValueChange={setActiveCollectionTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="serper" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Serper Search</span>
          </TabsTrigger>
          <TabsTrigger value="firecrawl" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Firecrawl Scraping</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="serper" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Search className="h-4 w-4 mr-2 text-admin-blue" />
                Recherche Google via Serper
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-admin-blue-light rounded-lg">
                <p className="text-sm text-admin-blue">
                  <strong>Requête générée:</strong> {generateSerperQuery()}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSerperSearch}
                  disabled={isLoading}
                  className="bg-admin-blue hover:bg-admin-blue/90"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Lancer la recherche
                </Button>
                
                {results.length > 0 && (
                  <Button 
                    onClick={exportResults}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter CSV ({results.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="firecrawl" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Globe className="h-4 w-4 mr-2 text-admin-green" />
                Scraping Web via Firecrawl
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-admin-green-light rounded-lg">
                <p className="text-sm text-admin-green">
                  <strong>Scraping ciblé:</strong> {category.description}
                </p>
              </div>
              
              <Button 
                onClick={handleFirecrawlScraping}
                disabled={isLoading}
                className="bg-admin-green hover:bg-admin-green/90"
              >
                <Globe className="h-4 w-4 mr-2" />
                Démarrer le scraping
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Visualisation du scraping en temps réel */}
      <ScrapingProgressViewer 
        isActive={scrapingInProgress}
        currentStep="scraping"
      />

      {/* Prévisualisation et validation des résultats */}
      <ResultsPreviewTable
        results={results}
        onResultsChange={setResults}
        onIntegrateToDatabase={handleIntegrateToDatabase}
        isIntegrating={integrating}
      />
    </div>
  );
};

export default DataCollectionSection;
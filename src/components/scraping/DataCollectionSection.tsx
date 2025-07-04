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

  const generateSerperQuery = () => {
    if (customQuery) return customQuery;
    const baseKeyword = category.search_keywords[0] || category.name;
    return location ? `${baseKeyword} ${location}` : baseKeyword;
  };

  const handleSerperSearch = async () => {
    onLoadingChange(true);
    try {
      const query = generateSerperQuery();
      const { data, error } = await supabase.functions.invoke('serper-search', {
        body: {
          query,
          searchType: 'search',
          location: location || 'France',
          num: 20
        }
      });

      if (error) throw error;
      
      setResults(data.organic || []);
      toast({
        title: "Recherche Serper réussie",
        description: `${data.organic?.length || 0} résultats trouvés`
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
    try {
      const { data, error } = await supabase.functions.invoke('modern-scraping', {
        body: {
          mode: 'targeted',
          category: category.name,
          location: location || 'France',
          limit: 50
        }
      });

      if (error) throw error;
      
      toast({
        title: "Scraping Firecrawl lancé",
        description: "Le processus de scraping a été démarré"
      });
    } catch (error: any) {
      console.error('Erreur Firecrawl:', error);
      toast({
        title: "Erreur Firecrawl",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      onLoadingChange(false);
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

      {/* Résultats */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Résultats de recherche</span>
              <Badge variant="secondary">{results.length} résultats</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.slice(0, 10).map((result, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {result.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {result.snippet}
                      </p>
                      <p className="text-xs text-primary mt-1 truncate">
                        {result.link}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      #{result.position}
                    </Badge>
                  </div>
                </div>
              ))}
              {results.length > 10 && (
                <p className="text-center text-sm text-muted-foreground">
                  ... et {results.length - 10} autres résultats (voir export CSV)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataCollectionSection;
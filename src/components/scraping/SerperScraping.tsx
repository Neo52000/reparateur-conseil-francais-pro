import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, RefreshCw, Target, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
  date?: string;
  thumbnail?: string;
}

const SerperScraping: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SerperResult[]>([]);
  const [searchParams, setSearchParams] = useState({
    query: '',
    searchType: 'search',
    location: '',
    country: 'fr',
    language: 'fr',
    num: 10
  });

  const searchTypes = [
    { value: 'search', label: 'Web Search' },
    { value: 'images', label: 'Images' },
    { value: 'news', label: 'News' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'videos', label: 'Videos' },
    { value: 'places', label: 'Local/Places' }
  ];

  const handleSearch = async () => {
    if (!searchParams.query.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une requête de recherche",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 Démarrage recherche Serper:', searchParams);

      const { data, error } = await supabase.functions.invoke('serper-search', {
        body: {
          query: searchParams.query,
          type: searchParams.searchType,
          location: searchParams.location,
          country: searchParams.country,
          lang: searchParams.language,
          num: searchParams.num
        }
      });

      if (error) {
        console.error('❌ Erreur Serper:', error);
        throw new Error(error.message);
      }

      console.log('✅ Résultats Serper reçus:', data);
      setResults(data.results || []);

      toast({
        title: "Recherche terminée",
        description: `${data.results?.length || 0} résultats trouvés`
      });

    } catch (error: any) {
      console.error('💥 Erreur recherche Serper:', error);
      toast({
        title: "Erreur de recherche",
        description: error.message || "Impossible d'effectuer la recherche",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCsv = () => {
    if (results.length === 0) {
      toast({
        title: "Aucune donnée",
        description: "Aucun résultat à exporter",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Position', 'Title', 'URL', 'Snippet', 'Date'];
    const csvContent = [
      headers.join(','),
      ...results.map(result => [
        result.position,
        `"${result.title.replace(/"/g, '""')}"`,
        result.link,
        `"${result.snippet.replace(/"/g, '""')}"`,
        result.date || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `serper-results-${Date.now()}.csv`;
    link.click();

    toast({
      title: "Export réussi",
      description: "Les résultats ont été exportés en CSV"
    });
  };

  return (
    <div className="space-y-6">
      {/* Configuration de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2 text-blue-600" />
            Configuration de la Recherche Serper
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="query">Requête de recherche *</Label>
              <Textarea
                id="query"
                placeholder="Exemple: réparateur smartphone Paris"
                value={searchParams.query}
                onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="searchType">Type de recherche</Label>
                <Select
                  value={searchParams.searchType}
                  onValueChange={(value) => setSearchParams(prev => ({ ...prev, searchType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {searchTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localisation (optionnel)</Label>
                <Input
                  id="location"
                  placeholder="Paris, France"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Select
                value={searchParams.country}
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="us">États-Unis</SelectItem>
                  <SelectItem value="gb">Royaume-Uni</SelectItem>
                  <SelectItem value="de">Allemagne</SelectItem>
                  <SelectItem value="es">Espagne</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Langue</Label>
              <Select
                value={searchParams.language}
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="num">Nombre de résultats</Label>
              <Select
                value={searchParams.num.toString()}
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, num: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSearch} 
              disabled={isLoading || !searchParams.query.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Lancer la recherche
                </>
              )}
            </Button>

            {results.length > 0 && (
              <Button variant="outline" onClick={exportToCsv}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Pos.</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-center">{result.position}</TableCell>
                    <TableCell className="font-medium">
                      <div className="max-w-xs truncate" title={result.title}>
                        {result.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={result.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline max-w-xs truncate block"
                        title={result.link}
                      >
                        {result.link}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-sm text-sm text-muted-foreground">
                        {result.snippet}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(result.link, '_blank')}
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* État vide */}
      {!isLoading && results.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
            <p className="text-muted-foreground">
              Lancez une recherche pour voir les résultats ici
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SerperScraping;
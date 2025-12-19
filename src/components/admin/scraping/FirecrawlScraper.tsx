import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { 
  Search, Download, Trash2, MapPin, Phone, 
  Loader2, Settings2, Building2, CheckCircle, Database, Flame
} from 'lucide-react';

// Types
interface ScrapedRepairer {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  description?: string;
}

// Default hardcoded services
const DEFAULT_SERVICES = ["Réparation écran", "Changement batterie", "Diagnostic"];

const FirecrawlScraper: React.FC = () => {
  const [city, setCity] = useState('Paris');
  const [postalCode, setPostalCode] = useState('75001');
  const [query, setQuery] = useState('Réparation téléphone');
  const [results, setResults] = useState<ScrapedRepairer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const { toast } = useToast();

  // Parse repairers from markdown content
  const parseRepairersFromMarkdown = (markdown: string, sourceUrl: string): ScrapedRepairer[] => {
    const repairers: ScrapedRepairer[] = [];
    
    // Try to extract business names and addresses from markdown
    const lines = markdown.split('\n');
    let currentRepairer: Partial<ScrapedRepairer> = {};
    
    for (const line of lines) {
      // Look for business names (usually in headers or bold)
      const nameMatch = line.match(/^#+\s*(.+)|^\*\*(.+)\*\*/);
      if (nameMatch) {
        if (currentRepairer.name) {
          repairers.push({
            id: crypto.randomUUID(),
            name: currentRepairer.name,
            address: currentRepairer.address || '',
            phone: currentRepairer.phone,
            website: currentRepairer.website,
            description: currentRepairer.description
          });
        }
        currentRepairer = { name: nameMatch[1] || nameMatch[2] };
      }
      
      // Look for phone numbers
      const phoneMatch = line.match(/(?:Tel|Tél|Phone|☎|📞)?:?\s*([0-9\s\.]{10,})/i);
      if (phoneMatch && currentRepairer.name) {
        currentRepairer.phone = phoneMatch[1].replace(/\D/g, '');
      }
      
      // Look for addresses
      const addressMatch = line.match(/(\d{1,3}[^,]+,?\s*\d{5}\s*[A-Za-zÀ-ÿ\s]+)/);
      if (addressMatch && currentRepairer.name) {
        currentRepairer.address = addressMatch[1].trim();
      }
    }
    
    // Add last repairer
    if (currentRepairer.name) {
      repairers.push({
        id: crypto.randomUUID(),
        name: currentRepairer.name,
        address: currentRepairer.address || '',
        phone: currentRepairer.phone,
        website: currentRepairer.website,
        description: currentRepairer.description
      });
    }
    
    return repairers;
  };

  // Start scraping with Firecrawl
  const startScraping = async () => {
    if (!city && !postalCode) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une ville ou un code postal",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResults([]);
    setProgress(0);
    setProgressMessage('Recherche avec Firecrawl...');

    try {
      // Search for repairers using Firecrawl
      const searchQuery = `${query} ${city} ${postalCode} France`;
      
      setProgress(20);
      setProgressMessage('Recherche en cours...');
      
      const searchResult = await firecrawlApi.search(searchQuery, {
        limit: 20,
        lang: 'fr',
        country: 'FR',
        scrapeOptions: { formats: ['markdown'] }
      });

      if (!searchResult.success) {
        throw new Error(searchResult.error || 'Erreur lors de la recherche');
      }

      setProgress(50);
      setProgressMessage('Analyse des résultats...');

      const allRepairers: ScrapedRepairer[] = [];
      const searchData = searchResult.data || [];
      
      for (let i = 0; i < searchData.length; i++) {
        const item = searchData[i];
        setProgress(50 + Math.round((i / searchData.length) * 40));
        
        if (item.markdown) {
          const parsed = parseRepairersFromMarkdown(item.markdown, item.url);
          allRepairers.push(...parsed);
        }
        
        // Also try to extract from title/description
        if (item.title && !allRepairers.find(r => r.name === item.title)) {
          allRepairers.push({
            id: crypto.randomUUID(),
            name: item.title.split(' - ')[0].split(' | ')[0].trim(),
            address: city + ' ' + postalCode,
            phone: undefined,
            website: item.url,
            description: item.description
          });
        }
      }

      // Deduplicate by name
      const uniqueRepairers = allRepairers.filter((r, i, arr) => 
        arr.findIndex(x => x.name.toLowerCase() === r.name.toLowerCase()) === i
      );

      setResults(uniqueRepairers);
      setProgress(100);
      setProgressMessage('Terminé!');
      
      toast({
        title: "Scraping terminé",
        description: `${uniqueRepairers.length} réparateurs trouvés`,
      });
    } catch (error: any) {
      console.error('Scraping error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du scraping. Vérifiez que le connecteur Firecrawl est activé.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Import directly to database
  const importToDatabase = async () => {
    if (results.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucun résultat à importer",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    let imported = 0;
    let errors = 0;

    try {
      for (const repairer of results) {
        if (!repairer.name) continue;
        
        const repairerData = {
          name: repairer.name,
          address: repairer.address || `${city} ${postalCode}`,
          city: city || 'France',
          postal_code: postalCode || '00000',
          phone: repairer.phone?.replace(/\D/g, '').replace(/^33/, '0') || null,
          services: DEFAULT_SERVICES,
          description: repairer.description || `Réparateur à ${city}.`,
          website: repairer.website || null,
          is_verified: false,
          source: 'firecrawl'
        };

        const { error } = await supabase
          .from('repairers')
          .upsert(repairerData, { onConflict: 'name' });

        if (error) {
          console.error('Insert error:', error);
          errors++;
        } else {
          imported++;
        }
      }

      toast({
        title: "Import terminé",
        description: `${imported} réparateurs importés. ${errors > 0 ? `${errors} erreurs.` : ''}`,
      });

      // Trigger geocoding
      if (imported > 0) {
        toast({
          title: "Géocodage",
          description: "Lancement du géocodage automatique...",
        });
        
        await supabase.functions.invoke('geocode-repairers');
      }

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'import",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Remove a result
  const removeResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  // Export to JSON
  const exportToJSON = () => {
    if (results.length === 0) return;

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reparateurs-firecrawl-${city}-${postalCode}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `${results.length} réparateurs exportés`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Firecrawl Scraper
          </h2>
          <p className="text-sm text-muted-foreground">
            Recherche web intelligente avec Firecrawl AI
          </p>
        </div>
        
        {results.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={exportToJSON} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              JSON
            </Button>
            <Button onClick={importToDatabase} disabled={isImporting} size="sm" className="gap-2">
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Importer
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings2 className="h-4 w-4" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fc-city">Ville</Label>
              <Input 
                id="fc-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="ex: Paris"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fc-postalCode">Code Postal</Label>
              <Input 
                id="fc-postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="ex: 75001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fc-query">Requête</Label>
              <Input 
                id="fc-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Réparation téléphone"
              />
            </div>

            <Button 
              onClick={startScraping} 
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Flame className="h-4 w-4" />
                  Lancer Firecrawl
                </>
              )}
            </Button>

            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {progressMessage}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Résultats ({results.length})
              </CardTitle>
              {results.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {results.length} trouvés
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Flame className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Lancez une recherche avec Firecrawl</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {results.map((repairer) => (
                    <div 
                      key={repairer.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                    >
                      <div className="flex-1 space-y-1">
                        <span className="font-medium text-sm text-foreground">
                          {repairer.name}
                        </span>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {repairer.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {repairer.address}
                            </span>
                          )}
                          {repairer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {repairer.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeResult(repairer.id)}
                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FirecrawlScraper;

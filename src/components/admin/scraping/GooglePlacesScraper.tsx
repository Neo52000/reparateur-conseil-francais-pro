import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, Download, Trash2, MapPin, Phone, Star, Globe, 
  Loader2, Settings2, Building2, CheckCircle, Database,
  Sparkles, Filter, Map
} from 'lucide-react';
import { REGIONS } from '@/components/scraping/controls/scrapingConstants';

// Types
interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
}

interface RepairerExport {
  name: string;
  address: string;
  postal_code: string;
  city: string;
  phone: string;
  services: string[];
  description: string;
}

// Suggested queries for better precision
const SUGGESTED_QUERIES = [
  { label: "📱 Réparation smartphone", value: "réparation smartphone mobile" },
  { label: "📱 Réparation iPhone", value: "réparation iPhone Apple" },
  { label: "🔧 Réparation écran mobile", value: "réparation écran téléphone portable" },
  { label: "⚡ Micro-soudure téléphone", value: "micro soudure téléphone mobile" },
  { label: "🔋 Changement batterie", value: "changement batterie smartphone" },
  { label: "📲 Déblocage téléphone", value: "déblocage réparation téléphone" },
];

// Keywords to exclude from results (computer repair, etc.)
const EXCLUSION_KEYWORDS = [
  "informatique", "ordinateur", "pc", "imprimante", "computer",
  "electroménager", "électroménager", "automobile", "auto", "voiture",
  "dépannage informatique", "assistance informatique", "réparation pc",
  "laptop", "macbook pro", "réparation ordinateur"
];

// Build departments map from centralized REGIONS constant
const getDepartmentInfo = (code: string) => {
  for (const region of REGIONS) {
    const dept = region.departments.find(d => d.code === code);
    if (dept) {
      return { name: dept.name, region: region.name };
    }
  }
  return null;
};

// Get cities for a department (default cities based on department name)
const getDepartmentCities = (code: string): string[] => {
  const dept = getDepartmentInfo(code);
  if (!dept) return [];
  // For now, just use the department name as main city
  // This can be enhanced later with a proper cities database
  return [dept.name];
};

// Default hardcoded services
const DEFAULT_SERVICES = ["Réparation écran", "Changement batterie", "Diagnostic"];

type SearchMode = 'city' | 'department';

const GooglePlacesScraper: React.FC = () => {
  // State
  const [apiKey, setApiKey] = useState('AIzaSyCC_6zU1EIPQ31oZnhLGD4MzU-Ms6axxC0');
  const [searchMode, setSearchMode] = useState<SearchMode>('city');
  const [city, setCity] = useState('Paris');
  const [postalCode, setPostalCode] = useState('75001');
  const [selectedDepartment, setSelectedDepartment] = useState('75');
  const [query, setQuery] = useState('Réparation téléphone');
  const [enableExclusionFilter, setEnableExclusionFilter] = useState(true);
  const [results, setResults] = useState<GooglePlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [excludedCount, setExcludedCount] = useState(0);
  const { toast } = useToast();

  // Check if result matches exclusion keywords
  const shouldExclude = (place: GooglePlace): boolean => {
    if (!enableExclusionFilter) return false;
    const searchText = `${place.name} ${place.formatted_address}`.toLowerCase();
    return EXCLUSION_KEYWORDS.some(keyword => searchText.includes(keyword.toLowerCase()));
  };

  // Clean shop name
  const cleanName = (name: string): string => {
    return name
      .replace(/\s*-\s*.*$/, '')
      .replace(/\s*\|.*$/, '')
      .replace(/\([^)]*\)/g, '')
      .trim();
  };

  // Format phone number
  const formatPhone = (phone?: string): string => {
    if (!phone) return '';
    return phone.replace(/\D/g, '').replace(/^33/, '0').replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  };

  // Fetch place details via Edge Function
  const fetchPlaceDetails = async (placeId: string): Promise<GooglePlace | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: { action: 'placeDetails', placeId, apiKey }
      });
      
      if (error) throw error;
      
      if (data.result) {
        return {
          place_id: placeId,
          name: data.result.name,
          formatted_address: data.result.formatted_address,
          formatted_phone_number: data.result.formatted_phone_number,
          rating: data.result.rating,
          user_ratings_total: data.result.user_ratings_total,
          website: data.result.website
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  };

  // Search for a single location
  const searchLocation = async (location: string): Promise<GooglePlace[]> => {
    const searchQuery = `${query} ${location}`.trim();
    
    const { data: searchData, error: searchError } = await supabase.functions.invoke('google-places-proxy', {
      body: { action: 'textSearch', query: searchQuery, apiKey }
    });
    
    if (searchError) {
      console.error('Search error for', location, searchError);
      return [];
    }
    
    if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
      console.error('Google Places error:', searchData.status);
      return [];
    }

    const places = searchData.results || [];
    const detailedPlaces: GooglePlace[] = [];
    
    for (const place of places) {
      const details = await fetchPlaceDetails(place.place_id);
      if (details && details.formatted_phone_number) {
        detailedPlaces.push(details);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return detailedPlaces;
  };

  // Start scraping
  const startScraping = async () => {
    if (searchMode === 'city' && !city && !postalCode) {
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
    setExcludedCount(0);
    setProgressMessage('Recherche en cours...');

    try {
      let allPlaces: GooglePlace[] = [];
      
      if (searchMode === 'department') {
        // Department mode: search in main city of department
        const deptInfo = getDepartmentInfo(selectedDepartment);
        if (!deptInfo) {
          throw new Error('Département non trouvé');
        }
        
        // Search using department name as location
        setProgress(50);
        setProgressMessage(`Recherche dans ${deptInfo.name}...`);
        
        const cityResults = await searchLocation(deptInfo.name);
        allPlaces = [...allPlaces, ...cityResults];
      } else {
        // City mode: single search
        const searchQuery = `${query} ${city} ${postalCode}`.trim();
        
        const { data: searchData, error: searchError } = await supabase.functions.invoke('google-places-proxy', {
          body: { action: 'textSearch', query: searchQuery, apiKey }
        });
        
        if (searchError) {
          throw new Error(`Erreur API: ${searchError.message}`);
        }
        
        if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
          throw new Error(`Erreur Google Places: ${searchData.status} - ${searchData.error_message || 'Erreur inconnue'}`);
        }

        const places = searchData.results || [];
        const totalPlaces = places.length;
        
        if (totalPlaces === 0) {
          toast({
            title: "Aucun résultat",
            description: "Aucune boutique trouvée pour cette recherche",
            variant: "default"
          });
          setIsLoading(false);
          return;
        }

        setProgressMessage(`${totalPlaces} boutiques trouvées. Récupération des détails...`);

        for (let i = 0; i < totalPlaces; i++) {
          const place = places[i];
          setProgress(Math.round(((i + 1) / totalPlaces) * 100));
          setProgressMessage(`Récupération ${i + 1}/${totalPlaces}: ${place.name}`);
          
          const details = await fetchPlaceDetails(place.place_id);
          
          if (details && details.formatted_phone_number) {
            allPlaces.push(details);
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // Deduplicate by place_id
      const uniquePlaces = allPlaces.filter((place, index, self) => 
        index === self.findIndex(p => p.place_id === place.place_id)
      );

      // Apply exclusion filter
      let filteredPlaces = uniquePlaces;
      let excluded = 0;
      
      if (enableExclusionFilter) {
        filteredPlaces = uniquePlaces.filter(place => {
          if (shouldExclude(place)) {
            excluded++;
            return false;
          }
          return true;
        });
        setExcludedCount(excluded);
      }

      setResults(filteredPlaces);
      setProgress(100);
      setProgressMessage('Terminé!');
      
      toast({
        title: "Scraping terminé",
        description: `${filteredPlaces.length} boutiques trouvées${excluded > 0 ? ` (${excluded} exclues par le filtre)` : ''}`,
      });
    } catch (error: any) {
      console.error('Scraping error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du scraping",
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
      for (const place of results) {
        // Extract city from address
        const addressParts = place.formatted_address.split(',');
        const cityFromAddress = addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : city || 'France';
        const postalMatch = cityFromAddress.match(/\d{5}/);
        const extractedPostal = postalMatch ? postalMatch[0] : postalCode || '00000';
        
        const repairerData = {
          name: cleanName(place.name),
          address: place.formatted_address,
          city: cityFromAddress.replace(/\d{5}/, '').trim() || city || 'France',
          postal_code: extractedPostal,
          phone: formatPhone(place.formatted_phone_number),
          services: DEFAULT_SERVICES,
          description: `Expert en réparation mobile. Note: ${place.rating || 'N/A'}/5 (${place.user_ratings_total || 0} avis).`,
          website: place.website || null,
          is_verified: false,
          source: 'google_places'
        };

        const { error } = await supabase
          .from('repairers')
          .upsert(repairerData, { onConflict: 'phone' });

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
        variant: errors > 0 ? "default" : "default"
      });

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
  const removeResult = (placeId: string) => {
    setResults(prev => prev.filter(r => r.place_id !== placeId));
  };

  // Export to JSON
  const exportToJSON = () => {
    if (results.length === 0) return;

    const exportData: RepairerExport[] = results.map(place => ({
      name: cleanName(place.name),
      address: place.formatted_address,
      postal_code: postalCode || '00000',
      city: city || 'France',
      phone: formatPhone(place.formatted_phone_number),
      services: DEFAULT_SERVICES,
      description: `Expert en réparation mobile. Note: ${place.rating || 'N/A'}/5 (${place.user_ratings_total || 0} avis).`
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reparateurs-${searchMode === 'department' ? getDepartmentInfo(selectedDepartment)?.name : city}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `${exportData.length} réparateurs exportés`,
    });
  };

  // Render stars
  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-muted-foreground">N/A</span>;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-3 w-3 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} 
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Google Places Scraper
          </h1>
          <p className="text-muted-foreground">
            Recherche par ville ou département avec filtres intelligents
          </p>
        </div>
        
        {results.length > 0 && (
          <div className="flex gap-2">
            <Button onClick={exportToJSON} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Télécharger JSON
            </Button>
            <Button onClick={importToDatabase} disabled={isImporting} className="gap-2">
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Importer en base
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Configuration */}
        <Card className="lg:col-span-1 bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings2 className="h-5 w-5" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">Clé API Google</Label>
              <Input 
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="font-mono text-xs"
              />
            </div>

            {/* Search Mode Toggle */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Mode de recherche
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={searchMode === 'city' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchMode('city')}
                  className="flex-1"
                >
                  Ville
                </Button>
                <Button
                  variant={searchMode === 'department' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchMode('department')}
                  className="flex-1"
                >
                  Département
                </Button>
              </div>
            </div>

            {searchMode === 'city' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input 
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="ex: Paris"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code Postal</Label>
                  <Input 
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="ex: 75001"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Département</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {REGIONS.map((region) => (
                      <React.Fragment key={region.name}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                          {region.name}
                        </div>
                        {region.departments.map((dept) => (
                          <SelectItem key={dept.code} value={dept.code}>
                            {dept.code} - {dept.name}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Recherche dans {getDepartmentInfo(selectedDepartment)?.name || 'le département'}
                </p>
              </div>
            )}

            {/* Query Input */}
            <div className="space-y-2">
              <Label htmlFor="query">Requête de recherche</Label>
              <Input 
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Réparation téléphone"
              />
            </div>

            {/* Suggested Queries */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Suggestions précises
              </Label>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_QUERIES.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => setQuery(suggestion.value)}
                  >
                    {suggestion.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Exclusion Filter Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <Label htmlFor="exclusionFilter" className="text-sm cursor-pointer">
                  Exclure informatique
                </Label>
              </div>
              <Switch
                id="exclusionFilter"
                checked={enableExclusionFilter}
                onCheckedChange={setEnableExclusionFilter}
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
                  <Search className="h-4 w-4" />
                  Lancer le Scraping
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

        {/* Results Table */}
        <Card className="lg:col-span-3 bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Résultats ({results.length})
              </CardTitle>
              <div className="flex gap-2">
                {excludedCount > 0 && (
                  <Badge variant="outline" className="gap-1 text-orange-600 border-orange-300">
                    <Filter className="h-3 w-3" />
                    {excludedCount} exclues
                  </Badge>
                )}
                {results.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {results.length} avec téléphone
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription>
              Prévisualisez et nettoyez les résultats avant import
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun résultat. Lancez une recherche pour commencer.</p>
                <p className="text-xs mt-2">
                  💡 Conseil: Utilisez les suggestions pour des résultats plus précis
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {results.map((place) => (
                    <div 
                      key={place.place_id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {cleanName(place.name)}
                          </span>
                          {renderStars(place.rating)}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {place.formatted_address}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {formatPhone(place.formatted_phone_number)}
                          </span>
                          {place.website && (
                            <a 
                              href={place.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <Globe className="h-3 w-3" />
                              Site web
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeResult(place.place_id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
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

export default GooglePlacesScraper;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Clock, 
  DollarSign, 
  MapPin, 
  Star,
  Camera,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApifyService, ApifyActor, ApifyJobResult } from '@/services/scraping/ApifyService';

interface ApifyCollectionTabProps {
  category: any;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

const ApifyCollectionTab: React.FC<ApifyCollectionTabProps> = ({
  category,
  isLoading,
  onLoadingChange
}) => {
  const { toast } = useToast();
  const [selectedActor, setSelectedActor] = useState<ApifyActor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [maxResults, setMaxResults] = useState(50);
  const [includeReviews, setIncludeReviews] = useState(false);
  const [includePhotos, setIncludePhotos] = useState(false);
  const [currentJob, setCurrentJob] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<ApifyJobResult | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const actors = ApifyService.getAvailableActors();
  const estimatedCost = selectedActor ? ApifyService.estimateCost(selectedActor.id, maxResults) : 0;

  useEffect(() => {
    if (category) {
      setSearchTerm(category.search_keywords?.[0] || '');
    }
  }, [category]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentJob && jobStatus?.status === 'running') {
      interval = setInterval(async () => {
        try {
          const status = await ApifyService.getJobStatus(currentJob);
          setJobStatus(status);
          
          if (status.status === 'succeeded') {
            const jobResults = await ApifyService.getJobResults(currentJob);
            const transformedResults = ApifyService.transformApifyDataToScrapingResult(
              jobResults, 
              selectedActor?.category || 'unknown'
            );
            setResults(transformedResults);
            onLoadingChange(false);
            clearInterval(interval);
            
            toast({
              title: "Scraping Apify terminé",
              description: `${transformedResults.length} résultats récupérés`
            });
          } else if (status.status === 'failed') {
            onLoadingChange(false);
            clearInterval(interval);
            toast({
              title: "Erreur Apify",
              description: status.error || "Le job a échoué",
              variant: "destructive"
            });
          }
        } catch (error: any) {
          console.error('Erreur polling status:', error);
        }
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentJob, jobStatus, selectedActor, onLoadingChange, toast]);

  const handleStartScraping = async () => {
    if (!selectedActor || !searchTerm || !location) {
      toast({
        title: "Paramètres manquants",
        description: "Veuillez sélectionner un acteur, un terme de recherche et une localisation",
        variant: "destructive"
      });
      return;
    }

    try {
      onLoadingChange(true);
      setResults([]);
      
      const jobId = await ApifyService.startScrapingJob({
        actorId: selectedActor.id,
        searchTerm,
        location,
        maxResults,
        includeReviews,
        includePhotos
      });
      
      setCurrentJob(jobId);
      setJobStatus({ id: jobId, status: 'running', data: [], usage: { computeUnits: 0, datasetWrites: 0, proxyUsage: 0 } });
      
      toast({
        title: "Job Apify démarré",
        description: `Job ID: ${jobId.substring(0, 8)}...`
      });
      
    } catch (error: any) {
      console.error('Erreur démarrage Apify:', error);
      onLoadingChange(false);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Sélection de l'acteur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Play className="h-5 w-5 mr-2 text-primary" />
            Sélection de l'Acteur Apify
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actors.map((actor) => (
              <Card 
                key={actor.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedActor?.id === actor.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedActor(actor)}
              >
                <CardContent className="p-4">
                  <h4 className="font-medium text-sm mb-2">{actor.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{actor.description}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {actor.category.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs font-medium">
                      {actor.estimatedCost}¢/100
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {actor.fields.slice(0, 3).map((field) => (
                      <Badge key={field} variant="secondary" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                    {actor.fields.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{actor.fields.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedActor && (
        <>
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Scraping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="searchTerm">Terme de recherche</Label>
                  <Input
                    id="searchTerm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="réparation smartphone"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Paris, France"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxResults">Nombre maximum de résultats</Label>
                <Select value={maxResults.toString()} onValueChange={(v) => setMaxResults(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 résultats</SelectItem>
                    <SelectItem value="50">50 résultats</SelectItem>
                    <SelectItem value="100">100 résultats</SelectItem>
                    <SelectItem value="200">200 résultats</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includeReviews"
                    checked={includeReviews}
                    onCheckedChange={setIncludeReviews}
                  />
                  <Label htmlFor="includeReviews" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Inclure avis
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="includePhotos"
                    checked={includePhotos}
                    onCheckedChange={setIncludePhotos}
                  />
                  <Label htmlFor="includePhotos" className="flex items-center">
                    <Camera className="h-4 w-4 mr-1" />
                    Inclure photos
                  </Label>
                </div>
              </div>

              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  Coût estimé: <strong>{estimatedCost}¢</strong> 
                  {estimatedCost > 10 && " (coût élevé)"}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={handleStartScraping}
                disabled={isLoading || !searchTerm || !location}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scraping en cours...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Démarrer le Scraping Apify
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Statut du job */}
          {jobStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Statut du Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  {jobStatus.status === 'running' && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      En cours
                    </Badge>
                  )}
                  {jobStatus.status === 'succeeded' && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Terminé
                    </Badge>
                  )}
                  {jobStatus.status === 'failed' && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Échec
                    </Badge>
                  )}
                  
                  <span className="text-sm text-muted-foreground">
                    Job ID: {currentJob?.substring(0, 8)}...
                  </span>
                </div>

                {jobStatus.usage && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Compute Units:</span>
                      <span className="ml-2 font-medium">{jobStatus.usage.computeUnits}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dataset Writes:</span>
                      <span className="ml-2 font-medium">{jobStatus.usage.datasetWrites}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Proxy Usage:</span>
                      <span className="ml-2 font-medium">{jobStatus.usage.proxyUsage}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Résultats */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Résultats ({results.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.slice(0, 10).map((result, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{result.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          Score: {result.data_quality_score}%
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        {result.address && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {result.address}
                          </div>
                        )}
                        {result.rating > 0 && (
                          <div className="flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            {result.rating}/5 ({result.reviews_count} avis)
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {results.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground">
                      ... et {results.length - 10} autres résultats
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ApifyCollectionTab;
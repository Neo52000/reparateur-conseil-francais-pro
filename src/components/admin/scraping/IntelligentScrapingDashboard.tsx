import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Brain, Search, CheckCircle, XCircle, Clock, MapPin, Phone, Star, Globe, AlertCircle, Settings } from 'lucide-react';
import { IntelligentScrapingService, ScrapingTarget, ScrapingSuggestion } from '@/services/scraping/IntelligentScrapingService';

const IntelligentScrapingDashboard = () => {
  const { toast } = useToast();
  const scrapingService = new IntelligentScrapingService();
  
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [suggestions, setSuggestions] = useState<ScrapingSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  // Scraping form state
  const [scrapingForm, setScrapingForm] = useState<ScrapingTarget>({
    city: '',
    category: 'smartphone',
    source: 'google_maps',
    maxResults: 20
  });

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const data = await scrapingService.getSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleStartScraping = async () => {
    if (!scrapingForm.city.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une ville",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setIsScrapingActive(true);
    
    try {
      toast({
        title: "🔍 Scraping intelligent lancé",
        description: `Recherche de réparateurs à ${scrapingForm.city}...`
      });

      const repairers = await scrapingService.scrapeRepairers(scrapingForm);
      
      if (repairers.length > 0) {
        await scrapingService.saveSuggestions(repairers);
        await loadSuggestions();
        
        toast({
          title: "✅ Scraping terminé",
          description: `${repairers.length} réparateurs détectés et ajoutés aux suggestions`
        });
      } else {
        toast({
          title: "ℹ️ Aucun résultat",
          description: "Aucun réparateur trouvé avec les critères spécifiés",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Scraping failed:', error);
      toast({
        title: "❌ Erreur de scraping",
        description: error.message || "Une erreur est survenue lors du scraping",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsScrapingActive(false);
    }
  };

  const handleApproveSuggestion = async (id: string) => {
    try {
      await scrapingService.approveSuggestion(id);
      await loadSuggestions();
      toast({
        title: "✅ Suggestion approuvée",
        description: "Le réparateur a été ajouté à la base de données"
      });
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible d'approuver la suggestion",
        variant: "destructive"
      });
    }
  };

  const handleRejectSuggestion = async (id: string) => {
    try {
      await scrapingService.rejectSuggestion(id, "Rejeté manuellement");
      await loadSuggestions();
      toast({
        title: "❌ Suggestion rejetée",
        description: "La suggestion a été marquée comme rejetée"
      });
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de rejeter la suggestion",
        variant: "destructive"
      });
    }
  };

  const handleRunDiagnostics = async () => {
    setLoading(true);
    try {
      const results = await scrapingService.testConnection();
      setTestResults(results);
      setShowDiagnostics(true);
      
      if (results.success) {
        toast({
          title: "✅ Diagnostics réussis",
          description: "Tous les services fonctionnent correctement"
        });
      } else {
        toast({
          title: "⚠️ Problèmes détectés",
          description: "Consultez les détails dans le panneau de diagnostics",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erreur de diagnostic",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const approvedCount = suggestions.filter(s => s.status === 'approved').length;
  const rejectedCount = suggestions.filter(s => s.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Scraping Intelligent</h1>
          <p className="text-muted-foreground">Détection automatique de réparateurs avec classification IA</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingSuggestions.length}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-sm text-muted-foreground">Approuvées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{rejectedCount}</p>
                <p className="text-sm text-muted-foreground">Rejetées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{suggestions.length}</p>
                <p className="text-sm text-muted-foreground">Total détecté</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scraping Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Lancer un nouveau scraping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                placeholder="ex: Paris, Lyon..."
                value={scrapingForm.city}
                onChange={(e) => setScrapingForm(prev => ({ ...prev, city: e.target.value }))}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select 
                value={scrapingForm.category} 
                onValueChange={(value) => setScrapingForm(prev => ({ ...prev, category: value }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smartphone">Réparation smartphone</SelectItem>
                  <SelectItem value="tablette">Réparation tablette</SelectItem>
                  <SelectItem value="ordinateur">Réparation ordinateur</SelectItem>
                  <SelectItem value="electronique">Électronique générale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="source">Source</Label>
              <Select 
                value={scrapingForm.source} 
                onValueChange={(value: any) => setScrapingForm(prev => ({ ...prev, source: value }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_maps">Google Maps</SelectItem>
                  <SelectItem value="pages_jaunes">Pages Jaunes</SelectItem>
                  <SelectItem value="firecrawl">🔥 Firecrawl AI</SelectItem>
                  <SelectItem value="local_directories">Annuaires locaux</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="maxResults">Résultats max</Label>
              <Input
                id="maxResults"
                type="number"
                min="5"
                max="100"
                value={scrapingForm.maxResults || 20}
                onChange={(e) => setScrapingForm(prev => ({ ...prev, maxResults: parseInt(e.target.value) || 20 }))}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button 
              onClick={handleStartScraping} 
              disabled={loading || isScrapingActive}
              className="flex-1 md:flex-none"
            >
              {loading && !showDiagnostics ? (
                <>🔄 Scraping en cours...</>
              ) : (
                <>🚀 Lancer le scraping intelligent</>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleRunDiagnostics} 
              disabled={loading}
            >
              {loading && showDiagnostics ? (
                <>🔄 Test...</>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-1" />
                  Diagnostics
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostics Panel */}
      {showDiagnostics && testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Résultats des diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-3 rounded-lg border ${testResults.details.edgeFunctionWorking ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {testResults.details.edgeFunctionWorking ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">Edge Function</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {testResults.details.edgeFunctionWorking ? 'Fonctionne' : 'Erreur'}
                  </p>
                  {testResults.details.edgeError && (
                    <p className="text-xs text-red-600 mt-1">{testResults.details.edgeError}</p>
                  )}
                </div>
                
                <div className={`p-3 rounded-lg border ${testResults.details.aiServicesAvailable ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-center gap-2">
                    {testResults.details.aiServicesAvailable ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                    <span className="font-medium">Services IA</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {testResults.details.aiServicesAvailable ? 'Disponibles' : 'Non configurés'}
                  </p>
                </div>
                
                <div className={`p-3 rounded-lg border ${testResults.details.databaseWorking ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {testResults.details.databaseWorking ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">Base de données</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {testResults.details.databaseWorking ? 'Accessible' : 'Erreur'}
                  </p>
                  {testResults.details.dbError && (
                    <p className="text-xs text-red-600 mt-1">{testResults.details.dbError}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <Button variant="outline" size="sm" onClick={() => setShowDiagnostics(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Suggestions de réparateurs ({pendingSuggestions.length} en attente)</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingSuggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune suggestion en attente. Lancez un scraping pour découvrir de nouveaux réparateurs.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{suggestion.scraped_data.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {suggestion.scraped_data.address}, {suggestion.scraped_data.city}
                        </div>
                        {suggestion.scraped_data.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {suggestion.scraped_data.phone}
                          </div>
                        )}
                        {suggestion.scraped_data.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {suggestion.scraped_data.rating} ({suggestion.scraped_data.review_count} avis)
                          </div>
                        )}
                        {suggestion.scraped_data.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            Site web
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Score: {Math.round(suggestion.scraped_data.confidence_score * 100)}%
                      </Badge>
                      <Badge variant={suggestion.scraped_data.ai_classification.is_repairer ? "default" : "secondary"}>
                        {suggestion.scraped_data.ai_classification.is_repairer ? 'Réparateur' : 'Incertain'}
                      </Badge>
                    </div>
                  </div>
                  
                  {suggestion.scraped_data.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {suggestion.scraped_data.description}
                    </p>
                  )}
                  
                  {suggestion.scraped_data.ai_classification.services.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Services détectés:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.scraped_data.ai_classification.services.map((service, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectSuggestion(suggestion.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Rejeter
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveSuggestion(suggestion.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approuver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentScrapingDashboard;
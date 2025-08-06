import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CityAutocomplete from '../scraping/CityAutocomplete';
import AISelector from '../scraping/AISelector';
import { useApiKeyStatus } from '../scraping/ai-selector/useApiKeyStatus';

const IntelligentScrapingDashboard = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [cityCoordinates, setCityCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAI, setSelectedAI] = useState('mistral');
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [scrapingResults, setScrapingResults] = useState<any[]>([]);
  const { toast } = useToast();
  const apiKeyStatuses = useApiKeyStatus();

  const handleCityChange = (city: string, coordinates?: { lat: number; lng: number }) => {
    setSelectedCity(city);
    setCityCoordinates(coordinates || null);
  };

  const handleStartIntelligentScraping = async () => {
    if (!selectedCity.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une ville",
        variant: "destructive"
      });
      return;
    }

    setIsScrapingActive(true);
    setScrapingResults([]);

    try {
      toast({
        title: "Scraping démarré",
        description: `Lancement du scraping intelligent pour ${selectedCity}...`
      });

      console.log('🚀 Démarrage scraping intelligent:', {
        city: selectedCity,
        coordinates: cityCoordinates,
        ai: selectedAI
      });

      // Appel à l'Edge Function de scraping intelligent
      const { data, error } = await supabase.functions.invoke('intelligent-scraping', {
        body: {
          city: selectedCity,
          category: 'smartphone',
          source: 'google_maps',
          maxResults: 20,
          coordinates: cityCoordinates,
          aiModel: selectedAI
        }
      });

      if (error) {
        throw error;
      }

      console.log('✅ Résultats scraping:', data);

      if (data?.success) {
        setScrapingResults(data.data || []);
        toast({
          title: "Scraping terminé",
          description: `${data.stats?.scraped || 0} réparateurs trouvés et ${data.stats?.classified || 0} classifiés par IA`,
        });
      } else {
        throw new Error(data?.error || 'Erreur inconnue lors du scraping');
      }

    } catch (error) {
      console.error('❌ Erreur scraping:', error);
      toast({
        title: "Erreur de scraping",
        description: error.message || 'Une erreur est survenue',
        variant: "destructive"
      });
    } finally {
      setIsScrapingActive(false);
    }
  };

  const getAIStatusIcon = (status: string) => {
    switch (status) {
      case 'configured':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'needs_config':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const aiConfiguredCount = Object.values(apiKeyStatuses).filter(status => status === 'configured').length;
  const totalAI = Object.keys(apiKeyStatuses).length;

  return (
    <div className="space-y-6">
      {/* Statut des services IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Services IA
            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
              aiConfiguredCount > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {aiConfiguredCount > 0 ? 'Configurés' : 'Non configurés'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(apiKeyStatuses).map(([aiName, status]) => (
              <div key={aiName} className="flex items-center space-x-2 p-3 border rounded-lg">
                {getAIStatusIcon(status)}
                <div>
                  <div className="font-medium capitalize">{aiName}</div>
                  <div className="text-xs text-muted-foreground">
                    {status === 'configured' ? 'Prêt' : 'Configuration requise'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {aiConfiguredCount === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="font-medium text-yellow-800">Services IA non configurés</p>
                  <p className="text-sm text-yellow-700">
                    Le scraping fonctionnera en mode basique sans classification IA. 
                    Configurez au moins un service IA pour une meilleure qualité.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interface de scraping intelligent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary" />
            Scraping Intelligent par Ville
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Sélection de ville avec autocomplétion */}
          <CityAutocomplete
            value={selectedCity}
            onChange={handleCityChange}
            placeholder="Rechercher une ville française..."
            label="Ville cible"
          />

          {/* Sélecteur d'IA */}
          <AISelector
            selectedAI={selectedAI}
            onAIChange={setSelectedAI}
            onApiKeyChange={() => {
              // Rafraîchir le statut après configuration
              window.location.reload();
            }}
          />

          {/* Configuration affichée */}
          {selectedCity && (
            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="font-semibold mb-2">Configuration actuelle</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <strong>Ville:</strong> {selectedCity}
                  {cityCoordinates && (
                    <span className="text-muted-foreground ml-2">
                      ({cityCoordinates.lat.toFixed(4)}, {cityCoordinates.lng.toFixed(4)})
                    </span>
                  )}
                </div>
                <div>
                  <strong>IA:</strong> {selectedAI} 
                  <span className={`ml-2 ${
                    apiKeyStatuses[selectedAI] === 'configured' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    ({apiKeyStatuses[selectedAI] === 'configured' ? 'configurée' : 'non configurée'})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bouton de lancement */}
          <Button 
            onClick={handleStartIntelligentScraping}
            disabled={isScrapingActive || !selectedCity.trim()}
            className="w-full"
            size="lg"
          >
            {isScrapingActive ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-spin" />
                Scraping en cours...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Lancer le scraping intelligent
              </>
            )}
          </Button>

          {/* Résultats */}
          {scrapingResults.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Résultats ({scrapingResults.length})</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {scrapingResults.map((repairer, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{repairer.name}</h5>
                        <p className="text-sm text-muted-foreground">{repairer.address}</p>
                        {repairer.services && repairer.services.length > 0 && (
                          <div className="mt-1">
                            {repairer.services.map((service: string, idx: number) => (
                              <span key={idx} className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs mr-1">
                                {service}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {repairer.ai_classified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            IA: {Math.round((repairer.confidence || 0) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentScrapingDashboard;
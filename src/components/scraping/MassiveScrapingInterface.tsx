import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Square, AlertTriangle, Loader2, MapPin } from 'lucide-react';
import DepartmentSelector from './DepartmentSelector';
import RegionSelector from './RegionSelector';
import ScrapingSourceCard from './ScrapingSourceCard';
import ScrapingStatusIndicator from './ScrapingStatusIndicator';
import ScrapingInfoPanel from './ScrapingInfoPanel';
import { ScrapingLog } from '@/hooks/scraping/useScrapingStatus';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { REGIONS } from './controls/scrapingConstants';

interface MassiveScrapingInterfaceProps {
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  isScrapingRunning: boolean;
  latestLog: ScrapingLog | undefined;
  onMassiveScraping: (source: string, test: boolean) => void;
  onStopScraping: () => void;
  getProgress: () => number;
}

interface RegionScrapingProgress {
  isRunning: boolean;
  currentDepartment: string;
  processedDepartments: number;
  totalDepartments: number;
  totalResults: number;
  errors: string[];
}

const MassiveScrapingInterface = ({
  selectedDepartment,
  onDepartmentChange,
  isScrapingRunning,
  latestLog,
  onMassiveScraping,
  onStopScraping,
  getProgress,
}: MassiveScrapingInterfaceProps) => {
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState('');
  const [regionProgress, setRegionProgress] = useState<RegionScrapingProgress>({
    isRunning: false,
    currentDepartment: '',
    processedDepartments: 0,
    totalDepartments: 0,
    totalResults: 0,
    errors: []
  });
  const [googleApiKey, setGoogleApiKey] = useState('');
  
  console.log('🔍 MassiveScrapingInterface render:', {
    isScrapingRunning,
    latestLog: latestLog ? {
      id: latestLog.id,
      status: latestLog.status,
      source: latestLog.source,
      completed_at: latestLog.completed_at
    } : null
  });

  // Déterminer si un scraping est vraiment en cours
  const isActuallyRunning = isScrapingRunning && latestLog?.status === 'running' && !latestLog?.completed_at;
  const isAnyScrapingRunning = isActuallyRunning || regionProgress.isRunning;

  // Scraping exhaustif par département (toutes les villes)
  const handleDepartmentExhaustiveScraping = async () => {
    if (!googleApiKey) {
      toast({
        title: "Clé API requise",
        description: "Veuillez entrer votre clé API Google Places",
        variant: "destructive"
      });
      return;
    }

    try {
      setRegionProgress(prev => ({ 
        ...prev, 
        isRunning: true, 
        currentDepartment: selectedDepartment,
        totalDepartments: 1,
        processedDepartments: 0,
        totalResults: 0,
        errors: []
      }));

      console.log(`🏙️ Démarrage scraping exhaustif du département ${selectedDepartment}`);

      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: {
          action: 'departmentSearch',
          departmentCode: selectedDepartment,
          searchTerm: 'réparateur téléphone smartphone mobile',
          apiKey: googleApiKey,
          delayMs: 1500
        }
      });

      if (error) throw error;

      console.log(`✅ Scraping département terminé:`, data);

      // Sauvegarder les résultats dans la base
      if (data.results && data.results.length > 0) {
        await saveResultsToDatabase(data.results);
      }

      setRegionProgress(prev => ({ 
        ...prev, 
        isRunning: false, 
        processedDepartments: 1,
        totalResults: data.totalResults || 0
      }));

      toast({
        title: "Scraping terminé",
        description: `${data.totalResults} réparateurs trouvés dans ${data.citiesSearched} villes`
      });

    } catch (error: any) {
      console.error('❌ Erreur scraping département:', error);
      setRegionProgress(prev => ({ 
        ...prev, 
        isRunning: false,
        errors: [...prev.errors, error.message]
      }));
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Scraping par région entière
  const handleRegionScraping = async () => {
    if (!selectedRegion) {
      toast({
        title: "Région requise",
        description: "Veuillez sélectionner une région",
        variant: "destructive"
      });
      return;
    }

    if (!googleApiKey) {
      toast({
        title: "Clé API requise",
        description: "Veuillez entrer votre clé API Google Places",
        variant: "destructive"
      });
      return;
    }

    const region = REGIONS.find(r => r.name === selectedRegion);
    if (!region) return;

    const departmentCodes = region.departments.map(d => d.code);

    try {
      setRegionProgress({
        isRunning: true,
        currentDepartment: '',
        processedDepartments: 0,
        totalDepartments: departmentCodes.length,
        totalResults: 0,
        errors: []
      });

      console.log(`🗺️ Démarrage scraping région ${selectedRegion} (${departmentCodes.length} départements)`);

      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: {
          action: 'regionSearch',
          departments: departmentCodes,
          searchTerm: 'réparateur téléphone smartphone mobile',
          apiKey: googleApiKey,
          delayMs: 2000
        }
      });

      if (error) throw error;

      console.log(`✅ Scraping région terminé:`, data);

      // Sauvegarder les résultats dans la base
      if (data.results && data.results.length > 0) {
        await saveResultsToDatabase(data.results);
      }

      setRegionProgress({
        isRunning: false,
        currentDepartment: '',
        processedDepartments: departmentCodes.length,
        totalDepartments: departmentCodes.length,
        totalResults: data.totalResults || 0,
        errors: []
      });

      toast({
        title: "Scraping région terminé",
        description: `${data.totalResults} réparateurs trouvés dans ${data.totalCitiesSearched} villes (${departmentCodes.length} départements)`
      });

    } catch (error: any) {
      console.error('❌ Erreur scraping région:', error);
      setRegionProgress(prev => ({ 
        ...prev, 
        isRunning: false,
        errors: [...prev.errors, error.message]
      }));
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Sauvegarder les résultats Google Places dans la base
  const saveResultsToDatabase = async (results: any[]) => {
    console.log(`💾 Sauvegarde de ${results.length} résultats dans la base...`);
    
    let savedCount = 0;
    let errorCount = 0;

    for (const place of results) {
      try {
        // Extraire les informations du lieu
        const addressParts = place.formatted_address?.split(',') || [];
        const city = addressParts[0]?.trim() || place._city || '';
        const postalCodeMatch = place.formatted_address?.match(/\d{5}/);
        const postalCode = postalCodeMatch ? postalCodeMatch[0] : '';

        const repairerData = {
          name: place.name,
          address: place.formatted_address || place.vicinity || '',
          city: city,
          postal_code: postalCode,
          lat: place.geometry?.location?.lat || null,
          lng: place.geometry?.location?.lng || null,
          rating: place.rating || null,
          review_count: place.user_ratings_total || 0,
          google_place_id: place.place_id,
          source: 'google_places_exhaustive',
          is_verified: false,
          specialties: ['réparation smartphone', 'réparation mobile'],
          updated_at: new Date().toISOString()
        };

        // Upsert basé sur google_place_id
        const { error } = await supabase
          .from('repairers')
          .upsert(repairerData, { 
            onConflict: 'google_place_id',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error('Erreur insertion:', error);
          errorCount++;
        } else {
          savedCount++;
        }
      } catch (err) {
        console.error('Erreur traitement place:', err);
        errorCount++;
      }
    }

    console.log(`✅ Sauvegarde terminée: ${savedCount} réussis, ${errorCount} erreurs`);
    return { savedCount, errorCount };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-red-600" />
            Scraping Massif - Tous les Réparateurs de France
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isAnyScrapingRunning 
                ? 'bg-red-100 text-red-800 animate-pulse' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {isAnyScrapingRunning ? '🔴 SCRAPING ACTIF' : '⚪ INACTIF'}
            </div>
            
            {isActuallyRunning && (
              <Button 
                onClick={() => {
                  console.log('🛑 Clic sur le bouton STOP');
                  onStopScraping();
                }}
                variant="destructive"
                size="sm"
                className="animate-pulse bg-red-600 hover:bg-red-700 text-white font-bold border-2 border-red-700"
              >
                <Square className="h-4 w-4 mr-2" />
                ARRÊTER MAINTENANT
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Clé API Google Places */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <label className="text-sm font-medium flex items-center mb-2">
            🔑 Clé API Google Places (requise pour scraping exhaustif)
          </label>
          <input
            type="password"
            value={googleApiKey}
            onChange={(e) => setGoogleApiKey(e.target.value)}
            placeholder="Entrez votre clé API Google Places..."
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
          <p className="text-xs text-amber-700 mt-1">
            Cette clé est utilisée uniquement côté serveur pour les requêtes Google Places API
          </p>
        </div>

        {/* Sélecteurs département et région */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <DepartmentSelector
              selectedDepartment={selectedDepartment}
              onDepartmentChange={onDepartmentChange}
            />
            <Button
              onClick={handleDepartmentExhaustiveScraping}
              disabled={isAnyScrapingRunning || !googleApiKey}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {regionProgress.isRunning && regionProgress.totalDepartments === 1 ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scraping en cours...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Scraper TOUTES les villes du département
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-4">
            <RegionSelector
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
            />
            <Button
              onClick={handleRegionScraping}
              disabled={isAnyScrapingRunning || !selectedRegion || !googleApiKey}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {regionProgress.isRunning && regionProgress.totalDepartments > 1 ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {regionProgress.processedDepartments}/{regionProgress.totalDepartments} départements...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Scraper la RÉGION ENTIÈRE
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progression du scraping région/département */}
        {regionProgress.isRunning && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-800">Progression du scraping exhaustif</span>
              <Badge variant="secondary">
                {regionProgress.totalResults} résultats
              </Badge>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(regionProgress.processedDepartments / regionProgress.totalDepartments) * 100}%` 
                }}
              />
            </div>
            <p className="text-xs text-blue-700 mt-2">
              {regionProgress.processedDepartments} / {regionProgress.totalDepartments} départements traités
              {regionProgress.currentDepartment && ` • En cours: ${regionProgress.currentDepartment}`}
            </p>
          </div>
        )}

        {/* Résultat du dernier scraping */}
        {!regionProgress.isRunning && regionProgress.totalResults > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-800 font-medium">✅ Dernier scraping terminé</span>
              <Badge className="bg-green-600">{regionProgress.totalResults} réparateurs</Badge>
            </div>
            {regionProgress.errors.length > 0 && (
              <p className="text-xs text-amber-700 mt-1">
                ⚠️ {regionProgress.errors.length} erreur(s) rencontrée(s)
              </p>
            )}
          </div>
        )}

        {/* Alerte de debug */}
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            🔧 Debug Scraping
          </summary>
          <div className="p-3 bg-muted/50 rounded-lg mt-2 space-y-1">
            <p><strong>isScrapingRunning:</strong> {isScrapingRunning ? 'TRUE ✅' : 'FALSE ❌'}</p>
            <p><strong>isActuallyRunning:</strong> {isActuallyRunning ? 'TRUE ✅' : 'FALSE ❌'}</p>
            <p><strong>regionProgress.isRunning:</strong> {regionProgress.isRunning ? 'TRUE ✅' : 'FALSE ❌'}</p>
            <p><strong>latestLog status:</strong> {latestLog?.status || 'NONE'}</p>
          </div>
        </details>

        <ScrapingStatusIndicator
          isScrapingRunning={isScrapingRunning}
          latestLog={latestLog}
          getProgress={getProgress}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScrapingSourceCard
            title="Pages Jaunes"
            estimatedCount="~25 réparateurs"
            description="Scraping avec géolocalisation précise des grandes villes françaises"
            source="pages_jaunes"
            isScrapingRunning={isAnyScrapingRunning}
            onTest={() => onMassiveScraping('pages_jaunes', true)}
            onMassiveScraping={() => onMassiveScraping('pages_jaunes', false)}
          />

          <ScrapingSourceCard
            title="Google Places"
            estimatedCount="~8 réparateurs"
            description="Extraction géolocalisée par communes françaises"
            source="google_places"
            isScrapingRunning={isAnyScrapingRunning}
            onTest={() => onMassiveScraping('google_places', true)}
            onMassiveScraping={() => onMassiveScraping('google_places', false)}
          />
        </div>

        <ScrapingInfoPanel />
      </CardContent>
    </Card>
  );
};

export default MassiveScrapingInterface;

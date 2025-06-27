
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Upload, MapPin, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CSVService, ImportResult } from '@/services/scraping/CSVService';
import { GeocodingService } from '@/services/geocoding/GeocodingService';
import { DeepSeekService } from '@/services/scraping/ai/DeepSeekService';

interface ImportProgress {
  step: string;
  current: number;
  total: number;
  percentage: number;
}

const CSVImportWithGeocoding = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({ step: '', current: 0, total: 0, percentage: 0 });
  const [result, setResult] = useState<ImportResult | null>(null);
  const [useGeocoding, setUseGeocoding] = useState(true);
  const [useAI, setUseAI] = useState(false);
  const [deepseekApiKey, setDeepseekApiKey] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.name.toLowerCase().endsWith('.csv')) {
      setFile(selectedFile);
      setResult(null);
    } else {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner un fichier CSV",
        variant: "destructive"
      });
    }
  };

  const updateProgress = (step: string, current: number, total: number) => {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    setProgress({ step, current, total, percentage });
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      // Étape 1: Parsing du CSV
      updateProgress('Lecture du fichier CSV', 0, 4);
      const parseResult = await CSVService.importFromFile(file);
      
      if (!parseResult.success || parseResult.data.length === 0) {
        setResult(parseResult);
        toast({
          title: "Erreur de parsing",
          description: "Impossible de lire le fichier CSV",
          variant: "destructive"
        });
        return;
      }

      let processedData = [...parseResult.data];
      let totalSteps = 4;

      // Étape 2: Classification IA (optionnel)
      if (useAI && deepseekApiKey) {
        totalSteps = 5;
        updateProgress('Classification IA des données', 1, totalSteps);
        
        try {
          DeepSeekService.setApiKey(deepseekApiKey);
          const classifiedData = await DeepSeekService.classifyRepairers(processedData);
          
          // Appliquer les classifications
          processedData = processedData.map((item, index) => {
            const classified = classifiedData[index];
            if (classified && classified.is_valid_repairer) {
              return {
                ...item,
                name: classified.name || item.name,
                services: classified.services || item.services || ['Réparation téléphone'],
                specialties: classified.specialties || item.specialties || [],
                price_range: classified.price_range || item.price_range || 'medium'
              };
            }
            return item;
          }).filter(item => {
            const classified = classifiedData[processedData.indexOf(item)];
            return !classified || classified.is_valid_repairer !== false;
          });

          console.log(`✅ Classification IA: ${processedData.length} réparateurs valides`);
        } catch (aiError) {
          console.warn('⚠️ Erreur IA, continue sans classification:', aiError);
        }
      }

      // Étape 3: Géocodage (optionnel)
      if (useGeocoding) {
        const geocodingStep = useAI ? 2 : 1;
        updateProgress('Géocodage des adresses', geocodingStep, totalSteps);
        
        for (let i = 0; i < processedData.length; i++) {
          const item = processedData[i];
          
          // Mettre à jour le progress
          if (i % 5 === 0) {
            updateProgress(`Géocodage ${i + 1}/${processedData.length}`, geocodingStep, totalSteps);
          }
          
          try {
            const geocoded = await GeocodingService.geocodeAddress(
              item.address || 'Adresse non renseignée',
              item.city,
              item.postal_code
            );
            
            if (geocoded) {
              processedData[i] = {
                ...item,
                lat: geocoded.lat,
                lng: geocoded.lng
              };
              console.log(`✅ Géocodé: ${item.name} -> ${geocoded.lat}, ${geocoded.lng}`);
            }
          } catch (geoError) {
            console.warn(`⚠️ Erreur géocodage pour ${item.name}:`, geoError);
          }
        }
      }

      // Étape 4: Sauvegarde en base
      const saveStep = useGeocoding ? (useAI ? 3 : 2) : (useAI ? 2 : 1);
      updateProgress('Sauvegarde en base de données', saveStep, totalSteps);
      
      let savedCount = 0;
      for (let i = 0; i < processedData.length; i++) {
        const item = processedData[i];
        
        try {
          // Générer un ID unique
          const uniqueId = crypto.randomUUID();
          
          // Préparer les données pour la base
          const repairerData = {
            id: uniqueId,
            name: item.name,
            address: item.address || 'Adresse non renseignée',
            city: item.city,
            postal_code: item.postal_code || '00000',
            phone: item.phone || null,
            email: item.email || null,
            website: item.website || null,
            services: Array.isArray(item.services) ? item.services : 
                     typeof item.services === 'string' ? item.services.split(',').map(s => s.trim()) : 
                     ['Réparation téléphone'],
            specialties: Array.isArray(item.specialties) ? item.specialties :
                        typeof item.specialties === 'string' ? item.specialties.split(',').map(s => s.trim()) :
                        ['Tout mobile'],
            price_range: ['low', 'medium', 'high'].includes(item.price_range) ? item.price_range : 'medium',
            lat: item.lat ? Number(item.lat) : null,
            lng: item.lng ? Number(item.lng) : null,
            source: 'csv_import_enhanced',
            is_verified: true,
            department: (item.postal_code || '00000').substring(0, 2),
            region: 'France',
            rating: 4.5,
            review_count: 0,
            scraped_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Insertion en base
          const { error: insertError } = await supabase
            .from('repairers')
            .insert(repairerData);

          if (insertError) {
            console.error(`❌ Erreur insertion ${item.name}:`, insertError);
          } else {
            savedCount++;
            console.log(`✅ Sauvegardé: ${item.name} (ID: ${uniqueId})`);
          }

        } catch (error) {
          console.error(`💥 Erreur traitement ${item.name}:`, error);
        }
      }

      // Étape 5: Finalisation
      updateProgress('Finalisation', totalSteps, totalSteps);
      
      const finalResult = {
        success: true,
        processed: savedCount,
        skipped: processedData.length - savedCount,
        errors: [],
        data: processedData
      };
      
      setResult(finalResult);

      toast({
        title: "✅ Import terminé",
        description: `${savedCount} réparateur(s) importé(s) avec succès`,
      });

      // Déclencher le rechargement de la carte
      window.dispatchEvent(new CustomEvent('repairersUpdated'));

    } catch (error) {
      console.error('💥 Erreur import:', error);
      toast({
        title: "❌ Erreur d'import",
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      setProgress({ step: '', current: 0, total: 0, percentage: 0 });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2 text-blue-600" />
          Import CSV Avancé
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sélection de fichier */}
        <div className="space-y-4">
          <div>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={importing}
            />
            {file && (
              <p className="text-sm text-gray-600 mt-2">
                📄 Fichier: {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>

          {/* Options d'import */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-geocoding"
                checked={useGeocoding}
                onChange={(e) => setUseGeocoding(e.target.checked)}
                disabled={importing}
              />
              <label htmlFor="use-geocoding" className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1 text-green-600" />
                Géocodage automatique des adresses
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-ai"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                disabled={importing}
              />
              <label htmlFor="use-ai" className="flex items-center text-sm">
                <Zap className="h-4 w-4 mr-1 text-purple-600" />
                Classification IA avec DeepSeek
              </label>
            </div>

            {useAI && (
              <div className="ml-6 space-y-2">
                <Input
                  type="password"
                  placeholder="Clé API DeepSeek (sk-...)"
                  value={deepseekApiKey}
                  onChange={(e) => setDeepseekApiKey(e.target.value)}
                  disabled={importing}
                />
                <p className="text-xs text-gray-500">
                  Obtenez votre clé sur{' '}
                  <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    platform.deepseek.com
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Bouton d'import */}
          <Button
            onClick={handleImport}
            disabled={!file || importing || (useAI && !deepseekApiKey)}
            className="w-full"
          >
            {importing ? 'Import en cours...' : 'Importer avec améliorations'}
          </Button>
        </div>

        {/* Progress */}
        {importing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{progress.step}</span>
              <span>{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} />
            <p className="text-xs text-gray-500 text-center">
              {progress.current} / {progress.total}
            </p>
          </div>
        )}

        {/* Résultats */}
        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className="ml-2">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>✅ Importés: {result.processed}</div>
                  <div>⚠️ Ignorés: {result.skipped}</div>
                  <div>❌ Erreurs: {result.errors.length}</div>
                </div>
                {result.success && (
                  <p className="mt-2 text-green-700 font-medium">
                    🎉 Import terminé avec succès! Les réparateurs sont maintenant visibles sur la carte.
                  </p>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default CSVImportWithGeocoding;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Play, Square, MapPin, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { REGIONS } from './controls/scrapingConstants';
import ScrapingPreviewModal from './ScrapingPreviewModal';

interface ScrapingResult {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  services?: string[];
  source: string;
}

const ScrapingControlPanel: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [testMode, setTestMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [previewResults, setPreviewResults] = useState<ScrapingResult[]>([]);
  const [previewLogId, setPreviewLogId] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const handleStartScraping = async () => {
    if (!selectedDepartment) {
      toast.error('Sélectionnez un département');
      return;
    }

    setIsLoading(true);
    try {
      toast.info(`Démarrage du scraping pour le département ${selectedDepartment}...`);

      const { data, error } = await supabase.functions.invoke('scrape-repairers', {
        body: {
          department_code: selectedDepartment,
          test_mode: testMode,
          source: 'serper',
        },
      });

      if (error) throw error;

      if (data.success && data.results?.length > 0) {
        setPreviewResults(data.results);
        setPreviewLogId(data.log_id);
        setShowPreview(true);
        toast.success(`${data.total_found} réparateurs trouvés ! Vérifiez et validez.`);
      } else {
        toast.warning('Aucun réparateur trouvé pour ce département');
      }
    } catch (error: any) {
      console.error('Erreur scraping:', error);
      toast.error(error.message || 'Erreur lors du scraping');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopScraping = async () => {
    try {
      const { error } = await supabase.functions.invoke('stop-scraping');
      if (error) throw error;
      toast.info('Scraping arrêté');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'arrêt');
    }
  };

  const handleValidated = () => {
    setPreviewResults([]);
    setPreviewLogId('');
    toast.success('Réparateurs ajoutés à la base de données !');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Scraping des Réparateurs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélection du département */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Département cible
            </Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un département" />
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                {REGIONS.map((region) => (
                  <SelectGroup key={region.name}>
                    <SelectLabel className="font-bold text-primary">
                      {region.name}
                    </SelectLabel>
                    {region.departments.map((dept) => (
                      <SelectItem key={dept.code} value={dept.code}>
                        <span className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {dept.code}
                          </Badge>
                          {dept.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mode test */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="test-mode" className="font-medium">
                Mode test
              </Label>
              <p className="text-sm text-muted-foreground">
                Limite la recherche à 1 ville et 2 requêtes pour tester
              </p>
            </div>
            <Switch
              id="test-mode"
              checked={testMode}
              onCheckedChange={setTestMode}
            />
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Types de commerces recherchés :
                </p>
                <ul className="mt-1 text-blue-700 dark:text-blue-300 list-disc list-inside">
                  <li>Réparation smartphone / téléphone</li>
                  <li>Réparation tablette / iPad</li>
                  <li>Micro-soudure téléphone</li>
                  <li>Réparation montre connectée</li>
                  <li>Réparation écran cassé</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <Button
              onClick={handleStartScraping}
              disabled={isLoading || !selectedDepartment}
              className="flex-1 gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Lancer le scraping
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleStopScraping}
              disabled={!isLoading}
              className="gap-2"
            >
              <Square className="w-4 h-4" />
              Arrêter
            </Button>
          </div>

          {/* Statistiques */}
          {previewResults.length > 0 && !showPreview && (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-200 font-medium">
                {previewResults.length} réparateurs prêts à valider
              </p>
              <Button
                variant="link"
                onClick={() => setShowPreview(true)}
                className="p-0 h-auto text-green-600"
              >
                Voir les résultats →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de prévisualisation */}
      <ScrapingPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        results={previewResults}
        logId={previewLogId}
        onValidated={handleValidated}
      />
    </>
  );
};

export default ScrapingControlPanel;

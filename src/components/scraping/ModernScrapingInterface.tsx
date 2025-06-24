
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useScrapingAuth } from '@/hooks/scraping/useScrapingAuth';
import { Play, Upload, Download, FileText, Globe } from 'lucide-react';
import { CSVService } from '@/services/scraping/CSVService';

const ModernScrapingInterface = () => {
  const { toast } = useToast();
  const { checkAuthAndPermissions } = useScrapingAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // États pour le scraping manuel
  const [searchTerm, setSearchTerm] = useState('réparation téléphone');
  const [location, setLocation] = useState('Paris');
  const [source, setSource] = useState('pages_jaunes');
  const [maxResults, setMaxResults] = useState(10);
  
  // États pour l'import CSV
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<any>(null);

  const handleManualScraping = async () => {
    if (!checkAuthAndPermissions()) return;
    
    setIsLoading(true);
    try {
      // Utiliser l'edge function modernisée
      const response = await fetch('/api/modern-scraping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm,
          location,
          source,
          maxResults,
          testMode: false
        })
      });

      const data = await response.json();
      
      toast({
        title: "✅ Scraping terminé",
        description: `${data.processedCount || 0} réparateurs trouvés et traités`,
      });
      
    } catch (error) {
      console.error('Erreur scraping:', error);
      toast({
        title: "❌ Erreur de scraping",
        description: "Une erreur est survenue lors du scraping",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSVImport = async () => {
    if (!csvFile || !checkAuthAndPermissions()) return;
    
    setIsLoading(true);
    try {
      const result = await CSVService.importFromFile(csvFile);
      setImportResults(result);
      
      if (result.success) {
        toast({
          title: "✅ Import CSV réussi",
          description: `${result.processed} réparateurs importés avec succès`,
        });
      } else {
        toast({
          title: "⚠️ Import avec erreurs",
          description: `${result.processed} importés, ${result.errors.length} erreurs`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur import CSV:', error);
      toast({
        title: "❌ Erreur d'import",
        description: "Impossible d'importer le fichier CSV",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSVExport = () => {
    if (!checkAuthAndPermissions()) return;
    
    // Exporter les données actuelles (placeholder - à connecter aux vrais données)
    CSVService.exportToCSV([], `repairers_export_${new Date().toISOString().split('T')[0]}.csv`);
    
    toast({
      title: "📄 Export CSV",
      description: "Le fichier CSV a été téléchargé",
    });
  };

  const downloadTemplate = () => {
    CSVService.generateTemplate();
    toast({
      title: "📋 Modèle téléchargé",
      description: "Le modèle CSV a été téléchargé",
    });
  };

  return (
    <div className="space-y-6">
      {/* Scraping Manuel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            Scraping Manuel Modernisé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="searchTerm">Terme de recherche</Label>
              <Input
                id="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ex: réparation iPhone"
              />
            </div>
            <div>
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Paris, Lyon..."
              />
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pages_jaunes">Pages Jaunes</SelectItem>
                  <SelectItem value="google_maps">Google Maps</SelectItem>
                  <SelectItem value="both">Les deux</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxResults">Résultats max</Label>
              <Input
                id="maxResults"
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                min="1"
                max="100"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleManualScraping}
            disabled={isLoading}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {isLoading ? 'Scraping en cours...' : 'Démarrer le scraping'}
          </Button>
        </CardContent>
      </Card>

      {/* Import/Export CSV */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-600" />
            Gestion CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Import */}
            <div className="space-y-3">
              <Label>Import de réparateurs</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
                <Button 
                  onClick={handleCSVImport}
                  disabled={!csvFile || isLoading}
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importer
                </Button>
              </div>
              <Button 
                onClick={downloadTemplate}
                variant="outline"
                size="sm"
                className="w-full"
              >
                📋 Télécharger le modèle
              </Button>
            </div>

            {/* Export */}
            <div className="space-y-3">
              <Label>Export des données</Label>
              <Button 
                onClick={handleCSVExport}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter en CSV
              </Button>
            </div>
          </div>

          {/* Résultats d'import */}
          {importResults && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Résultats de l'import :</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>✅ Importés: {importResults.processed}</div>
                <div>⚠️ Ignorés: {importResults.skipped}</div>
                <div>❌ Erreurs: {importResults.errors.length}</div>
              </div>
              {importResults.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-600">Voir les erreurs</summary>
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    {importResults.errors.map((error: string, idx: number) => (
                      <div key={idx} className="text-xs text-red-600">{error}</div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations sur le système modernisé */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Système Modernisé Actif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-600">✅ Services Actifs</h4>
              <ul className="mt-2 space-y-1">
                <li>• Playwright Scraper</li>
                <li>• Classification IA Mistral</li>
                <li>• Géocodage Nominatim</li>
                <li>• Import/Export CSV</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-600">🔧 Fonctionnalités</h4>
              <ul className="mt-2 space-y-1">
                <li>• Anti-détection automatique</li>
                <li>• Validation des entreprises</li>
                <li>• Déduplication intelligente</li>
                <li>• Géolocalisation précise</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernScrapingInterface;

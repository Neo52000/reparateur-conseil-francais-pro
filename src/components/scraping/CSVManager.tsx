
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useScrapingAuth } from '@/hooks/scraping/useScrapingAuth';
import { CSVService, ImportResult } from '@/services/scraping/CSVService';
import { Upload, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CSVManager = () => {
  const { toast } = useToast();
  const { checkAuthAndPermissions } = useScrapingAuth();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setImportFile(file);
      setImportResult(null);
    } else {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner un fichier CSV",
        variant: "destructive"
      });
    }
  };

  const handleImport = async () => {
    if (!importFile || !checkAuthAndPermissions()) return;

    setImporting(true);
    setImportProgress(10);

    try {
      // Phase 1: Validation et parsing du CSV
      console.log("📄 Parsing du fichier CSV...");
      const parseResult = await CSVService.importFromFile(importFile);
      setImportProgress(40);
      
      if (!parseResult.success || parseResult.data.length === 0) {
        setImportResult(parseResult);
        toast({
          title: "⚠️ Parsing échoué",
          description: `Erreurs trouvées dans le fichier CSV`,
          variant: "destructive"
        });
        return;
      }

      console.log(`✅ ${parseResult.data.length} lignes valides parsées`);
      setImportProgress(60);

      // Phase 2: Sauvegarde en base de données
      console.log("💾 Sauvegarde en base de données...");
      const savedCount = await saveCSVDataToDatabase(parseResult.data);
      setImportProgress(100);

      const finalResult = {
        ...parseResult,
        processed: savedCount
      };
      
      setImportResult(finalResult);

      toast({
        title: "✅ Import terminé",
        description: `${savedCount} réparateurs importés avec succès`,
      });

    } catch (error) {
      console.error('Erreur import CSV:', error);
      toast({
        title: "❌ Erreur d'import",
        description: "Une erreur est survenue lors de l'import",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  const saveCSVDataToDatabase = async (csvData: any[]) => {
    let savedCount = 0;

    for (const item of csvData) {
      try {
        // Transformer les données CSV en format base de données
        const repairerData = {
          name: item.name,
          address: item.address,
          city: item.city,
          postal_code: item.postal_code,
          phone: item.phone,
          email: item.email,
          website: item.website,
          services: item.services ? item.services.split(',').map((s: string) => s.trim()) : [],
          specialties: item.specialties ? item.specialties.split(',').map((s: string) => s.trim()) : [],
          price_range: item.price_range || 'medium',
          lat: item.lat,
          lng: item.lng,
          source: 'csv_import',
          is_verified: false,
          department: item.postal_code?.substring(0, 2) || '00',
          region: 'France',
          scraped_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Vérifier si le réparateur existe déjà
        const { data: existing } = await supabase
          .from('repairers')
          .select('id')
          .eq('name', repairerData.name)
          .eq('postal_code', repairerData.postal_code)
          .single();

        if (existing) {
          // Mise à jour
          const { error } = await supabase
            .from('repairers')
            .update({
              ...repairerData,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (!error) savedCount++;
        } else {
          // Insertion
          const { error } = await supabase
            .from('repairers')
            .insert(repairerData);

          if (!error) savedCount++;
        }

      } catch (error) {
        console.error('Erreur sauvegarde item:', error);
      }
    }

    return savedCount;
  };

  const handleExport = async () => {
    if (!checkAuthAndPermissions()) return;

    setExporting(true);
    try {
      // Récupérer les données depuis la base
      const { data: repairers, error } = await supabase
        .from('repairers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      if (!repairers || repairers.length === 0) {
        toast({
          title: "Aucune donnée",
          description: "Aucun réparateur à exporter",
          variant: "destructive"
        });
        return;
      }

      // Exporter au format CSV
      const filename = `repairers_export_${new Date().toISOString().split('T')[0]}.csv`;
      CSVService.exportToCSV(repairers, filename);

      toast({
        title: "📄 Export réussi",
        description: `${repairers.length} réparateurs exportés`,
      });

    } catch (error) {
      console.error('Erreur export:', error);
      toast({
        title: "❌ Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const downloadTemplate = () => {
    CSVService.generateTemplate();
    toast({
      title: "📋 Modèle téléchargé",
      description: "Le fichier modèle CSV a été téléchargé",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Gestionnaire CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Import Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Import de réparateurs</h3>
          
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={importing}
              className="flex-1"
            />
            <Button
              onClick={handleImport}
              disabled={!importFile || importing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? 'Import...' : 'Importer'}
            </Button>
          </div>

          <Button 
            onClick={downloadTemplate}
            variant="outline"
            size="sm"
          >
            📋 Télécharger le modèle CSV
          </Button>

          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Import en cours...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} />
            </div>
          )}

          {importResult && (
            <Alert className={importResult.success ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
              <div className="flex items-center">
                {importResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <AlertDescription className="ml-2">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>✅ Importés: {importResult.processed}</div>
                    <div>⚠️ Ignorés: {importResult.skipped}</div>
                    <div>❌ Erreurs: {importResult.errors.length}</div>
                  </div>
                  {importResult.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">Voir les erreurs</summary>
                      <div className="mt-1 max-h-32 overflow-y-auto text-xs">
                        {importResult.errors.slice(0, 10).map((error, idx) => (
                          <div key={idx} className="text-red-600">{error}</div>
                        ))}
                        {importResult.errors.length > 10 && (
                          <div className="text-gray-500">... et {importResult.errors.length - 10} autres erreurs</div>
                        )}
                      </div>
                    </details>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>

        {/* Export Section */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-medium">Export des données</h3>
          
          <Button
            onClick={handleExport}
            disabled={exporting}
            variant="outline"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Export en cours...' : 'Exporter toutes les données CSV'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVManager;

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
    console.log('Fichier sélectionné:', file);
    
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: "Format invalide",
          description: "Veuillez sélectionner un fichier CSV (.csv)",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Fichier CSV valide:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified)
      });
      
      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!importFile || !checkAuthAndPermissions()) return;

    console.log('🚀 Début de l\'import CSV:', importFile.name);
    setImporting(true);
    setImportProgress(10);

    try {
      // Phase 1: Validation et parsing du CSV
      console.log("📄 Phase 1: Parsing du fichier CSV...");
      const parseResult = await CSVService.importFromFile(importFile);
      console.log('Résultat du parsing:', parseResult);
      setImportProgress(40);
      
      if (!parseResult.success) {
        console.error('❌ Erreurs de parsing:', parseResult.errors);
        setImportResult(parseResult);
        toast({
          title: "⚠️ Erreurs dans le fichier CSV",
          description: `${parseResult.errors.length} erreur(s) trouvée(s)`,
          variant: "destructive"
        });
        return;
      }

      if (parseResult.data.length === 0) {
        console.warn('⚠️ Aucune donnée valide trouvée');
        setImportResult(parseResult);
        toast({
          title: "⚠️ Fichier vide",
          description: "Aucune donnée valide trouvée dans le fichier CSV",
          variant: "destructive"
        });
        return;
      }

      console.log(`✅ ${parseResult.data.length} lignes valides parsées`);
      console.log('Exemple de données parsées:', parseResult.data[0]);
      setImportProgress(60);

      // Phase 2: Sauvegarde en base de données
      console.log("💾 Phase 2: Sauvegarde en base de données...");
      const savedCount = await saveCSVDataToDatabase(parseResult.data);
      console.log(`💾 ${savedCount} réparateurs sauvegardés`);
      setImportProgress(100);

      const finalResult = {
        ...parseResult,
        processed: savedCount
      };
      
      setImportResult(finalResult);

      toast({
        title: "✅ Import terminé",
        description: `${savedCount} réparateur(s) importé(s) avec succès`,
      });

    } catch (error) {
      console.error('💥 Erreur complète lors de l\'import CSV:', error);
      toast({
        title: "❌ Erreur d'import",
        description: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  const saveCSVDataToDatabase = async (csvData: any[]) => {
    let savedCount = 0;
    console.log(`🔄 Tentative de sauvegarde de ${csvData.length} éléments`);

    for (let i = 0; i < csvData.length; i++) {
      const item = csvData[i];
      console.log(`Processing item ${i + 1}/${csvData.length}:`, item);
      
      try {
        // Validation des données obligatoires
        if (!item.name || !item.city) {
          console.warn(`⚠️ Item ${i + 1} ignoré - données manquantes:`, { name: item.name, city: item.city });
          continue;
        }

        // Préparation des services et spécialités
        let services = [];
        let specialties = [];
        
        if (item.services) {
          if (typeof item.services === 'string') {
            services = item.services.split(',').map((s: string) => s.trim()).filter(s => s.length > 0);
          } else if (Array.isArray(item.services)) {
            services = item.services;
          }
        }
        
        if (item.specialties) {
          if (typeof item.specialties === 'string') {
            specialties = item.specialties.split(',').map((s: string) => s.trim()).filter(s => s.length > 0);
          } else if (Array.isArray(item.specialties)) {
            specialties = item.specialties;
          }
        }

        // Si pas de services définis, ajouter un service par défaut
        if (services.length === 0) {
          services = ['Réparation téléphone'];
        }
        
        if (specialties.length === 0) {
          specialties = ['Tout mobile'];
        }

        // Transformer les données CSV en format base de données
        const repairerData = {
          name: item.name,
          address: item.address || 'Adresse non renseignée',
          city: item.city,
          postal_code: item.postal_code || '00000',
          phone: item.phone || null,
          email: item.email || null,
          website: item.website || null,
          services: services,
          specialties: specialties,
          price_range: ['low', 'medium', 'high'].includes(item.price_range) ? item.price_range : 'medium',
          lat: item.lat ? parseFloat(item.lat) : null,
          lng: item.lng ? parseFloat(item.lng) : null,
          source: 'csv_import',
          is_verified: false,
          department: (item.postal_code || '00000').substring(0, 2),
          region: 'France',
          rating: null,
          review_count: 0,
          scraped_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log(`📝 Données formatées pour item ${i + 1}:`, repairerData);

        // Vérifier si le réparateur existe déjà
        const { data: existing, error: searchError } = await supabase
          .from('repairers')
          .select('id')
          .eq('name', repairerData.name)
          .eq('postal_code', repairerData.postal_code)
          .maybeSingle();

        if (searchError) {
          console.error(`❌ Erreur recherche existing item ${i + 1}:`, searchError);
          continue;
        }

        if (existing) {
          console.log(`🔄 Mise à jour item ${i + 1} (ID: ${existing.id})`);
          // Mise à jour
          const { error: updateError } = await supabase
            .from('repairers')
            .update({
              ...repairerData,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);

          if (updateError) {
            console.error(`❌ Erreur mise à jour item ${i + 1}:`, updateError);
          } else {
            console.log(`✅ Item ${i + 1} mis à jour avec succès`);
            savedCount++;
          }
        } else {
          console.log(`➕ Insertion item ${i + 1}`);
          // Insertion
          const { error: insertError } = await supabase
            .from('repairers')
            .insert(repairerData);

          if (insertError) {
            console.error(`❌ Erreur insertion item ${i + 1}:`, insertError);
          } else {
            console.log(`✅ Item ${i + 1} inséré avec succès`);
            savedCount++;
          }
        }

      } catch (error) {
        console.error(`💥 Erreur complète pour item ${i + 1}:`, error);
      }
    }

    console.log(`📊 Résultat final: ${savedCount}/${csvData.length} éléments sauvegardés`);
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
    console.log('📋 Génération du modèle CSV');
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

          <div className="flex gap-2">
            <Button 
              onClick={downloadTemplate}
              variant="outline"
              size="sm"
            >
              📋 Télécharger le modèle CSV
            </Button>
            
            {importFile && (
              <div className="text-sm text-gray-600 flex items-center">
                📄 Fichier sélectionné: {importFile.name} ({Math.round(importFile.size / 1024)} KB)
              </div>
            )}
          </div>

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

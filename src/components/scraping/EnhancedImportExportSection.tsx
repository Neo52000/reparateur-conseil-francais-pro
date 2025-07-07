import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Upload, 
  Download, 
  FileText, 
  Database, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  MapPin,
  Settings
} from 'lucide-react';
import CSVPreviewStep from './CSVPreviewStep';
import CSVMappingStep from './CSVMappingStep';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  search_keywords: string[];
  scraping_prompts: any;
}

interface EnhancedImportExportSectionProps {
  categories: BusinessCategory[];
  selectedCategory: BusinessCategory;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

interface ColumnMapping {
  csvColumn: string;
  dbColumn: string;
  required: boolean;
  detected: boolean;
  transform?: string;
}

interface ImportStats {
  processed: number;
  imported: number;
  geocoded: number;
  aiEnhanced: number;
  errors: string[];
}

const EnhancedImportExportSection: React.FC<EnhancedImportExportSectionProps> = ({
  categories,
  selectedCategory,
  isLoading,
  onLoadingChange
}) => {
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'mapping' | 'import' | 'results'>('upload');
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [encoding, setEncoding] = useState<'utf-8' | 'iso-8859-1'>('utf-8');
  const [enableAI, setEnableAI] = useState(true);
  const [enableGeocoding, setEnableGeocoding] = useState(true);
  const [exportCategory, setExportCategory] = useState<'current' | 'all'>('current');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier CSV",
        variant: "destructive"
      });
      return;
    }

    setCsvFile(file);
    setImportStep('preview');
  };

  const executeImport = async (finalMappings: ColumnMapping[], options: { enableAI: boolean; enableGeocoding: boolean }) => {
    if (!csvFile || !csvData) return;

    onLoadingChange(true);
    setImportStep('import');

    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('mappings', JSON.stringify(finalMappings));
      formData.append('categoryId', selectedCategory.id);
      formData.append('enableAI', options.enableAI.toString());
      formData.append('enableGeocoding', options.enableGeocoding.toString());
      formData.append('separator', csvData.separator);
      formData.append('encoding', csvData.encoding);

      const { data, error } = await supabase.functions.invoke('csv-intelligent-import', {
        body: formData
      });

      if (error) throw error;

      setImportStats({
        processed: data.processed || 0,
        imported: data.imported || 0,
        geocoded: data.geocoded || 0,
        aiEnhanced: data.aiEnhanced || 0,
        errors: data.errors || []
      });

      setImportStep('results');

      toast({
        title: "Import réussi",
        description: `${data.imported || 0} réparateurs importés avec succès`
      });

    } catch (error: any) {
      console.error('Erreur import:', error);
      toast({
        title: "Erreur d'import",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      onLoadingChange(false);
    }
  };

  const exportData = async () => {
    try {
      let query = supabase.from('repairers').select('*');
      
      if (exportCategory === 'current') {
        query = query.eq('business_category_id', selectedCategory.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "Aucune donnée",
          description: exportCategory === 'current' 
            ? "Aucun réparateur trouvé pour cette catégorie"
            : "Aucun réparateur trouvé dans la base",
          variant: "destructive"
        });
        return;
      }

      // Utiliser Papa Parse pour l'export
      const { default: Papa } = await import('papaparse');
      
      const exportData = data.map(row => ({
        Nom: row.name || '',
        Adresse: row.address || '',
        Ville: row.city || '',
        'Code postal': row.postal_code || '',
        Téléphone: row.phone || '',
        Email: row.email || '',
        'Site web': row.website || '',
        Description: row.description || '',
        Latitude: row.lat || '',
        Longitude: row.lng || '',
        Source: row.source || '',
        'Note qualité': row.data_quality_score || '',
        Vérifié: row.is_verified ? 'Oui' : 'Non'
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repairers-${exportCategory}-${Date.now()}.csv`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: `${data.length} réparateurs exportés`
      });

    } catch (error: any) {
      console.error('Erreur export:', error);
      toast({
        title: "Erreur d'export",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetImport = () => {
    setCsvFile(null);
    setCsvData(null);
    setMappings([]);
    setImportStats(null);
    setImportStep('upload');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import">Import CSV</TabsTrigger>
          <TabsTrigger value="export">Export CSV</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-admin-blue" />
                Import CSV avec Aperçu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {importStep === 'upload' && (
                <>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="encoding">Encodage du fichier</Label>
                      <Select value={encoding} onValueChange={(value: any) => setEncoding(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utf-8">UTF-8 (Recommandé)</SelectItem>
                          <SelectItem value="iso-8859-1">ISO-8859-1 (Windows)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="csv-file">Fichier CSV</Label>
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Formats supportés: .csv avec séparateurs variés (détection automatique)
                      </p>
                    </div>

                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Nouveau:</strong> Aperçu du fichier avant mapping des colonnes ! 
                        Le système détecte automatiquement les séparateurs et vous permet de les ajuster.
                      </AlertDescription>
                    </Alert>
                  </div>
                </>
              )}

              {importStep === 'preview' && csvFile && (
                <CSVPreviewStep
                  file={csvFile}
                  encoding={encoding}
                  onNext={(data) => {
                    setCsvData(data);
                    setImportStep('mapping');
                  }}
                  onBack={() => setImportStep('upload')}
                />
              )}

              {importStep === 'mapping' && csvData && (
                <CSVMappingStep
                  csvData={csvData}
                  selectedCategory={selectedCategory}
                  onNext={(mappings, options) => {
                    setMappings(mappings);
                    setEnableAI(options.enableAI);
                    setEnableGeocoding(options.enableGeocoding);
                    executeImport(mappings, options);
                  }}
                  onBack={() => setImportStep('preview')}
                />
              )}

              {importStep === 'mapping' && !csvData && (
                <div className="text-center p-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Retournez à l'étape précédente pour charger un fichier.</p>
                  <Button onClick={() => setImportStep('upload')} variant="outline" className="mt-4">
                    Retour à l'upload
                  </Button>
                </div>
              )}

              {importStep === 'import' && (
                <div className="text-center p-8">
                  <Database className="h-12 w-12 mx-auto text-admin-blue animate-pulse mb-4" />
                  <h4 className="font-semibold mb-2">Import en cours...</h4>
                  <p className="text-sm text-muted-foreground">
                    Parsing, mapping, géocodage et amélioration IA
                  </p>
                </div>
              )}

              {importStep === 'results' && importStats && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-600">Import terminé avec succès</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-admin-blue">{importStats.processed}</div>
                      <div className="text-xs text-muted-foreground">Traités</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{importStats.imported}</div>
                      <div className="text-xs text-muted-foreground">Importés</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">{importStats.geocoded}</div>
                      <div className="text-xs text-muted-foreground">Géocodés</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{importStats.aiEnhanced}</div>
                      <div className="text-xs text-muted-foreground">IA améliorés</div>
                    </div>
                  </div>

                  {importStats.errors.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Erreurs ({importStats.errors.length}):</strong>
                        <ul className="mt-1 text-xs">
                          {importStats.errors.slice(0, 5).map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                          {importStats.errors.length > 5 && (
                            <li>• ... et {importStats.errors.length - 5} autres</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button onClick={resetImport} className="w-full">
                    Nouvel import
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2 text-green-600" />
                Export des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="export-scope">Périmètre d'export</Label>
                <Select value={exportCategory} onValueChange={(value: any) => setExportCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Catégorie actuelle: {selectedCategory.name}</SelectItem>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">
                    Export {exportCategory === 'current' ? selectedCategory.name : 'Multi-catégories'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Télécharger les données au format CSV avec métadonnées complètes
                  </p>
                </div>
                <Button 
                  onClick={exportData}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter CSV
                </Button>
              </div>

              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  L'export inclut: Nom, Adresse, Ville, Code postal, Téléphone, Email, Site web, 
                  Description, Coordonnées GPS, Source, Note qualité, Status de vérification.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedImportExportSection;
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
  transform?: string; // "split_postal_city" | "extract_postal" | "extract_city"
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
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'import' | 'results'>('upload');
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [separator, setSeparator] = useState<'auto' | ',' | ';' | '\t'>('auto');
  const [encoding, setEncoding] = useState<'utf-8' | 'iso-8859-1'>('utf-8');
  const [enableAI, setEnableAI] = useState(true);
  const [enableGeocoding, setEnableGeocoding] = useState(true);
  const [exportCategory, setExportCategory] = useState<'current' | 'all'>('current');

  // Colonnes de la base de données avec détection améliorée
  const dbColumns = [
    { 
      key: 'name', 
      label: 'Nom', 
      required: true,
      patterns: ['nom', 'name', 'titre', 'title', 'entreprise', 'company', 'enseigne']
    },
    { 
      key: 'address', 
      label: 'Adresse', 
      required: true,
      patterns: ['adresse', 'address', 'rue', 'street', 'addr']
    },
    { 
      key: 'phone', 
      label: 'Téléphone', 
      required: false,
      patterns: ['tel', 'phone', 'telephone', 'mobile', 'gsm']
    },
    { 
      key: 'email', 
      label: 'Email', 
      required: false,
      patterns: ['email', 'mail', 'e-mail', 'courriel']
    },
    { 
      key: 'website', 
      label: 'Site web', 
      required: false,
      patterns: ['site', 'url', 'website', 'web', 'www']
    },
    { 
      key: 'description', 
      label: 'Description', 
      required: false,
      patterns: ['description', 'desc', 'activite', 'services', 'presentation']
    },
    { 
      key: 'postal_code', 
      label: 'Code postal', 
      required: false,
      patterns: ['postal', 'cp', 'code_postal', 'zip']
    },
    { 
      key: 'city', 
      label: 'Ville', 
      required: false,
      patterns: ['ville', 'city', 'commune', 'localite']
    },
    { 
      key: 'postal_city', 
      label: 'Code postal + Ville', 
      required: false,
      patterns: ['postal_city', 'cp_ville', 'code_ville'],
      transform: 'split_postal_city'
    }
  ];

  // Fonction de détection intelligente des séparateurs
  const detectSeparator = (text: string): string => {
    const firstLine = text.split('\n')[0];
    const separators = ['\t', ';', ','];
    
    let bestSeparator = ',';
    let maxColumns = 0;
    
    for (const sep of separators) {
      const columns = firstLine.split(sep).length;
      if (columns > maxColumns) {
        maxColumns = columns;
        bestSeparator = sep;
      }
    }
    
    return bestSeparator;
  };

  // Fonction de parsing CSV intelligent
  const parseCSVIntelligent = (text: string, detectedSeparator?: string): { headers: string[], rows: any[] } => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return { headers: [], rows: [] };

    const sep = detectedSeparator || detectSeparator(text);
    
    // Extraire les en-têtes
    const headers = lines[0].split(sep).map(h => h.trim().replace(/['"]/g, ''));
    
    // Parser les lignes de données
    const rows = lines.slice(1).map(line => {
      const values = line.split(sep).map(v => v.trim().replace(/['"]/g, ''));
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });

    return { headers, rows };
  };

  // Fonction de mapping automatique améliorée
  const createAutoMappings = (headers: string[]): ColumnMapping[] => {
    return dbColumns.map(dbCol => {
      const detectedHeader = headers.find(header => {
        const headerLower = header.toLowerCase();
        return dbCol.patterns?.some(pattern => 
          headerLower.includes(pattern) || pattern.includes(headerLower)
        );
      });

      return {
        csvColumn: detectedHeader || '',
        dbColumn: dbCol.key,
        required: dbCol.required,
        detected: !!detectedHeader,
        transform: dbCol.transform
      };
    });
  };

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
    
    try {
      // Lire le fichier avec l'encodage sélectionné
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder(encoding);
      const text = decoder.decode(arrayBuffer);
      
      // Parser intelligemment
      const { headers, rows } = parseCSVIntelligent(text);
      
      if (headers.length === 0) {
        toast({
          title: "Erreur de parsing",
          description: "Impossible de détecter les colonnes du fichier CSV",
          variant: "destructive"
        });
        return;
      }

      setCsvHeaders(headers);
      
      // Créer les mappings automatiques
      const autoMappings = createAutoMappings(headers);
      setMappings(autoMappings);
      
      // Aperçu des données (5 premières lignes)
      setPreview(rows.slice(0, 5));
      setImportStep('mapping');

      toast({
        title: "Fichier analysé",
        description: `${headers.length} colonnes et ${rows.length} lignes détectées`
      });

    } catch (error) {
      console.error('Erreur parsing CSV:', error);
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire le fichier. Vérifiez l'encodage.",
        variant: "destructive"
      });
    }
  };

  const handleQuickImport = async () => {
    // Import rapide des données de test fournies par l'utilisateur
    const testData = `RC Informatique	6 place des Halles	03000 Moulins
Phones Parts	5 rue Faubourg St Pierre	03100 Montluçon
L'Atelier Du Smartphone Vichy	8 rue Burnol	03200 Vichy
L'Atelier Du Smartphone Montluçon	36 boulevard Courtais	03100 Montluçon
Repar'Mobile Montluçon	3 avenue de la République	03100 Montluçon
Ok Computer 03	13 rue Lamartine	03400 Yzeure
HK Téléphonie	8 place Mar Foch	03500 Saint-Pourçain-sur-Sioule
Welcom Vichy	3 rue Hôtel des Postes	03200 Vichy
Atelier Réparation Téléphone ART	11 rue 29 Juillet	03300 Cusset
Welcom Montluçon Centre Nord	Ccial Carrefour quai Ledru Rollin	03100 Montluçon
Shop in Shop PSM Welcom Domérat	Ccal Auchan Terre 65 av. des Martyrs	03410 Domérat`;

    onLoadingChange(true);
    setImportStep('import');

    try {
      const lines = testData.split('\n');
      const processedData = lines.map(line => {
        const [name, address, postalCity] = line.split('\t');
        const postalMatch = postalCity.match(/^(\d{5})\s+(.+)$/);
        
        return {
          name: name.trim(),
          address: address.trim(),
          postal_code: postalMatch ? postalMatch[1] : '',
          city: postalMatch ? postalMatch[2] : postalCity,
          source: 'quick_import',
          business_category_id: selectedCategory.id
        };
      });

      // Utiliser l'edge function pour l'import avec IA et géocodage
      const { data, error } = await supabase.functions.invoke('csv-intelligent-import', {
        body: {
          providedData: processedData,
          categoryId: selectedCategory.id,
          enableAI,
          enableGeocoding
        }
      });

      if (error) throw error;

      setImportStats({
        processed: processedData.length,
        imported: data.imported || 0,
        geocoded: data.geocoded || 0,
        aiEnhanced: data.aiEnhanced || 0,
        errors: data.errors || []
      });

      setImportStep('results');

      toast({
        title: "Import rapide réussi",
        description: `${data.imported || 0} réparateurs importés avec améliorations`
      });

    } catch (error: any) {
      console.error('Erreur import rapide:', error);
      toast({
        title: "Erreur d'import",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      onLoadingChange(false);
    }
  };

  const executeImport = async () => {
    if (!csvFile) return;

    onLoadingChange(true);
    setImportStep('import');

    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('mappings', JSON.stringify(mappings.filter(m => m.csvColumn)));
      formData.append('categoryId', selectedCategory.id);
      formData.append('enableAI', enableAI.toString());
      formData.append('enableGeocoding', enableGeocoding.toString());
      formData.append('separator', separator);
      formData.append('encoding', encoding);

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
    setCsvHeaders([]);
    setMappings([]);
    setPreview([]);
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
                Import CSV Intelligent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {importStep === 'upload' && (
                <>
                  {/* Import rapide des données de test */}
                  <div className="p-4 bg-admin-blue-light/10 border border-admin-blue-light rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-admin-blue" />
                      Import rapide - Données de test
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Importez directement les 11 réparateurs de l'Allier fournis avec géocodage et amélioration IA
                    </p>
                    <Button 
                      onClick={handleQuickImport}
                      disabled={isLoading}
                      className="bg-admin-blue hover:bg-admin-blue/90"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Import rapide (11 réparateurs)
                    </Button>
                  </div>

                  {/* Upload de fichier */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="separator">Séparateur</Label>
                        <Select value={separator} onValueChange={(value: any) => setSeparator(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Détection automatique</SelectItem>
                            <SelectItem value=",">Virgule (,)</SelectItem>
                            <SelectItem value=";">Point-virgule (;)</SelectItem>
                            <SelectItem value="\t">Tabulation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="encoding">Encodage</Label>
                        <Select value={encoding} onValueChange={(value: any) => setEncoding(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utf-8">UTF-8</SelectItem>
                            <SelectItem value="iso-8859-1">ISO-8859-1 (Latin1)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="enable-ai"
                          checked={enableAI}
                          onCheckedChange={(checked) => setEnableAI(checked === true)}
                        />
                        <Label htmlFor="enable-ai" className="flex items-center">
                          <Sparkles className="h-4 w-4 mr-1" />
                          Amélioration IA
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="enable-geocoding"
                          checked={enableGeocoding}
                          onCheckedChange={(checked) => setEnableGeocoding(checked === true)}
                        />
                        <Label htmlFor="enable-geocoding" className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Géocodage
                        </Label>
                      </div>
                    </div>

                    <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <Label htmlFor="csv-upload" className="cursor-pointer">
                        <span className="text-sm font-medium">Cliquez pour sélectionner un fichier CSV</span>
                        <Input
                          id="csv-upload"
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports: CSV avec séparateurs variés, encodages UTF-8/Latin1
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Formats supportés:</strong> Nom, Adresse, Code postal + Ville (même colonne), 
                      Téléphone, Email, Site web. Détection automatique des colonnes.
                    </AlertDescription>
                  </Alert>
                </>
              )}

              {importStep === 'mapping' && (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Configuration du mapping</h4>
                    <Badge variant="outline">{csvHeaders.length} colonnes détectées</Badge>
                  </div>

                  <div className="space-y-3">
                    {mappings.map((mapping) => (
                      <div key={mapping.dbColumn} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Label className="font-medium">{mapping.dbColumn}</Label>
                            {mapping.required && <Badge variant="destructive" className="text-xs">Obligatoire</Badge>}
                            {mapping.detected && <CheckCircle className="h-4 w-4 text-admin-green" />}
                            {mapping.transform && <Badge variant="outline" className="text-xs">Transform</Badge>}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <Select
                            value={mapping.csvColumn}
                            onValueChange={(value) => {
                              setMappings(prev => prev.map(m => 
                                m.dbColumn === mapping.dbColumn 
                                  ? { ...m, csvColumn: value, detected: !!value }
                                  : m
                              ));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une colonne" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Aucune colonne</SelectItem>
                              {csvHeaders.map(header => (
                                <SelectItem key={header} value={header}>{header}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {preview.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Aperçu des données</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-48">
                          <table className="w-full text-xs">
                            <thead className="bg-muted">
                              <tr>
                                {csvHeaders.map(header => (
                                  <th key={header} className="p-2 text-left font-medium">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {preview.map((row, index) => (
                                <tr key={index} className="border-t">
                                  {csvHeaders.map(header => (
                                    <td key={header} className="p-2 truncate max-w-32">
                                      {row[header]}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button onClick={resetImport} variant="outline">
                      Retour
                    </Button>
                    <Button 
                      onClick={executeImport}
                      disabled={isLoading}
                      className="bg-admin-blue hover:bg-admin-blue/90"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Lancer l'import
                    </Button>
                  </div>
                </>
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
                  <h4 className="font-semibold text-admin-green">Import terminé avec succès</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-admin-blue-light/10 rounded-lg text-center">
                      <div className="text-2xl font-bold text-admin-blue">{importStats.processed}</div>
                      <div className="text-xs text-muted-foreground">Traités</div>
                    </div>
                    <div className="p-3 bg-admin-green-light/10 rounded-lg text-center">
                      <div className="text-2xl font-bold text-admin-green">{importStats.imported}</div>
                      <div className="text-xs text-muted-foreground">Importés</div>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">{importStats.geocoded}</div>
                      <div className="text-xs text-muted-foreground">Géocodés</div>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg text-center">
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
                <Download className="h-5 w-5 mr-2 text-admin-green" />
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
                  className="border-admin-green text-admin-green hover:bg-admin-green-light"
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
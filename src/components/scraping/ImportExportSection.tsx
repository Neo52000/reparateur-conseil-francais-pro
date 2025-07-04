import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Download, 
  FileText, 
  Database, 
  ArrowRight,
  CheckCircle,
  AlertCircle
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

interface ImportExportSectionProps {
  category: BusinessCategory;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

interface ColumnMapping {
  csvColumn: string;
  dbColumn: string;
  required: boolean;
  detected: boolean;
}

const ImportExportSection: React.FC<ImportExportSectionProps> = ({
  category,
  isLoading,
  onLoadingChange
}) => {
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'import'>('upload');

  // Colonnes de la base de données repairers
  const dbColumns = [
    { key: 'name', label: 'Nom', required: true },
    { key: 'address', label: 'Adresse', required: true },
    { key: 'phone', label: 'Téléphone', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'website', label: 'Site web', required: false },
    { key: 'description', label: 'Description', required: false },
    { key: 'postal_code', label: 'Code postal', required: false },
    { key: 'city', label: 'Ville', required: false },
    { key: 'lat', label: 'Latitude', required: false },
    { key: 'lng', label: 'Longitude', required: false }
  ];

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
    
    // Lire le fichier CSV
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      toast({
        title: "Erreur",
        description: "Le fichier CSV doit contenir au moins un en-tête et une ligne de données",
        variant: "destructive"
      });
      return;
    }

    // Extraire les en-têtes
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    setCsvHeaders(headers);

    // Créer les mappings automatiques
    const autoMappings = dbColumns.map(dbCol => {
      const detectedHeader = headers.find(header => 
        header.toLowerCase().includes(dbCol.key.toLowerCase()) ||
        dbCol.label.toLowerCase().includes(header.toLowerCase()) ||
        (dbCol.key === 'name' && (header.toLowerCase().includes('nom') || header.toLowerCase().includes('title'))) ||
        (dbCol.key === 'address' && (header.toLowerCase().includes('adresse') || header.toLowerCase().includes('address'))) ||
        (dbCol.key === 'phone' && (header.toLowerCase().includes('tel') || header.toLowerCase().includes('phone'))) ||
        (dbCol.key === 'email' && header.toLowerCase().includes('mail')) ||
        (dbCol.key === 'website' && (header.toLowerCase().includes('site') || header.toLowerCase().includes('url')))
      );

      return {
        csvColumn: detectedHeader || '',
        dbColumn: dbCol.key,
        required: dbCol.required,
        detected: !!detectedHeader
      };
    });

    setMappings(autoMappings);

    // Créer un aperçu des données
    const previewData = lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });

    setPreview(previewData);
    setImportStep('mapping');
  };

  const updateMapping = (dbColumn: string, csvColumn: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.dbColumn === dbColumn 
        ? { ...mapping, csvColumn, detected: !!csvColumn }
        : mapping
    ));
  };

  const validateMappings = () => {
    const requiredMappings = mappings.filter(m => m.required);
    const missingRequired = requiredMappings.filter(m => !m.csvColumn);
    
    if (missingRequired.length > 0) {
      toast({
        title: "Mappings incomplets",
        description: `Les colonnes suivantes sont obligatoires : ${missingRequired.map(m => m.dbColumn).join(', ')}`,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const executeImport = async () => {
    if (!validateMappings() || !csvFile) return;

    onLoadingChange(true);
    setImportStep('import');

    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('mappings', JSON.stringify(mappings.filter(m => m.csvColumn)));
      formData.append('categoryId', category.id);
      formData.append('enableAI', 'true');
      formData.append('enableGeocoding', 'true');

      // Utiliser la nouvelle edge function CSV intelligente
      const { data, error } = await supabase.functions.invoke('csv-intelligent-import', {
        body: formData
      });

      if (error) {
        throw new Error(error.message || 'Erreur lors de l\'import');
      }

      toast({
        title: "Import réussi",
        description: `${data.imported || 0} réparateurs importés avec succès (${data.processed || 0} traités)`
      });

      // Reset
      setCsvFile(null);
      setCsvHeaders([]);
      setMappings([]);
      setPreview([]);
      setImportStep('upload');

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
      const { data, error } = await supabase
        .from('repairers')
        .select('*')
        .eq('business_category_id', category.id);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "Aucune donnée",
          description: "Aucun réparateur trouvé pour cette catégorie",
          variant: "destructive"
        });
        return;
      }

      // Créer le CSV
      const headers = ['name', 'address', 'phone', 'email', 'website', 'description', 'city', 'postal_code', 'lat', 'lng'];
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${category.name.toLowerCase()}-export-${Date.now()}.csv`;
      a.click();
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

  return (
    <div className="space-y-6">
      {/* Section Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2 text-admin-blue" />
            Import CSV avec Mapping Intelligent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {importStep === 'upload' && (
            <>
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
                  Format attendu : CSV avec en-têtes
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Optimisé pour {category.name}:</strong> Le mapping détectera automatiquement 
                  les colonnes correspondantes. L'IA améliorera les données après import.
                </AlertDescription>
              </Alert>
            </>
          )}

          {importStep === 'mapping' && (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Mapping des colonnes</h4>
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
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <select
                        value={mapping.csvColumn}
                        onChange={(e) => updateMapping(mapping.dbColumn, e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Aucune colonne</option>
                        {csvHeaders.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
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
                <Button 
                  onClick={() => setImportStep('upload')}
                  variant="outline"
                >
                  Retour
                </Button>
                <Button 
                  onClick={executeImport}
                  disabled={isLoading}
                  className="bg-admin-blue hover:bg-admin-blue/90"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Importer avec IA
                </Button>
              </div>
            </>
          )}

          {importStep === 'import' && (
            <div className="text-center p-8">
              <Database className="h-12 w-12 mx-auto text-admin-blue animate-pulse mb-4" />
              <h4 className="font-semibold mb-2">Import en cours...</h4>
              <p className="text-sm text-muted-foreground">
                Import, géocodage et amélioration IA des données
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2 text-admin-green" />
            Export des Données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Exporter {category.name}</h4>
              <p className="text-sm text-muted-foreground">
                Télécharger toutes les données de cette catégorie au format CSV
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportExportSection;
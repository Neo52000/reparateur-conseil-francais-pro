import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  MapPin,
  Settings,
  Eye,
  Shuffle
} from 'lucide-react';

interface CSVMappingStepProps {
  csvData: ParsedCSVData;
  selectedCategory: any;
  onNext: (mappings: ColumnMapping[], options: ImportOptions) => void;
  onBack: () => void;
}

interface ParsedCSVData {
  headers: string[];
  rows: any[];
  separator: string;
  encoding: string;
  preview: any[];
}

interface ColumnMapping {
  csvColumn: string;
  dbColumn: string;
  required: boolean;
  detected: boolean;
  transform?: string;
}

interface ImportOptions {
  enableAI: boolean;
  enableGeocoding: boolean;
}

interface DBColumn {
  key: string;
  label: string;
  required: boolean;
  patterns: string[];
  transform?: string;
}

const CSVMappingStep: React.FC<CSVMappingStepProps> = ({
  csvData,
  selectedCategory,
  onNext,
  onBack
}) => {
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [enableAI, setEnableAI] = useState(true);
  const [enableGeocoding, setEnableGeocoding] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Colonnes de la base de données avec patterns de détection améliorés
  const dbColumns: DBColumn[] = [
    { 
      key: 'name', 
      label: 'Nom *', 
      required: true,
      patterns: ['nom', 'name', 'titre', 'title', 'entreprise', 'company', 'enseigne', 'raison']
    },
    { 
      key: 'address', 
      label: 'Adresse *', 
      required: true,
      patterns: ['adresse', 'address', 'rue', 'street', 'addr', 'voie']
    },
    { 
      key: 'phone', 
      label: 'Téléphone', 
      required: false,
      patterns: ['tel', 'phone', 'telephone', 'mobile', 'gsm', 'portable']
    },
    { 
      key: 'email', 
      label: 'Email', 
      required: false,
      patterns: ['email', 'mail', 'e-mail', 'courriel', '@']
    },
    { 
      key: 'website', 
      label: 'Site web', 
      required: false,
      patterns: ['site', 'url', 'website', 'web', 'www', 'http']
    },
    { 
      key: 'description', 
      label: 'Description', 
      required: false,
      patterns: ['description', 'desc', 'activite', 'services', 'presentation', 'commentaire']
    },
    { 
      key: 'postal_code', 
      label: 'Code postal', 
      required: false,
      patterns: ['postal', 'cp', 'code_postal', 'zip', 'code']
    },
    { 
      key: 'city', 
      label: 'Ville', 
      required: false,
      patterns: ['ville', 'city', 'commune', 'localite', 'agglomeration']
    },
    { 
      key: 'postal_city', 
      label: 'Code postal + Ville', 
      required: false,
      patterns: ['postal_city', 'cp_ville', 'code_ville', 'ville_complete'],
      transform: 'split_postal_city'
    }
  ];

  // Fonction de détection intelligente améliorée
  const createAutoMappings = (): ColumnMapping[] => {
    return dbColumns.map(dbCol => {
      // Recherche par pattern exact
      let detectedHeader = csvData.headers.find(header => {
        const headerLower = header.toLowerCase().trim();
        return dbCol.patterns.some(pattern => 
          headerLower === pattern || 
          headerLower.includes(pattern) || 
          pattern.includes(headerLower)
        );
      });

      // Si pas trouvé, recherche par similarité
      if (!detectedHeader) {
        detectedHeader = csvData.headers.find(header => {
          const headerLower = header.toLowerCase().trim();
          return dbCol.patterns.some(pattern => {
            // Similarité approximative
            const similarity = calculateSimilarity(headerLower, pattern);
            return similarity > 0.7;
          });
        });
      }

      // Détection spéciale pour code postal + ville
      if (dbCol.key === 'postal_city' && !detectedHeader) {
        detectedHeader = csvData.headers.find(header => {
          const sampleValue = csvData.preview[0]?.[header];
          if (sampleValue) {
            // Recherche pattern "12345 VilleName"
            return /^\d{5}\s+\w+/.test(sampleValue.toString().trim());
          }
          return false;
        });
      }

      return {
        csvColumn: detectedHeader || '',
        dbColumn: dbCol.key,
        required: dbCol.required,
        detected: !!detectedHeader,
        transform: dbCol.transform
      };
    });
  };

  // Fonction de calcul de similarité simple
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  // Distance de Levenshtein simplifiée
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  // Initialiser les mappings automatiques
  useEffect(() => {
    const autoMappings = createAutoMappings();
    setMappings(autoMappings);
  }, [csvData]);

  // Mettre à jour un mapping
  const updateMapping = (dbColumn: string, csvColumn: string) => {
    const finalCsvColumn = csvColumn === 'none' ? '' : csvColumn;
    setMappings(prev => prev.map(mapping => 
      mapping.dbColumn === dbColumn 
        ? { ...mapping, csvColumn: finalCsvColumn, detected: finalCsvColumn !== '' }
        : mapping
    ));
  };

  // Validation des mappings requis
  const validateMappings = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const requiredMappings = mappings.filter(m => m.required);
    
    for (const mapping of requiredMappings) {
      if (!mapping.csvColumn) {
        const dbCol = dbColumns.find(col => col.key === mapping.dbColumn);
        errors.push(`Le champ "${dbCol?.label}" est obligatoire`);
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  // Aperçu des transformations
  const getTransformPreview = (mapping: ColumnMapping): string => {
    if (!mapping.csvColumn || !mapping.transform) return '';
    
    const sampleValue = csvData.preview[0]?.[mapping.csvColumn];
    if (!sampleValue) return '';
    
    switch (mapping.transform) {
      case 'split_postal_city':
        const match = sampleValue.toString().match(/^(\d{5})\s+(.+)$/);
        return match ? `${match[1]} → ${match[2]}` : 'Pas de match';
      default:
        return sampleValue.toString().substring(0, 30);
    }
  };

  const handleNext = () => {
    const validation = validateMappings();
    if (!validation.isValid) {
      return; // Les erreurs sont affichées dans l'UI
    }
    
    onNext(mappings.filter(m => m.csvColumn), { enableAI, enableGeocoding });
  };

  const { isValid, errors } = validateMappings();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Shuffle className="h-5 w-5 mr-2 text-admin-blue" />
              Configuration du mapping des colonnes
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Masquer' : 'Voir'} aperçu
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistiques de détection */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-semibold text-green-600">
                {mappings.filter(m => m.detected).length}
              </div>
              <div className="text-xs text-green-600">Auto-détectées</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-lg font-semibold text-orange-600">
                {mappings.filter(m => m.required && !m.csvColumn).length}
              </div>
              <div className="text-xs text-orange-600">Manquantes requises</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-lg font-semibold text-admin-blue">
                {mappings.filter(m => m.csvColumn).length}
              </div>
              <div className="text-xs text-admin-blue">Total mappées</div>
            </div>
          </div>

          {/* Mapping des colonnes */}
          <div className="space-y-4">
            <h4 className="font-medium">Associer les colonnes CSV aux champs de la base</h4>
            
            <div className="space-y-3">
              {mappings.map(mapping => {
                const dbCol = dbColumns.find(col => col.key === mapping.dbColumn);
                return (
                  <div key={mapping.dbColumn} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dbCol?.label}</span>
                        {mapping.required && (
                          <Badge variant="destructive" className="text-xs">Requis</Badge>
                        )}
                        {mapping.detected && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Auto
                          </Badge>
                        )}
                      </div>
                      {mapping.transform && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Transformation: {mapping.transform}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <Select
                        value={mapping.csvColumn}
                        onValueChange={(value) => updateMapping(mapping.dbColumn, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une colonne CSV" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucune colonne</SelectItem>
                          {csvData.headers.map(header => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {mapping.csvColumn && (
                      <div className="flex-1 text-sm text-muted-foreground">
                        Exemple: {getTransformPreview(mapping) || csvData.preview[0]?.[mapping.csvColumn]?.toString().substring(0, 30) || '-'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Options d'import */}
          <div className="space-y-4">
            <h4 className="font-medium">Options d'amélioration</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Checkbox
                  id="enable-ai"
                  checked={enableAI}
                  onCheckedChange={(checked) => setEnableAI(checked === true)}
                />
                <div className="flex-1">
                  <label htmlFor="enable-ai" className="flex items-center font-medium cursor-pointer">
                    <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                    Amélioration IA
                  </label>
                  <div className="text-xs text-muted-foreground">
                    Enrichir descriptions et services automatiquement
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Checkbox
                  id="enable-geo"
                  checked={enableGeocoding}
                  onCheckedChange={(checked) => setEnableGeocoding(checked === true)}
                />
                <div className="flex-1">
                  <label htmlFor="enable-geo" className="flex items-center font-medium cursor-pointer">
                    <MapPin className="h-4 w-4 mr-2 text-green-600" />
                    Géocodage automatique
                  </label>
                  <div className="text-xs text-muted-foreground">
                    Récupérer coordonnées GPS des adresses
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Aperçu des données mappées */}
          {showPreview && (
            <div className="space-y-2">
              <h4 className="font-medium">Aperçu des données mappées</h4>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {mappings.filter(m => m.csvColumn).map(mapping => {
                          const dbCol = dbColumns.find(col => col.key === mapping.dbColumn);
                          return (
                            <th key={mapping.dbColumn} className="p-2 text-left font-medium border-r">
                              {dbCol?.label}
                              <div className="text-xs font-normal text-muted-foreground">
                                ← {mapping.csvColumn}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.preview.slice(0, 3).map((row, index) => (
                        <tr key={index} className="border-t">
                          {mappings.filter(m => m.csvColumn).map(mapping => (
                            <td key={mapping.dbColumn} className="p-2 border-r">
                              <div className="max-w-32 truncate">
                                {mapping.transform === 'split_postal_city' ? 
                                  getTransformPreview(mapping) : 
                                  row[mapping.csvColumn] || '-'
                                }
                              </div>
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

          {/* Validation */}
          {!isValid && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Champs manquants:</strong>
                <ul className="list-disc list-inside mt-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <Button 
              onClick={handleNext} 
              disabled={!isValid}
              className="bg-admin-blue hover:bg-admin-blue/90"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Démarrer import
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résumé */}
      {isValid && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Configuration validée!</strong><br />
            {mappings.filter(m => m.csvColumn).length} colonnes mappées pour la catégorie "{selectedCategory.name}".
            {enableAI && ' Amélioration IA activée.'}
            {enableGeocoding && ' Géocodage automatique activé.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CSVMappingStep;
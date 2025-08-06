import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  ArrowRight, 
  RotateCcw, 
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react';

interface CSVPreviewStepProps {
  file: File;
  encoding: string;
  onNext: (csvData: ParsedCSVData) => void;
  onBack: () => void;
}

interface ParsedCSVData {
  headers: string[];
  rows: any[];
  separator: string;
  encoding: string;
  preview: any[];
}

interface SeparatorOption {
  value: string;
  label: string;
  symbol: string;
}

const CSVPreviewStep: React.FC<CSVPreviewStepProps> = ({
  file,
  encoding,
  onNext,
  onBack
}) => {
  const [csvText, setCsvText] = useState<string>('');
  const [selectedSeparator, setSelectedSeparator] = useState<string>('auto');
  const [detectedSeparator, setDetectedSeparator] = useState<string>(',');
  const [parsedData, setParsedData] = useState<ParsedCSVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const separatorOptions: SeparatorOption[] = [
    { value: 'auto', label: 'Détection automatique', symbol: '🔍' },
    { value: ',', label: 'Virgule', symbol: ',' },
    { value: ';', label: 'Point-virgule', symbol: ';' },
    { value: '\t', label: 'Tabulation', symbol: '⇥' },
    { value: '|', label: 'Pipe', symbol: '|' }
  ];

  // Fonction de détection intelligente améliorée
  const detectSeparator = (text: string): string => {
    const lines = text.split('\n').slice(0, 5); // Analyser les 5 premières lignes
    const separators = ['\t', ';', ',', '|'];
    
    let bestSeparator = ',';
    let maxScore = 0;
    
    for (const sep of separators) {
      let score = 0;
      let consistentColumns = true;
      let firstLineColumnCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        const columns = line.split(sep);
        const columnCount = columns.length;
        
        if (i === 0) {
          firstLineColumnCount = columnCount;
        } else if (columnCount !== firstLineColumnCount) {
          consistentColumns = false;
        }
        
        // Bonus pour plus de colonnes et consistance
        score += columnCount;
        if (consistentColumns) score += 10;
      }
      
      // Pénalité si une seule colonne détectée
      if (firstLineColumnCount === 1) score = 0;
      
      if (score > maxScore) {
        maxScore = score;
        bestSeparator = sep;
      }
    }
    
    return bestSeparator;
  };

  // Fonction de parsing CSV robuste
  const parseCSVContent = (text: string, separator: string): { headers: string[], rows: any[] } => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 1) return { headers: [], rows: [] };

    // Parser avec gestion des guillemets
    const parseCSVLine = (line: string, sep: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      let i = 0;
      
      while (i < line.length) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // Double quote escape
            current += '"';
            i += 2;
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
            i++;
          }
        } else if (char === sep && !inQuotes) {
          // Separator found outside quotes
          result.push(current.trim());
          current = '';
          i++;
        } else {
          current += char;
          i++;
        }
      }
      
      result.push(current.trim());
      return result;
    };

    // Extraire les en-têtes
    const headers = parseCSVLine(lines[0], separator).map(h => h.replace(/^["']|["']$/g, ''));
    
    // Parser les lignes de données
    const rows = lines.slice(1).map(line => {
      const values = parseCSVLine(line, separator);
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.replace(/^["']|["']$/g, '') || '';
      });
      return obj;
    });

    return { headers, rows };
  };

  // Charger et analyser le fichier
  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        setError('');
        
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder(encoding);
        const text = decoder.decode(arrayBuffer);
        
        if (!text.trim()) {
          setError('Le fichier semble vide');
          return;
        }
        
        setCsvText(text);
        
        // Détection automatique du séparateur
        const detected = detectSeparator(text);
        setDetectedSeparator(detected);
        
        // Parser avec le séparateur détecté
        const currentSep = selectedSeparator === 'auto' ? detected : selectedSeparator;
        const { headers, rows } = parseCSVContent(text, currentSep);
        
        if (headers.length === 0) {
          setError('Impossible de détecter les colonnes du fichier');
          return;
        }
        
        setParsedData({
          headers,
          rows,
          separator: currentSep,
          encoding,
          preview: rows.slice(0, 10) // 10 premières lignes pour aperçu
        });
        
      } catch (err: any) {
        setError(`Erreur lors de la lecture: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [file, encoding, selectedSeparator]);

  // Re-parser quand le séparateur change
  useEffect(() => {
    if (!csvText) return;
    
    const currentSep = selectedSeparator === 'auto' ? detectedSeparator : selectedSeparator;
    const { headers, rows } = parseCSVContent(csvText, currentSep);
    
    if (headers.length > 0) {
      setParsedData({
        headers,
        rows,
        separator: currentSep,
        encoding,
        preview: rows.slice(0, 10)
      });
    }
  }, [selectedSeparator, detectedSeparator, csvText, encoding]);

  const handleNext = () => {
    if (parsedData) {
      onNext(parsedData);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-blue mx-auto mb-4"></div>
            <p>Analyse du fichier CSV...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={onBack} variant="outline" className="mt-4">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-admin-blue" />
            Aperçu du fichier CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informations du fichier */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-semibold">{file.name}</div>
              <div className="text-xs text-muted-foreground">Fichier</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-semibold">{parsedData?.headers.length || 0}</div>
              <div className="text-xs text-muted-foreground">Colonnes</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-semibold">{parsedData?.rows.length || 0}</div>
              <div className="text-xs text-muted-foreground">Lignes</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-lg font-semibold">{encoding.toUpperCase()}</div>
              <div className="text-xs text-muted-foreground">Encodage</div>
            </div>
          </div>

          {/* Sélecteur de séparateur */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Séparateur détecté/sélectionné</label>
            <div className="flex gap-4 items-center">
              <Select value={selectedSeparator} onValueChange={setSelectedSeparator}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {separatorOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.symbol}</span>
                        <span>{option.label}</span>
                        {option.value === 'auto' && (
                          <Badge variant="secondary" className="text-xs">
                            {detectedSeparator === '\t' ? 'Tab' : detectedSeparator}
                          </Badge>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedSeparator === 'auto' && (
                <Alert className="flex-1">
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    Séparateur détecté automatiquement: <strong>
                      {detectedSeparator === '\t' ? 'Tabulation' : 
                       detectedSeparator === ';' ? 'Point-virgule' : 
                       detectedSeparator === ',' ? 'Virgule' : detectedSeparator}
                    </strong>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Aperçu des données */}
          {parsedData && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Aperçu des données (10 premières lignes)</h4>
                <Badge variant="outline">
                  {parsedData.headers.length} colonnes × {parsedData.preview.length} lignes
                </Badge>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {parsedData.headers.map((header, index) => (
                          <th key={index} className="p-2 text-left font-medium border-r border-muted-foreground/20">
                            {header || `Colonne ${index + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.preview.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-t">
                          {parsedData.headers.map((header, colIndex) => (
                            <td key={colIndex} className="p-2 border-r border-muted-foreground/10">
                              <div className="max-w-32 truncate" title={row[header]}>
                                {row[header] || '-'}
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

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button onClick={onBack} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <Button 
              onClick={handleNext} 
              disabled={!parsedData || parsedData.headers.length === 0}
              className="bg-admin-blue hover:bg-admin-blue/90"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Configurer mapping
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résumé de validation */}
      {parsedData && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Fichier analysé avec succès!</strong><br />
            {parsedData.headers.length} colonnes détectées avec le séparateur 
            <strong> {selectedSeparator === 'auto' ? 'auto-détecté' : 'sélectionné'}</strong>.
            Passez à l'étape suivante pour configurer le mapping des colonnes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CSVPreviewStep;
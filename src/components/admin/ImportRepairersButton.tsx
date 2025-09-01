import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importRepairers } from '@/utils/importRepairers';

const ImportRepairersButton: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    imported: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await importRepairers();
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: "Import réussi",
          description: result.message,
        });
      } else {
        toast({
          title: "Erreur d'import",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMsg = `Erreur inattendue: ${error}`;
      setImportResult({
        success: false,
        message: errorMsg,
        imported: 0,
        errors: [errorMsg]
      });
      
      toast({
        title: "Erreur fatale",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import des réparateurs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Importer 67 réparateurs de la région Grand Est
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Les doublons seront automatiquement ignorés
            </p>
          </div>
          
          <Button 
            onClick={handleImport}
            disabled={isImporting}
            size="lg"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Lancer l'import
              </>
            )}
          </Button>
        </div>
        
        {importResult && (
          <div className="mt-4 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              {importResult.success ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              <span className="font-medium">
                {importResult.success ? "Import réussi" : "Import avec erreurs"}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <Badge variant="default">
                  {importResult.imported} importés
                </Badge>
                {importResult.errors.length > 0 && (
                  <Badge variant="destructive">
                    {importResult.errors.length} erreurs
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {importResult.message}
              </p>
              
              {importResult.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">
                    Voir les erreurs ({importResult.errors.length})
                  </summary>
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <p key={index} className="text-xs text-destructive mb-1">
                        {error}
                      </p>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportRepairersButton;
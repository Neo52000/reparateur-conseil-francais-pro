import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';

interface ImportResult {
  action: 'updated' | 'created' | 'skipped';
  brand: string;
  logoUrl?: string;
  reason?: string;
}

interface ImportSummary {
  totalFound: number;
  updated: number;
  created: number;
  skipped: number;
}

const MobilaxLogoImporter: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    setImporting(true);
    setResults([]);
    setSummary(null);

    try {
      const { data, error } = await supabase.functions.invoke('import-mobilax-logos');

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Import failed');
      }

      setSummary(data.summary);
      setResults(data.details || []);

      toast({
        title: "Import réussi",
        description: `${data.summary.updated} marques mises à jour, ${data.summary.created} marques créées`
      });

    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'import",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'created': return 'bg-green-100 text-green-800';
      case 'skipped': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'updated': return <CheckCircle className="h-4 w-4" />;
      case 'created': return <CheckCircle className="h-4 w-4" />;
      case 'skipped': return <AlertCircle className="h-4 w-4" />;
      default: return <ImageIcon className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Import des logos Mobilax
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description */}
        <div className="text-sm text-muted-foreground">
          <p>
            Importez automatiquement les logos de marques depuis le site Mobilax.fr. 
            Cette fonctionnalité enrichira votre catalogue avec des logos de haute qualité 
            pour les marques populaires de smartphones.
          </p>
        </div>

        {/* Bouton d'import */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleImport} 
            disabled={importing}
            className="flex items-center gap-2"
          >
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {importing ? 'Import en cours...' : 'Importer depuis Mobilax'}
          </Button>

          {summary && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Derniers résultats: {summary.totalFound} logos trouvés</span>
            </div>
          )}
        </div>

        {/* Résumé */}
        {summary && (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Résumé de l'import</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{summary.totalFound}</div>
                  <div className="text-sm text-muted-foreground">Logos trouvés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{summary.created}</div>
                  <div className="text-sm text-muted-foreground">Marques créées</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{summary.updated}</div>
                  <div className="text-sm text-muted-foreground">Marques mises à jour</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{summary.skipped}</div>
                  <div className="text-sm text-muted-foreground">Ignorées</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Détails des résultats */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Détails de l'import</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getActionIcon(result.action)}
                    <div>
                      <div className="font-medium">{result.brand}</div>
                      {result.reason && (
                        <div className="text-sm text-muted-foreground">{result.reason}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {result.logoUrl && (
                      <img 
                        src={result.logoUrl} 
                        alt={result.brand}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <Badge className={getActionColor(result.action)}>
                      {result.action === 'updated' ? 'Mis à jour' : 
                       result.action === 'created' ? 'Créé' : 'Ignoré'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {importing && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Extraction des logos depuis Mobilax.fr en cours...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobilaxLogoImporter;
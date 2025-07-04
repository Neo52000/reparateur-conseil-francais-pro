import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Bug, Database, Zap, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ScrapingDebugPanelProps {
  results: any[];
  isIntegrating: boolean;
}

const ScrapingDebugPanel: React.FC<ScrapingDebugPanelProps> = ({ 
  results, 
  isIntegrating 
}) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDatabaseDiagnostic = async () => {
    setLoading(true);
    try {
      // Test des permissions RLS sur la table repairers
      const { data: testInsert, error: insertError } = await supabase
        .from('repairers')
        .insert({
          name: 'TEST_REPAIRER_DEBUG',
          unique_id: `DEBUG_TEST_${Date.now()}`,
          business_category_id: null,
          address: 'Test Address',
          city: 'Test City',
          postal_code: '00000',
          source: 'debug_test'
        })
        .select('id');

      let insertResult = { success: !insertError, error: insertError?.message };

      // Nettoyer le test si réussi
      if (testInsert && testInsert.length > 0) {
        await supabase
          .from('repairers')
          .delete()
          .eq('id', testInsert[0].id);
      }

      // Test des catégories disponibles
      const { data: categories, error: categoriesError } = await supabase
        .from('business_categories')
        .select('id, name, is_active')
        .eq('is_active', true);

      // Test de l'edge function
      const { data: edgeFunctionTest, error: edgeFunctionError } = await supabase.functions.invoke('unified-scraping', {
        body: {
          searchTerm: 'test',
          location: 'Paris',
          sources: [],
          maxResults: 1,
          previewMode: true,
          providedResults: []
        }
      });

      setDebugInfo({
        database: {
          insertTest: insertResult,
          categories: {
            count: categories?.length || 0,
            available: categories || [],
            error: categoriesError?.message
          }
        },
        edgeFunction: {
          success: !edgeFunctionError,
          error: edgeFunctionError?.message,
          response: edgeFunctionTest
        },
        results: {
          total: results.length,
          withNames: results.filter(r => r.name || r.title).length,
          sources: [...new Set(results.map(r => r.source))],
          sample: results.slice(0, 3)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (success: boolean | undefined) => {
    if (success === true) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (success === false) return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Debug Scraping
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runDatabaseDiagnostic} 
            disabled={loading || isIntegrating}
            className="w-full"
          >
            <Zap className="h-4 w-4 mr-2" />
            {loading ? 'Diagnostic en cours...' : 'Lancer le diagnostic complet'}
          </Button>

          {debugInfo && (
            <Tabs defaultValue="database" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="database">Base de données</TabsTrigger>
                <TabsTrigger value="function">Edge Function</TabsTrigger>
                <TabsTrigger value="results">Résultats</TabsTrigger>
              </TabsList>

              <TabsContent value="database" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span className="font-medium">Test d'insertion RLS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(debugInfo.database?.insertTest?.success)}
                      <Badge variant={debugInfo.database?.insertTest?.success ? 'default' : 'destructive'}>
                        {debugInfo.database?.insertTest?.success ? 'OK' : 'ERREUR'}
                      </Badge>
                    </div>
                  </div>

                  {debugInfo.database?.insertTest?.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Erreur RLS:</strong> {debugInfo.database.insertTest.error}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Catégories actives</span>
                    </div>
                    <Badge variant="secondary">
                      {debugInfo.database?.categories?.count || 0} disponibles
                    </Badge>
                  </div>

                  {debugInfo.database?.categories?.available && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Catégories disponibles:</p>
                      <div className="flex flex-wrap gap-2">
                        {debugInfo.database.categories.available.map((cat: any) => (
                          <Badge key={cat.id} variant="outline" className="text-xs">
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="function" className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Edge Function Test</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(debugInfo.edgeFunction?.success)}
                    <Badge variant={debugInfo.edgeFunction?.success ? 'default' : 'destructive'}>
                      {debugInfo.edgeFunction?.success ? 'OK' : 'ERREUR'}
                    </Badge>
                  </div>
                </div>

                {debugInfo.edgeFunction?.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Erreur Edge Function:</strong> {debugInfo.edgeFunction.error}
                    </p>
                  </div>
                )}

                {debugInfo.edgeFunction?.response && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Réponse:</strong> {JSON.stringify(debugInfo.edgeFunction.response, null, 2)}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{debugInfo.results?.total || 0}</div>
                    <div className="text-sm text-muted-foreground">Total résultats</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{debugInfo.results?.withNames || 0}</div>
                    <div className="text-sm text-muted-foreground">Avec noms valides</div>
                  </div>
                </div>

                {debugInfo.results?.sources && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium mb-2">Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {debugInfo.results.sources.map((source: string) => (
                        <Badge key={source} variant="secondary">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {debugInfo.results?.sample && debugInfo.results.sample.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Échantillon de résultats:</p>
                    <div className="space-y-2">
                      {debugInfo.results.sample.map((result: any, index: number) => (
                        <div key={index} className="text-xs p-2 bg-white rounded border">
                          <strong>{result.name || result.title || 'Sans nom'}</strong>
                          {result.source && <Badge variant="outline" className="ml-2 text-xs">{result.source}</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <Separator />
          
          <div className="text-xs text-muted-foreground">
            {debugInfo?.timestamp && (
              <p>Dernière analyse: {new Date(debugInfo.timestamp).toLocaleString('fr-FR')}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrapingDebugPanel;
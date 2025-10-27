import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const FraudDetectionPanel = () => {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runFraudDetection = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-fraud-detection', {
        body: { mode: 'batch' }
      });

      if (error) throw error;

      setResults(data);
      
      toast({
        title: "✅ Analyse terminée",
        description: `${data.analyzed_count} réparateurs analysés. ${data.high_risk_count} à risque élevé.`
      });
    } catch (error: any) {
      console.error('Fraud detection error:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    } finally {
      setScanning(false);
    }
  };

  const getRiskBadge = (level: string) => {
    const config = {
      low: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      medium: { variant: 'secondary' as const, icon: AlertTriangle, color: 'text-yellow-600' },
      high: { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-orange-600' },
      critical: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
    };
    
    const { variant, icon: Icon, color } = config[level as keyof typeof config] || config.medium;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${color}`} />
        {level.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Détection de Fraudes IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Analyse automatique des nouveaux réparateurs pour détecter les signaux suspects
              et les tentatives de fraude. L'IA examine les incohérences, les patterns suspects,
              et les anomalies dans les données.
            </p>
            
            <Button 
              onClick={runFraudDetection} 
              disabled={scanning}
              className="w-full"
            >
              {scanning ? (
                <>🔄 Analyse en cours...</>
              ) : (
                <>🔍 Lancer une Analyse Complète</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Analysés</p>
                  <p className="text-3xl font-bold">{results.analyzed_count}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Risque Élevé</p>
                  <p className="text-3xl font-bold text-red-600">{results.high_risk_count}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Révision Manuelle</p>
                  <p className="text-3xl font-bold text-orange-600">{results.requires_review_count}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Résultats Détaillés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.results
                  .sort((a: any, b: any) => b.risk_score - a.risk_score)
                  .map((result: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{result.repairer_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Score de risque: {result.risk_score}/100
                          </p>
                        </div>
                        {getRiskBadge(result.risk_level)}
                      </div>

                      {result.analysis_summary && (
                        <p className="text-sm mb-3">{result.analysis_summary}</p>
                      )}

                      {result.red_flags && result.red_flags.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-2">🚩 Signaux d'Alerte:</p>
                          <div className="flex flex-wrap gap-2">
                            {result.red_flags.map((flag: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-red-600">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.verification_recommendations && result.verification_recommendations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">✅ Recommandations:</p>
                          <ul className="text-sm space-y-1">
                            {result.verification_recommendations.map((rec: string, i: number) => (
                              <li key={i} className="text-muted-foreground">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.requires_manual_review && (
                        <div className="mt-3 pt-3 border-t">
                          <Badge variant="destructive">⚠️ RÉVISION MANUELLE REQUISE</Badge>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FraudDetectionPanel;

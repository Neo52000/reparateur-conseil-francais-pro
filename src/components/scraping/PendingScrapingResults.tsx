import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Clock, MapPin, Brain, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PendingResult {
  id: string;
  session_id: string;
  city: string;
  source: string;
  ai_model: string | null;
  result_data: any[];
  results_count: number;
  created_at: string;
  expires_at: string;
  status: string;
}

interface PendingScrapingResultsProps {
  onImport?: (results: any[], sessionId: string) => void;
  onRefresh?: () => void;
}

const PendingScrapingResults: React.FC<PendingScrapingResultsProps> = ({ onImport, onRefresh }) => {
  const [pendingResults, setPendingResults] = useState<PendingResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingResults();
  }, []);

  const loadPendingResults = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scraping_pending_results')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast result_data correctement
      const results = (data || []).map(item => ({
        ...item,
        result_data: Array.isArray(item.result_data) ? item.result_data : []
      }));
      
      setPendingResults(results);
    } catch (error) {
      console.error('Erreur chargement résultats en attente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scraping_pending_results')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      setPendingResults(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Supprimé",
        description: "Résultats de scraping supprimés"
      });
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les résultats",
        variant: "destructive"
      });
    }
  };

  const handleImport = async (result: PendingResult) => {
    if (onImport) {
      onImport(result.result_data, result.session_id);
      
      // Marquer comme importé
      await supabase
        .from('scraping_pending_results')
        .update({ 
          status: 'imported',
          imported_at: new Date().toISOString()
        })
        .eq('id', result.id);

      setPendingResults(prev => prev.filter(r => r.id !== result.id));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            Chargement...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingResults.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            Résultats en attente d'import
            <Badge variant="secondary" className="ml-2">
              {pendingResults.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={loadPendingResults}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingResults.map((result) => (
          <div 
            key={result.id} 
            className="flex items-center justify-between p-3 bg-background rounded-lg border"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{result.city}</span>
                <Badge variant="outline" className="text-xs">
                  {result.results_count} réparateurs
                </Badge>
                {result.ai_model && (
                  <Badge variant="secondary" className="text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    {result.ai_model}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Scrapé {formatDistanceToNow(new Date(result.created_at), { addSuffix: true, locale: fr })}
                {' • '}
                Expire {formatDistanceToNow(new Date(result.expires_at), { addSuffix: true, locale: fr })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleImport(result)}
                disabled={!onImport}
              >
                <Download className="h-4 w-4 mr-1" />
                Importer
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(result.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PendingScrapingResults;

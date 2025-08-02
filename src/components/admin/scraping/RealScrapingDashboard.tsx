import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CashAndRepairScraper } from '../CashAndRepairScraper';
import { Play, Square, RefreshCw, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ScrapingLog {
  id: string;
  source: string;
  status: string; // Utiliser string au lieu de l'union type stricte
  items_scraped: number;
  items_added: number;
  items_updated: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  department_code?: string;
}

const RealScrapingDashboard: React.FC = () => {
  const [logs, setLogs] = useState<ScrapingLog[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('75');
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const departments = [
    { code: '75', name: 'Paris' },
    { code: '69', name: 'Lyon' },
    { code: '13', name: 'Marseille' },
    { code: '31', name: 'Toulouse' },
    { code: '44', name: 'Nantes' },
    { code: '59', name: 'Lille' },
    { code: '33', name: 'Bordeaux' }
  ];

  const sources = [
    { id: 'google_maps', name: 'Google Maps', description: 'Données via Google Business' },
    { id: 'pages_jaunes', name: 'Pages Jaunes', description: 'Annuaire traditionnel' },
    { id: 'local_directories', name: 'Annuaires locaux', description: 'Sources spécialisées' }
  ];

  useEffect(() => {
    loadScrapingLogs();
    checkActiveScrapingStatus();
    
    // Actualiser toutes les 30 secondes si scraping actif
    const interval = setInterval(() => {
      if (isScrapingActive) {
        loadScrapingLogs();
        checkActiveScrapingStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isScrapingActive]);

  const loadScrapingLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('scraping_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des logs:', error);
    }
  };

  const checkActiveScrapingStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('scraping_logs')
        .select('id')
        .eq('status', 'running')
        .limit(1);

      if (error) throw error;
      setIsScrapingActive((data || []).length > 0);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut:', error);
    }
  };

  const startScraping = async (source: string) => {
    if (isScrapingActive) {
      toast({
        title: "Scraping déjà actif",
        description: "Un processus de scraping est déjà en cours. Veuillez attendre qu'il se termine.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('real-scraping', {
        body: {
          targets: [{
            city: departments.find(d => d.code === selectedDepartment)?.name || 'Paris',
            category: 'réparation smartphone',
            source: source,
            maxResults: 50
          }]
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Scraping démarré",
          description: `Le scraping ${source} a été lancé pour ${departments.find(d => d.code === selectedDepartment)?.name}`,
        });
        setIsScrapingActive(true);
        await loadScrapingLogs();
      } else {
        throw new Error(data?.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du démarrage du scraping:', error);
      toast({
        title: "Erreur de scraping",
        description: error.message || 'Impossible de démarrer le scraping',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <AlertCircle className="h-4 w-4 text-orange-600 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      running: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status === 'running' ? 'En cours' : status === 'completed' ? 'Terminé' : 'Échoué'}
      </Badge>
    );
  };

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Scraping de données réelles
          </CardTitle>
          <CardDescription>
            Collecte automatisée de réparateurs depuis les sources externes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Département</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.code} value={dept.code}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sources.map(source => (
              <Card key={source.id} className="p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{source.name}</h4>
                    <p className="text-sm text-muted-foreground">{source.description}</p>
                  </div>
                  <Button 
                    onClick={() => startScraping(source.id)}
                    disabled={loading || isScrapingActive}
                    className="w-full"
                    size="sm"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Démarrer
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {isScrapingActive && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-600 animate-pulse" />
                <span className="font-medium text-orange-800">Scraping en cours...</span>
              </div>
              <p className="text-sm text-orange-700">
                Le processus de collecte est actif. Les résultats apparaîtront automatiquement.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash & Repair Scraper */}
      <CashAndRepairScraper />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historique des scraping</CardTitle>
            <Button onClick={loadScrapingLogs} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun historique de scraping</p>
                <p className="text-sm">Lancez votre premier scraping pour voir les résultats ici</p>
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.source}</span>
                        {getStatusBadge(log.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Démarré: {new Date(log.started_at).toLocaleString('fr-FR')}
                      </div>
                      {log.completed_at && (
                        <div className="text-sm text-muted-foreground">
                          Durée: {formatDuration(log.started_at, log.completed_at)}
                        </div>
                      )}
                      {log.error_message && (
                        <div className="text-sm text-red-600 mt-1">
                          Erreur: {log.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {log.items_scraped || 0} trouvés
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {log.items_added || 0} ajoutés, {log.items_updated || 0} modifiés
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealScrapingDashboard;
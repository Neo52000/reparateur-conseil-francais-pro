
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminAuditIntegration } from '@/hooks/useAdminAuditIntegration';
import { useToast } from '@/hooks/use-toast';
import { Play, Square, RotateCcw, Database, AlertTriangle, MapPin, Bot, Search, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS } from './controls/scrapingConstants';

interface ScrapingOperationsProps {
  onRefresh: () => void;
}

const ScrapingOperations: React.FC<ScrapingOperationsProps> = ({ onRefresh }) => {
  const { logScrapingAction } = useAdminAuditIntegration();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [scrapingStatus, setScrapingStatus] = useState<'idle' | 'running' | 'stopped'>('idle');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('75');
  const [aiProvider, setAiProvider] = useState<string>('lovable');

  // Scraping via Serper (Google Places) - Fonctionne bien!
  const handleSerperScraping = async (testMode: boolean = false) => {
    setLoading('serper');
    try {
      const { data, error } = await supabase.functions.invoke('scrape-repairers', {
        body: { 
          department_code: selectedDepartment, 
          test_mode: testMode,
          source: 'serper'
        }
      });
      
      if (error) throw error;
      
      logScrapingAction('scraping_start', `serper-${Date.now()}`, {
        source: 'serper',
        department: selectedDepartment,
        test_mode: testMode,
      }, 'info');

      setScrapingStatus('running');

      toast({
        title: "Scraping Serper démarré",
        description: `${data?.total_found || 0} réparateurs trouvés dans le ${selectedDepartment}`,
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erreur Serper",
        description: error.message || "Impossible de lancer le scraping Serper",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
      setScrapingStatus('idle');
    }
  };

  // Génération via IA (Multi-provider) - Fonctionne très bien!
  const handleAIScraping = async (testMode: boolean = false) => {
    setLoading('ai');
    try {
      const { data, error } = await supabase.functions.invoke('ai-scrape-repairers', {
        body: { 
          department_code: selectedDepartment, 
          test_mode: testMode,
          count: testMode ? 10 : 50,
          ai_provider: aiProvider,
          scrape_by_arrondissement: selectedDepartment === '75',
        }
      });
      
      if (error) throw error;
      
      logScrapingAction('scraping_start', `ai-generation-${Date.now()}`, {
        source: 'ai-generation',
        department: selectedDepartment,
        provider: aiProvider,
        test_mode: testMode,
      }, 'info');

      setScrapingStatus('running');

      toast({
        title: "Génération IA terminée",
        description: `${data?.total_generated || 0} réparateurs générés via ${data?.provider || aiProvider}`,
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erreur Génération IA",
        description: error.message || "Impossible de générer les données",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
      setScrapingStatus('idle');
    }
  };

  // Google Places Direct (si clé API configurée)
  const handleGooglePlacesDirect = async () => {
    setLoading('google');
    try {
      const { data, error } = await supabase.functions.invoke('google-places-proxy', {
        body: { 
          action: 'textSearch',
          query: `réparation smartphone ${DEPARTMENTS.find(d => d.code === selectedDepartment)?.name || selectedDepartment}`,
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Recherche Google Places",
        description: `${data?.results?.length || 0} résultats trouvés`,
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erreur Google Places",
        description: error.message || "Clé API Google non configurée ou invalide",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleStopScraping = async () => {
    setLoading('stop');
    try {
      await supabase.functions.invoke('stop-scraping');
      
      logScrapingAction('scraping_stop', `scraping-stop-${Date.now()}`, {
        stop_time: new Date().toISOString(),
        stop_reason: 'Manual admin stop',
      }, 'warning');

      setScrapingStatus('stopped');

      toast({
        title: "Scraping arrêté",
        description: "Le processus de scraping a été arrêté",
        variant: "destructive"
      });

      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'arrêter le scraping",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleGeocodeRepairers = async () => {
    setLoading('geocode');
    try {
      const { data, error } = await supabase.functions.invoke('geocode-repairers', {
        body: { limit: 100 }
      });
      
      if (error) throw error;
      
      toast({
        title: "Géocodage terminé",
        description: data?.message || `${data?.geocoded || 0} réparateurs géocodés`,
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de géocoder les réparateurs",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleCleanupData = async () => {
    if (!confirm("Êtes-vous sûr de vouloir nettoyer les anciennes données ? Cette action est irréversible.")) {
      return;
    }

    setLoading('cleanup');
    try {
      const { error } = await supabase.functions.invoke('cleanup-scraping-data', {
        body: { retentionDays: 30 }
      });
      
      logScrapingAction('delete', 'data-cleanup', {
        cleanup_type: 'old_scraping_data',
        cleanup_time: new Date().toISOString(),
        retention_days: 30,
      }, 'warning');

      toast({
        title: "Nettoyage terminé",
        description: "Les anciennes données de scraping ont été supprimées",
      });

      onRefresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de nettoyer les données",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = () => {
    switch (scrapingStatus) {
      case 'running':
        return <Badge variant="default">En cours</Badge>;
      case 'stopped':
        return <Badge variant="destructive">Arrêté</Badge>;
      default:
        return <Badge variant="secondary">Inactif</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Configuration du scraping</span>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Département</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.code} value={dept.code}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Provider IA (pour génération)</label>
              <Select value={aiProvider} onValueChange={setAiProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lovable">🤖 Lovable AI (Gemini)</SelectItem>
                  <SelectItem value="gemini">💎 Gemini Pro Direct</SelectItem>
                  <SelectItem value="openai">🧠 OpenAI GPT-4o</SelectItem>
                  <SelectItem value="mistral">🇫🇷 Mistral AI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources de scraping */}
      <Card>
        <CardHeader>
          <CardTitle>Sources de données</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Serper (Google Places) - Recommandé */}
            <div className="border rounded-lg p-4 space-y-3 bg-green-50 dark:bg-green-950/20 border-green-200">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900 dark:text-green-100">Google Places (Serper)</h4>
                <Badge variant="default" className="bg-green-600">Recommandé</Badge>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Données réelles de Google Maps avec téléphones et adresses vérifiées.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleSerperScraping(true)}
                  disabled={loading !== null}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {loading === 'serper' ? 'Recherche...' : 'Test (5 résultats)'}
                </Button>
                <Button
                  onClick={() => handleSerperScraping(false)}
                  disabled={loading !== null}
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {loading === 'serper' ? 'Recherche...' : 'Scraping complet'}
                </Button>
              </div>
            </div>

            {/* AI Generation - Très efficace */}
            <div className="border rounded-lg p-4 space-y-3 bg-purple-50 dark:bg-purple-950/20 border-purple-200">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium text-purple-900 dark:text-purple-100">Génération IA</h4>
                <Badge variant="secondary" className="bg-purple-200 text-purple-800">Multi-Provider</Badge>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Génère des données réalistes via {aiProvider === 'lovable' ? 'Lovable AI' : aiProvider}.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleAIScraping(true)}
                  disabled={loading !== null}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {loading === 'ai' ? 'Génération...' : 'Test (10 résultats)'}
                </Button>
                <Button
                  onClick={() => handleAIScraping(false)}
                  disabled={loading !== null}
                  size="sm"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {loading === 'ai' ? 'Génération...' : 'Génération massive (50)'}
                </Button>
              </div>
            </div>

            {/* Google Places Direct */}
            <div className="border rounded-lg p-4 space-y-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Google Places Direct</h4>
                <Badge variant="outline">API Clé requise</Badge>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                API officielle Google - Nécessite une clé API valide configurée.
              </p>
              <Button
                onClick={handleGooglePlacesDirect}
                disabled={loading !== null}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Search className="mr-2 h-4 w-4" />
                {loading === 'google' ? 'Recherche...' : 'Rechercher'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contrôles */}
      <Card>
        <CardHeader>
          <CardTitle>Contrôles & Outils</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={handleStopScraping}
              disabled={loading !== null || scrapingStatus !== 'running'}
              variant="destructive"
              className="w-full"
            >
              <Square className="mr-2 h-4 w-4" />
              {loading === 'stop' ? 'Arrêt...' : 'Stop'}
            </Button>
            <Button
              onClick={handleGeocodeRepairers}
              disabled={loading !== null}
              variant="default"
              className="w-full"
            >
              <MapPin className="mr-2 h-4 w-4" />
              {loading === 'geocode' ? 'Géocodage...' : 'Géocoder'}
            </Button>
            <Button
              onClick={handleCleanupData}
              disabled={loading !== null}
              variant="outline"
              className="w-full"
            >
              <Database className="mr-2 h-4 w-4" />
              {loading === 'cleanup' ? 'Nettoyage...' : 'Nettoyer'}
            </Button>
            <Button
              onClick={onRefresh}
              disabled={loading !== null}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {scrapingStatus === 'running' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">
                Un processus de scraping est actuellement en cours. 
                Toutes les actions sont enregistrées dans le système d'audit.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScrapingOperations;

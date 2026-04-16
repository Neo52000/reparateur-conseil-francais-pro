import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Eye, Globe, Activity, Play, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AiCmoDashboardStats, AiCmoLlmCost, ShareOfVoiceEntry, DEFAULT_SITE_ID } from './types';

interface AiCmoStatsProps {
  stats: AiCmoDashboardStats | null;
  costs: AiCmoLlmCost[];
  loading: boolean;
  loadingCosts: boolean;
  onRefresh?: () => void;
}

const AiCmoStats: React.FC<AiCmoStatsProps> = ({ stats, costs, loading, loadingCosts, onRefresh }) => {
  const { toast } = useToast();
  const [triggering, setTriggering] = useState(false);

  const handleTriggerRun = async (forceAll = false) => {
    setTriggering(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-cmo-worker', {
        body: { site_id: DEFAULT_SITE_ID, force_all: forceAll },
      });

      if (error) throw error;

      toast({
        title: 'Analyse lancee',
        description: `${data?.runs_created || 0} analyse(s) executee(s) sur ${data?.questions_processed || 0} question(s)${data?.errors?.length ? ` — ${data.errors.length} erreur(s)` : ''}`,
      });

      // Refresh dashboard data
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de lancer l\'analyse',
        variant: 'destructive',
      });
    } finally {
      setTriggering(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune donnee de tableau de bord</p>
          <p className="text-sm text-muted-foreground mt-1">
            Les statistiques apparaitront une fois le service de monitoring actif
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Button onClick={() => handleTriggerRun(true)} disabled={triggering}>
              <Play className="w-4 h-4 mr-2" />
              {triggering ? 'Analyse en cours...' : 'Lancer une analyse maintenant'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const voiceData = Array.isArray(stats.share_of_voice)
    ? (stats.share_of_voice as ShareOfVoiceEntry[]).slice(0, 20)
    : [];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'you':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Vous</Badge>;
      case 'competitor':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Concurrent</Badge>;
      default:
        return <Badge variant="secondary">Autre</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tableau de bord AI-CMO</h3>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble de votre visibilite dans les IA conversationnelles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleTriggerRun(false)} disabled={triggering}>
            <Play className="w-4 h-4 mr-2" />
            {triggering ? 'En cours...' : 'Lancer les questions dues'}
          </Button>
          <Button variant="outline" onClick={() => handleTriggerRun(true)} disabled={triggering}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Forcer toutes
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score de visibilite IA</p>
                <p className="text-2xl font-bold">
                  {(stats.ai_visibility_score * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Part de citation du site</p>
                <p className="text-2xl font-bold">
                  {(stats.website_citation_share * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total des analyses</p>
                <p className="text-2xl font-bold">{stats.total_runs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share of Voice Table */}
      {voiceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Share of Voice - Top 20
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Domaine</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Mentions</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Pourcentage</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {voiceData.map((entry, i) => (
                    <tr key={i} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{entry.domain}</td>
                      <td className="py-3 px-2 text-center">{entry.count}</td>
                      <td className="py-3 px-2 text-center">{entry.percentage.toFixed(1)}%</td>
                      <td className="py-3 px-2 text-center">{getTypeBadge(entry.type)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LLM Costs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Couts LLM recents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCosts ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : costs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune donnee de couts disponible
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Modele</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Appels</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Tokens in</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Tokens out</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Cout</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((cost) => (
                    <tr key={cost.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        {new Date(cost.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-2">{cost.model}</td>
                      <td className="py-3 px-2 text-center">{cost.call_count ?? '-'}</td>
                      <td className="py-3 px-2 text-center">
                        {cost.tokens_in != null ? cost.tokens_in.toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {cost.tokens_out != null ? cost.tokens_out.toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-2 text-right font-medium">
                        ${cost.cost.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AiCmoStats;

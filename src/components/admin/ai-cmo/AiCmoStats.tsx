import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Eye,
  Globe,
  Activity,
  Play,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Table as TableIcon,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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

const VOICE_COLORS: Record<ShareOfVoiceEntry['type'], string> = {
  you: 'hsl(217 91% 60%)',
  competitor: 'hsl(25 95% 53%)',
  other: 'hsl(220 9% 64%)',
};

const scoreTone = (score: number) => {
  if (score >= 0.6) return { label: 'Excellent', tone: 'text-emerald-600', bar: 'bg-emerald-500' };
  if (score >= 0.3) return { label: 'Correct', tone: 'text-amber-600', bar: 'bg-amber-500' };
  return { label: 'A ameliorer', tone: 'text-rose-600', bar: 'bg-rose-500' };
};

const AiCmoStats: React.FC<AiCmoStatsProps> = ({ stats, costs, loading, loadingCosts, onRefresh }) => {
  const { toast } = useToast();
  const [triggering, setTriggering] = useState(false);
  const [voiceView, setVoiceView] = useState<'chart' | 'table'>('chart');

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

      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || "Impossible de lancer l'analyse",
        variant: 'destructive',
      });
    } finally {
      setTriggering(false);
    }
  };

  const costSummary = useMemo(() => {
    if (!costs.length) return { total: 0, calls: 0, tokensIn: 0, tokensOut: 0 };
    return costs.reduce(
      (acc, c) => ({
        total: acc.total + (c.cost || 0),
        calls: acc.calls + (c.call_count || 0),
        tokensIn: acc.tokensIn + (c.tokens_in || 0),
        tokensOut: acc.tokensOut + (c.tokens_out || 0),
      }),
      { total: 0, calls: 0, tokensIn: 0, tokensOut: 0 }
    );
  }, [costs]);

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

  const chartData = voiceData.map((d) => ({
    domain: d.domain.length > 22 ? `${d.domain.slice(0, 22)}…` : d.domain,
    fullDomain: d.domain,
    percentage: Number(d.percentage.toFixed(1)),
    count: d.count,
    type: d.type,
  }));

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

  const visibility = scoreTone(stats.ai_visibility_score);
  const citation = scoreTone(stats.website_citation_share);
  const lastUpdated = stats.computed_at
    ? new Date(stats.computed_at).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold">Tableau de bord AI-CMO</h3>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble de votre visibilite dans les IA conversationnelles
            {lastUpdated && <span className="ml-2">• Mis a jour le {lastUpdated}</span>}
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
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score de visibilite IA</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{(stats.ai_visibility_score * 100).toFixed(1)}%</p>
                  <span className={`text-xs font-medium ${visibility.tone}`}>{visibility.label}</span>
                </div>
              </div>
            </div>
            <Progress value={stats.ai_visibility_score * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-100">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Part de citation du site</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{(stats.website_citation_share * 100).toFixed(1)}%</p>
                  <span className={`text-xs font-medium ${citation.tone}`}>{citation.label}</span>
                </div>
              </div>
            </div>
            <Progress value={stats.website_citation_share * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total des analyses</p>
                <p className="text-2xl font-bold">{stats.total_runs.toLocaleString('fr-FR')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: VOICE_COLORS.you }} />
                Vous
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: VOICE_COLORS.competitor }} />
                Concurrents
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: VOICE_COLORS.other }} />
                Autres
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share of Voice */}
      {voiceData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Share of Voice — Top {voiceData.length}
              </CardTitle>
              <div className="inline-flex rounded-md border p-0.5">
                <Button
                  variant={voiceView === 'chart' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-3"
                  onClick={() => setVoiceView('chart')}
                >
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                  Graphique
                </Button>
                <Button
                  variant={voiceView === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-3"
                  onClick={() => setVoiceView('table')}
                >
                  <TableIcon className="w-3.5 h-3.5 mr-1.5" />
                  Tableau
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {voiceView === 'chart' ? (
              <div style={{ width: '100%', height: Math.max(240, chartData.length * 28) }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <XAxis type="number" unit="%" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="domain"
                      width={180}
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                      contentStyle={{
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                      formatter={(value: number, _name, item) => [
                        `${value}% (${item.payload.count} mentions)`,
                        item.payload.fullDomain,
                      ]}
                      labelFormatter={() => ''}
                    />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={VOICE_COLORS[entry.type as ShareOfVoiceEntry['type']]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
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
                      <tr
                        key={i}
                        className={`border-b hover:bg-muted/50 ${entry.type === 'you' ? 'bg-blue-50/40' : ''}`}
                      >
                        <td className="py-3 px-2 font-medium">{entry.domain}</td>
                        <td className="py-3 px-2 text-center">{entry.count}</td>
                        <td className="py-3 px-2 text-center">{entry.percentage.toFixed(1)}%</td>
                        <td className="py-3 px-2 text-center">{getTypeBadge(entry.type)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* LLM Costs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Couts LLM recents
            </CardTitle>
            {costs.length > 0 && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="font-semibold text-foreground">${costSummary.total.toFixed(4)}</span>
                  <span>total</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="font-semibold text-foreground">{costSummary.calls.toLocaleString('fr-FR')}</span>
                  <span>appels</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">
                    {(costSummary.tokensIn + costSummary.tokensOut).toLocaleString('fr-FR')}
                  </span>
                  <span>tokens</span>
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingCosts ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : costs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucune donnee de couts disponible</p>
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
                      <td className="py-3 px-2">{new Date(cost.date).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3 px-2">{cost.model}</td>
                      <td className="py-3 px-2 text-center">{cost.call_count ?? '-'}</td>
                      <td className="py-3 px-2 text-center">
                        {cost.tokens_in != null ? cost.tokens_in.toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {cost.tokens_out != null ? cost.tokens_out.toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-2 text-right font-medium">${cost.cost.toFixed(4)}</td>
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

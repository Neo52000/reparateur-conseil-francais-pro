import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileSearch,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  X,
} from 'lucide-react';
import { AiCmoPromptRun } from './types';

interface AiCmoResultsProps {
  runs: AiCmoPromptRun[];
  loading: boolean;
  page: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

type BrandFilter = 'all' | 'yes' | 'no';

const rankBadge = (rank: number | null) => {
  if (rank == null) return <span className="text-muted-foreground">-</span>;
  if (rank <= 3) {
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">#{rank}</Badge>;
  }
  if (rank <= 10) {
    return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">#{rank}</Badge>;
  }
  return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">#{rank}</Badge>;
};

const AiCmoResults: React.FC<AiCmoResultsProps> = ({
  runs,
  loading,
  page,
  total,
  perPage,
  onPageChange,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<BrandFilter>('all');
  const [search, setSearch] = useState('');

  const { providers, models } = useMemo(() => {
    const p = new Set<string>();
    const m = new Set<string>();
    runs.forEach((r) => {
      if (r.llm_provider) p.add(r.llm_provider);
      if (r.llm_model) m.add(r.llm_model);
    });
    return { providers: Array.from(p).sort(), models: Array.from(m).sort() };
  }, [runs]);

  const filteredRuns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return runs.filter((r) => {
      if (providerFilter !== 'all' && r.llm_provider !== providerFilter) return false;
      if (modelFilter !== 'all' && r.llm_model !== modelFilter) return false;
      if (brandFilter === 'yes' && !r.brand_mentioned) return false;
      if (brandFilter === 'no' && r.brand_mentioned) return false;
      if (q && !(r.question_prompt || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [runs, providerFilter, modelFilter, brandFilter, search]);

  const hasActiveFilters =
    providerFilter !== 'all' || modelFilter !== 'all' || brandFilter !== 'all' || search.trim().length > 0;

  const resetFilters = () => {
    setProviderFilter('all');
    setModelFilter('all');
    setBrandFilter('all');
    setSearch('');
  };

  const totalPages = Math.ceil(total / perPage);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileSearch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun resultat disponible</p>
          <p className="text-sm text-muted-foreground mt-1">
            Les resultats apparaitront une fois le service de monitoring actif
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Resultats d'analyse</h3>
          <p className="text-sm text-muted-foreground">
            {total} analyse{total > 1 ? 's' : ''} au total
            {hasActiveFilters && ` • ${filteredRuns.length} apres filtres`}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="w-5 h-5" />
              Historique des analyses
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="w-3.5 h-3.5 mr-1.5" />
                Reinitialiser les filtres
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Search className="w-3 h-3" />
                Recherche
              </Label>
              <Input
                placeholder="Filtrer par prompt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Provider
              </Label>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {providers.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Modele
              </Label>
              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {models.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Marque citee
              </Label>
              <Select value={brandFilter} onValueChange={(v) => setBrandFilter(v as BrandFilter)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="yes">Oui</SelectItem>
                  <SelectItem value="no">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRuns.length === 0 ? (
            <div className="py-10 text-center">
              <Filter className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Aucun resultat ne correspond aux filtres</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={resetFilters}>
                Reinitialiser
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Question</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Provider</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Modele</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Marque citee</th>
                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Rang</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Top domaine</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRuns.map((run) => (
                    <React.Fragment key={run.id}>
                      <tr
                        className={`border-b hover:bg-muted/50 cursor-pointer ${
                          run.brand_mentioned ? 'bg-emerald-50/30' : ''
                        }`}
                        onClick={() => setExpandedId(expandedId === run.id ? null : run.id)}
                      >
                        <td className="py-3 px-2 whitespace-nowrap">{formatDate(run.run_at)}</td>
                        <td
                          className="py-3 px-2 max-w-[220px] truncate"
                          title={run.question_prompt || ''}
                        >
                          {run.question_prompt || (
                            <span className="text-muted-foreground italic">Question supprimee</span>
                          )}
                        </td>
                        <td className="py-3 px-2">{run.llm_provider}</td>
                        <td className="py-3 px-2">{run.llm_model}</td>
                        <td className="py-3 px-2 text-center">
                          {run.brand_mentioned ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                              Oui
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Non</Badge>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">{rankBadge(run.company_domain_rank)}</td>
                        <td className="py-3 px-2">{run.top_domain || '-'}</td>
                        <td className="py-3 px-2">
                          {expandedId === run.id ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </td>
                      </tr>
                      {expandedId === run.id && (
                        <tr>
                          <td colSpan={8} className="py-4 px-4 bg-muted/30">
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                                  Reponse brute
                                </p>
                                <div className="bg-background border rounded p-3 text-sm max-h-48 overflow-y-auto whitespace-pre-wrap">
                                  {run.raw_response || 'Aucune reponse disponible'}
                                </div>
                              </div>
                              {Array.isArray(run.mentioned_pages) && run.mentioned_pages.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                                    Pages mentionnees
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {run.mentioned_pages.map((p, i) => (
                                      <Badge key={i} variant="outline">
                                        {String(p)}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} sur {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Precedent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AiCmoResults;

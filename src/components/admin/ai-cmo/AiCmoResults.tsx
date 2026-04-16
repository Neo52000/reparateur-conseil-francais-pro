import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSearch, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { AiCmoPromptRun } from './types';

interface AiCmoResultsProps {
  runs: AiCmoPromptRun[];
  loading: boolean;
  page: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

const AiCmoResults: React.FC<AiCmoResultsProps> = ({
  runs,
  loading,
  page,
  total,
  perPage,
  onPageChange,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="w-5 h-5" />
            Historique des analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                {runs.map((run) => (
                  <React.Fragment key={run.id}>
                    <tr
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === run.id ? null : run.id)}
                    >
                      <td className="py-3 px-2 whitespace-nowrap">{formatDate(run.run_at)}</td>
                      <td className="py-3 px-2 max-w-[200px] truncate" title={run.question_prompt || ''}>
                        {run.question_prompt || <span className="text-muted-foreground italic">Question supprimee</span>}
                      </td>
                      <td className="py-3 px-2">{run.llm_provider}</td>
                      <td className="py-3 px-2">{run.llm_model}</td>
                      <td className="py-3 px-2 text-center">
                        {run.brand_mentioned ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Oui</Badge>
                        ) : (
                          <Badge variant="secondary">Non</Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {run.company_domain_rank != null ? (
                          <Badge variant="outline">{run.company_domain_rank}</Badge>
                        ) : '-'}
                      </td>
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
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Reponse brute</p>
                              <div className="bg-background border rounded p-3 text-sm max-h-48 overflow-y-auto whitespace-pre-wrap">
                                {run.raw_response || 'Aucune reponse disponible'}
                              </div>
                            </div>
                            {Array.isArray(run.mentioned_pages) && run.mentioned_pages.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Pages mentionnees</p>
                                <div className="flex flex-wrap gap-2">
                                  {run.mentioned_pages.map((page, i) => (
                                    <Badge key={i} variant="outline">{String(page)}</Badge>
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

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, ChevronDown, ChevronUp, Target, AlertCircle, ListChecks } from 'lucide-react';
import { AiCmoRecommendation } from './types';

interface AiCmoRecommendationsProps {
  recommendations: AiCmoRecommendation[];
  loading: boolean;
}

type StatusFilter = 'all' | 'ongoing' | 'done';

const AiCmoRecommendations: React.FC<AiCmoRecommendationsProps> = ({ recommendations, loading }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const counts = useMemo(() => {
    const done = recommendations.filter((r) => !!r.completed_at).length;
    return { all: recommendations.length, done, ongoing: recommendations.length - done };
  }, [recommendations]);

  const visible = useMemo(() => {
    if (statusFilter === 'done') return recommendations.filter((r) => !!r.completed_at);
    if (statusFilter === 'ongoing') return recommendations.filter((r) => !r.completed_at);
    return recommendations;
  }, [recommendations, statusFilter]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune recommandation disponible</p>
          <p className="text-sm text-muted-foreground mt-1">
            Les recommandations apparaitront une fois le service de monitoring actif
          </p>
        </CardContent>
      </Card>
    );
  }

  const FilterButton: React.FC<{ value: StatusFilter; label: string; count: number }> = ({
    value,
    label,
    count,
  }) => (
    <Button
      variant={statusFilter === value ? 'secondary' : 'ghost'}
      size="sm"
      className="h-8"
      onClick={() => setStatusFilter(value)}
    >
      {label}
      <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-background text-xs font-medium px-1.5 py-0.5 border">
        {count}
      </span>
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold">Recommandations</h3>
          <p className="text-sm text-muted-foreground">
            Analyses concurrentielles et plans d'action pour ameliorer votre visibilite IA
          </p>
        </div>
        <div className="inline-flex gap-1 rounded-md border p-1 bg-muted/30">
          <FilterButton value="all" label="Toutes" count={counts.all} />
          <FilterButton value="ongoing" label="En cours" count={counts.ongoing} />
          <FilterButton value="done" label="Terminees" count={counts.done} />
        </div>
      </div>

      {visible.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Lightbulb className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Aucune recommandation dans cette categorie</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((rec) => {
            const isExpanded = expandedId === rec.id;
            const isCompleted = !!rec.completed_at;

            return (
              <Card
                key={rec.id}
                className={`overflow-hidden border-l-4 ${
                  isCompleted ? 'border-l-emerald-500' : 'border-l-amber-500'
                }`}
              >
                <div className="cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : rec.id)}>
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isCompleted ? 'bg-emerald-100' : 'bg-amber-100'
                          }`}
                        >
                          <Lightbulb
                            className={`w-5 h-5 ${isCompleted ? 'text-emerald-600' : 'text-amber-600'}`}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {rec.competitor_domain || 'Analyse generale'}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(rec.completed_at || rec.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                          }
                        >
                          {isCompleted ? 'Terminee' : 'En cours'}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </div>

                {isExpanded && (
                  <CardContent className="pt-0 space-y-4">
                    <div className="border-t pt-4 space-y-4">
                      {rec.why_competitor && (
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Pourquoi le concurrent est cite
                          </h4>
                          <p className="text-sm whitespace-pre-wrap pl-6">{rec.why_competitor}</p>
                        </div>
                      )}

                      {rec.why_not_user && (
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Pourquoi vous n'etes pas cite
                          </h4>
                          <p className="text-sm whitespace-pre-wrap pl-6">{rec.why_not_user}</p>
                        </div>
                      )}

                      {rec.what_to_do && (
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-2">
                            <ListChecks className="w-4 h-4" />
                            Plan d'action recommande
                          </h4>
                          <div className="pl-6 text-sm whitespace-pre-wrap bg-muted/30 border rounded p-3">
                            {rec.what_to_do}
                          </div>
                        </div>
                      )}

                      {Array.isArray(rec.prompts_to_analyze) && rec.prompts_to_analyze.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                            Prompts analyses
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {rec.prompts_to_analyze.map((prompt, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {String(prompt)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AiCmoRecommendations;

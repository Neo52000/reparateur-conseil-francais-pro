import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { AiCmoRecommendation } from './types';

interface AiCmoRecommendationsProps {
  recommendations: AiCmoRecommendation[];
  loading: boolean;
}

const AiCmoRecommendations: React.FC<AiCmoRecommendationsProps> = ({ recommendations, loading }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Recommandations</h3>
        <p className="text-sm text-muted-foreground">
          Analyses concurrentielles et plans d'action pour ameliorer votre visibilite IA
        </p>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => {
          const isExpanded = expandedId === rec.id;
          const isCompleted = !!rec.completed_at;

          return (
            <Card key={rec.id}>
              <div
                className="cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
              >
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
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
                      <Badge className={isCompleted
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                      }>
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
                  <div className="border-t pt-4">
                    {rec.why_competitor && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                          Pourquoi le concurrent est cite
                        </h4>
                        <p className="text-sm whitespace-pre-wrap">{rec.why_competitor}</p>
                      </div>
                    )}

                    {rec.why_not_user && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                          Pourquoi vous n'etes pas cite
                        </h4>
                        <p className="text-sm whitespace-pre-wrap">{rec.why_not_user}</p>
                      </div>
                    )}

                    {rec.what_to_do && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
                          Plan d'action recommande
                        </h4>
                        <p className="text-sm whitespace-pre-wrap">{rec.what_to_do}</p>
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
    </div>
  );
};

export default AiCmoRecommendations;

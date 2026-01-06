/**
 * Liste des résultats de recherche IA
 */

import React from 'react';
import { Loader2, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AISearchResultCard } from './AISearchResultCard';
import type { AISearchResult, MatchedRepairer } from '@/services/search';

interface AISearchResultsListProps {
  result: AISearchResult | null;
  loading: boolean;
  error?: string | null;
  onSelectRepairer: (repairer: MatchedRepairer) => void;
  onContactRepairer?: (repairer: MatchedRepairer) => void;
  showMatchScores?: boolean;
}

export const AISearchResultsList: React.FC<AISearchResultsListProps> = ({
  result,
  loading,
  error,
  onSelectRepairer,
  onContactRepairer,
  showMatchScores = true,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Recherche en cours...</p>
        <p className="text-sm text-muted-foreground mt-1">
          Analyse de votre demande avec l'IA
        </p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">Recherche intelligente</h3>
        <p className="text-muted-foreground max-w-md">
          Décrivez votre problème en langage naturel.<br />
          Par exemple : "écran cassé iPhone 14 Paris" ou "batterie Samsung urgent"
        </p>
      </div>
    );
  }
  
  if (result.repairers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucun résultat</h3>
        <p className="text-muted-foreground mb-4">
          Aucun réparateur ne correspond à votre recherche.
        </p>
        {result.suggestions && result.suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Suggestions :</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {result.suggestions.map((suggestion, index) => (
                <Badge key={index} variant="outline">
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="font-medium">
            {result.totalResults} réparateur{result.totalResults > 1 ? 's' : ''} trouvé{result.totalResults > 1 ? 's' : ''}
          </span>
          <span className="text-sm text-muted-foreground">
            en {result.searchTime}ms
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {result.usedFallback && (
            <Badge variant="secondary" className="text-xs">
              Recherche standard
            </Badge>
          )}
          {result.intent.confidence >= 0.7 && (
            <Badge variant="default" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Recherche IA
            </Badge>
          )}
        </div>
      </div>
      
      {/* Intent summary */}
      {result.intent.confidence >= 0.5 && (
        <div className="p-3 rounded-lg bg-muted/50 text-sm">
          <span className="text-muted-foreground">Recherche : </span>
          <span className="font-medium">
            {result.intent.repairType && `Réparation ${result.intent.repairType}`}
            {result.intent.brand && ` ${result.intent.brand}`}
            {result.intent.model && ` ${result.intent.model}`}
            {result.intent.location?.city && ` à ${result.intent.location.city}`}
          </span>
        </div>
      )}
      
      {/* Results list */}
      <div className="space-y-3">
        {result.repairers.map((repairer, index) => (
          <AISearchResultCard
            key={repairer.id}
            repairer={repairer}
            rank={index + 1}
            onSelect={onSelectRepairer}
            onContact={onContactRepairer}
            showMatchScore={showMatchScores}
          />
        ))}
      </div>
      
      {/* Load more */}
      {result.repairers.length >= 20 && (
        <div className="text-center pt-4">
          <Button variant="outline">
            Voir plus de résultats
          </Button>
        </div>
      )}
    </div>
  );
};

export default AISearchResultsList;

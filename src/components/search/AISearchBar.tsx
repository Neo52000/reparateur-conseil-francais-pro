/**
 * Composant de recherche IA intelligent
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Sparkles, X, Mic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAISearch } from '@/hooks/useAISearch';
import { AIQueryParser } from '@/services/search';

interface AISearchBarProps {
  onSearch: (query: string, intent: any) => void;
  onResultsChange?: (results: any[]) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  showIntentPreview?: boolean;
  autoFocus?: boolean;
}

export const AISearchBar: React.FC<AISearchBarProps> = ({
  onSearch,
  onResultsChange,
  placeholder = "Rechercher un réparateur, une marque, un problème...",
  className,
  showSuggestions = true,
  showIntentPreview = true,
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const [previewIntent, setPreviewIntent] = useState<any>(null);
  
  const {
    search,
    loading,
    suggestions,
    fetchSuggestions,
    repairers,
    intent,
  } = useAISearch({ logQueries: true });
  
  // Mise à jour de l'intention en temps réel
  useEffect(() => {
    if (localQuery.length >= 3) {
      const parsed = AIQueryParser.parse(localQuery);
      setPreviewIntent(parsed);
    } else {
      setPreviewIntent(null);
    }
  }, [localQuery]);
  
  // Fetch suggestions pendant la frappe
  useEffect(() => {
    if (showSuggestions && localQuery.length >= 2) {
      fetchSuggestions(localQuery);
    }
  }, [localQuery, showSuggestions, fetchSuggestions]);
  
  // Callback résultats
  useEffect(() => {
    if (onResultsChange && repairers.length > 0) {
      onResultsChange(repairers);
    }
  }, [repairers, onResultsChange]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim().length < 2) return;
    
    const result = await search(localQuery);
    if (result) {
      onSearch(localQuery, result.intent);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setLocalQuery(suggestion);
    search(suggestion).then(result => {
      if (result) {
        onSearch(suggestion, result.intent);
      }
    });
    setIsFocused(false);
  };
  
  const handleClear = () => {
    setLocalQuery('');
    setPreviewIntent(null);
    inputRef.current?.focus();
  };
  
  return (
    <div className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={cn(
          "relative flex items-center rounded-2xl border-2 bg-background transition-all duration-200",
          isFocused 
            ? "border-primary shadow-lg shadow-primary/20" 
            : "border-border hover:border-primary/50"
        )}>
          {/* Icon IA */}
          <div className="pl-4">
            <Sparkles className={cn(
              "h-5 w-5 transition-colors",
              isFocused ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          {/* Input */}
          <Input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="flex-1 border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 py-6"
          />
          
          {/* Clear button */}
          {localQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="mr-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {/* Search button */}
          <Button
            type="submit"
            disabled={loading || localQuery.length < 2}
            className="mr-2 rounded-xl px-6"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Rechercher
              </>
            )}
          </Button>
        </div>
      </form>
      
      {/* Intent Preview */}
      {showIntentPreview && previewIntent && previewIntent.confidence > 0.3 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {previewIntent.brand && (
            <Badge variant="secondary" className="text-xs">
              <span className="text-muted-foreground mr-1">Marque:</span>
              {previewIntent.brand}
            </Badge>
          )}
          {previewIntent.model && (
            <Badge variant="secondary" className="text-xs">
              <span className="text-muted-foreground mr-1">Modèle:</span>
              {previewIntent.model}
            </Badge>
          )}
          {previewIntent.repairType && (
            <Badge variant="secondary" className="text-xs">
              <span className="text-muted-foreground mr-1">Réparation:</span>
              {previewIntent.repairType}
            </Badge>
          )}
          {previewIntent.location?.city && (
            <Badge variant="secondary" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {previewIntent.location.city}
            </Badge>
          )}
          {previewIntent.criteria?.urgent && (
            <Badge variant="destructive" className="text-xs">
              Urgent
            </Badge>
          )}
        </div>
      )}
      
      {/* Suggestions dropdown */}
      {showSuggestions && isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border bg-background shadow-lg">
          <ul className="py-2">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span>{suggestion}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AISearchBar;

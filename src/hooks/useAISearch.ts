/**
 * Hook pour la recherche IA
 */

import { useState, useCallback, useEffect } from 'react';
import { AISearchService, type AISearchResult, type AISearchOptions } from '@/services/search';
import { useToast } from '@/hooks/use-toast';

interface UseAISearchOptions {
  autoSearch?: boolean;
  debounceMs?: number;
  minQueryLength?: number;
  logQueries?: boolean;
}

export function useAISearch(options: UseAISearchOptions = {}) {
  const {
    autoSearch = false,
    debounceMs = 300,
    minQueryLength = 2,
    logQueries = true,
  } = options;
  
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AISearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Recherche principale
  const search = useCallback(async (
    searchQuery: string, 
    searchOptions?: Partial<AISearchOptions>
  ) => {
    if (searchQuery.length < minQueryLength) {
      setResult(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const searchResult = await AISearchService.search(searchQuery, {
        logQuery: logQueries,
        ...searchOptions,
      });
      
      setResult(searchResult);
      
      if (searchResult.repairers.length === 0) {
        toast({
          title: 'Aucun résultat',
          description: 'Essayez une recherche plus large ou une autre localisation.',
          variant: 'default',
        });
      }
      
      return searchResult;
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de recherche';
      setError(message);
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
      return null;
      
    } finally {
      setLoading(false);
    }
  }, [minQueryLength, logQueries, toast]);
  
  // Recherche rapide (sans IA complète)
  const quickSearch = useCallback(async (term: string, city?: string) => {
    setLoading(true);
    try {
      const repairers = await AISearchService.quickSearch(term, city);
      return repairers;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Recherche à proximité
  const searchNearby = useCallback(async (
    lat: number, 
    lng: number, 
    radiusKm?: number
  ) => {
    setLoading(true);
    try {
      const repairers = await AISearchService.searchNearby(lat, lng, radiusKm);
      setResult({
        repairers,
        intent: {
          originalQuery: 'Recherche à proximité',
          keywords: [],
          confidence: 1,
          criteria: { nearest: true },
        },
        totalResults: repairers.length,
        searchTime: 0,
        usedFallback: false,
      });
      return repairers;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Auto-suggestions
  const fetchSuggestions = useCallback(async (partialQuery: string) => {
    if (partialQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    
    try {
      const results = await AISearchService.getSuggestions(partialQuery);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    }
  }, []);
  
  // Debounce auto-search
  useEffect(() => {
    if (!autoSearch || query.length < minQueryLength) return;
    
    const timer = setTimeout(() => {
      search(query);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [query, autoSearch, minQueryLength, debounceMs, search]);
  
  // Clear results
  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
    setSuggestions([]);
  }, []);
  
  return {
    // State
    query,
    setQuery,
    result,
    loading,
    error,
    suggestions,
    
    // Actions
    search,
    quickSearch,
    searchNearby,
    fetchSuggestions,
    clearResults,
    
    // Computed
    hasResults: result !== null && result.repairers.length > 0,
    repairers: result?.repairers || [],
    intent: result?.intent,
  };
}

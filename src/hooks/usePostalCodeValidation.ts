
import { useState, useCallback, useEffect } from "react";

interface PostalCodeCity {
  nom: string;
  code: string;
  codePostal: string;
  codeDepartement: string;
  codeRegion: string;
  population: number;
}

interface PostalCodeValidationResult {
  cities: PostalCodeCity[];
  loading: boolean;
  error: string | null;
  showCitySuggestions: boolean;
  showPostalSuggestions: boolean;
  isCityValid: boolean;
  isPostalValid: boolean;
  setShowCitySuggestions: (show: boolean) => void;
  setShowPostalSuggestions: (show: boolean) => void;
  handleCityInputChange: (value: string) => void;
  handlePostalCodeInputChange: (value: string) => void;
}

export const usePostalCodeValidation = (initialQuery: string = '', searchType: 'city' | 'postal' | 'auto' = 'auto') => {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<Omit<PostalCodeValidationResult, 'showCitySuggestions' | 'showPostalSuggestions' | 'isCityValid' | 'isPostalValid' | 'setShowCitySuggestions' | 'setShowPostalSuggestions' | 'handleCityInputChange' | 'handlePostalCodeInputChange'>>({
    cities: [],
    loading: false,
    error: null
  });

  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showPostalSuggestions, setShowPostalSuggestions] = useState(false);
  const [isCityValid, setIsCityValid] = useState(false);
  const [isPostalValid, setIsPostalValid] = useState(false);

  const detectSearchType = (query: string): 'city' | 'postal' => {
    if (/^\d{5}$/.test(query)) return 'postal';
    if (/^\d/.test(query)) return 'postal';
    return 'city';
  };

  const handleCityInputChange = useCallback((value: string) => {
    setQuery(value);
    setIsCityValid(value.length >= 2);
  }, []);

  const handlePostalCodeInputChange = useCallback((value: string) => {
    setQuery(value);
    setIsPostalValid(/^\d{5}$/.test(value));
  }, []);

  const fetchData = useCallback(async () => {
    if (!query || query.length < 2) {
      setResult({ cities: [], loading: false, error: null });
      return;
    }

    setResult(prev => ({ ...prev, loading: true, error: null }));

    try {
      const actualSearchType = searchType === 'auto' ? detectSearchType(query) : searchType;
      const baseUrl = 'https://geo.api.gouv.fr/communes';
      
      let url: string;
      if (actualSearchType === 'postal') {
        url = `${baseUrl}?codePostal=${encodeURIComponent(query)}&fields=nom,code,codesPostaux,codeDepartement,codeRegion,population&format=json&geometry=centre`;
      } else {
        url = `${baseUrl}?nom=${encodeURIComponent(query)}&fields=nom,code,codesPostaux,codeDepartement,codeRegion,population&format=json&geometry=centre&limit=10`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      
      const cities: PostalCodeCity[] = [];
      
      data.forEach((commune: any) => {
        if (commune.codesPostaux && commune.codesPostaux.length > 0) {
          commune.codesPostaux.forEach((codePostal: string) => {
            cities.push({
              nom: commune.nom,
              code: commune.code,
              codePostal: codePostal,
              codeDepartement: commune.codeDepartement,
              codeRegion: commune.codeRegion,
              population: commune.population || 0
            });
          });
        }
      });

      cities.sort((a, b) => b.population - a.population);

      setResult({ cities, loading: false, error: null });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setResult({
        cities: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }, [query, searchType]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  return {
    ...result,
    showCitySuggestions,
    showPostalSuggestions,
    isCityValid,
    isPostalValid,
    setShowCitySuggestions,
    setShowPostalSuggestions,
    handleCityInputChange,
    handlePostalCodeInputChange
  };
};

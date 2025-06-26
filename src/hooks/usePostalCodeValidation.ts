
import { useState, useEffect, useCallback } from "react";

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
}

export const usePostalCodeValidation = (query: string, searchType: 'city' | 'postal' | 'auto' = 'auto') => {
  const [result, setResult] = useState<PostalCodeValidationResult>({
    cities: [],
    loading: false,
    error: null
  });

  const detectSearchType = (query: string): 'city' | 'postal' => {
    // Si la query contient uniquement des chiffres et fait 5 caractères, c'est probablement un code postal
    if (/^\d{5}$/.test(query)) return 'postal';
    // Si la query commence par des chiffres, c'est probablement un code postal partiel
    if (/^\d/.test(query)) return 'postal';
    // Sinon, c'est probablement une ville
    return 'city';
  };

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
      
      // Transformer les données pour avoir une structure cohérente
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

      // Trier par population décroissante pour les villes les plus importantes en premier
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

  return result;
};

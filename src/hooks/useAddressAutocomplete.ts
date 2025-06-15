
import { useState, useEffect, useCallback } from "react";

interface AddressSuggestion {
  label: string;
  value: string;
  city: string;
  postal_code: string;
  lat: number;
  lng: number;
  context: string;
  department_code?: string;
}

export const useAddressAutocomplete = (query: string) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      const results: AddressSuggestion[] = (data.features || []).map((f: any) => {
        const coords = f.geometry?.coordinates || [0, 0];
        return {
          label: f.properties.label,
          value: f.properties.name || f.properties.label,
          city: f.properties.city || "",
          postal_code: f.properties.postcode || "",
          lat: coords[1], // latitude
          lng: coords[0], // longitude
          context: f.properties.context || "",
          department_code: f.properties.postcode?.substring(0, 2)
        };
      });
      setSuggestions(results);
    } catch (e) {
      console.error('Error fetching address suggestions:', e);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeout);
  }, [fetchSuggestions]);

  return { suggestions, loading };
};

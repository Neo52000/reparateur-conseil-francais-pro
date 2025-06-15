
import { useState, useEffect, useCallback } from "react";

interface AddressSuggestion {
  label: string;
  value: string;
  city: string;
  postal_code: string;
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
      const results: AddressSuggestion[] = (data.features || []).map((f: any) => ({
        label: f.properties.label,
        value: f.properties.name,
        city: f.properties.city || "",
        postal_code: f.properties.postcode || ""
      }));
      setSuggestions(results);
    } catch (e) {
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

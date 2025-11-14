import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Clock, TrendingUp, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchSuggestion {
  type: 'recent' | 'popular' | 'location' | 'service';
  text: string;
  subtitle?: string;
  icon?: typeof Clock;
}

interface PredictiveSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  userLocation?: string;
}

export const PredictiveSearchInput: React.FC<PredictiveSearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Rechercher un réparateur, une ville...",
  userLocation
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Charger les recherches récentes depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading recent searches', e);
      }
    }
  }, []);

  // Gérer les clics en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Suggestions populaires (à terme depuis l'API)
  const popularSearches: SearchSuggestion[] = [
    { type: 'popular', text: 'Réparation écran iPhone', icon: TrendingUp },
    { type: 'popular', text: 'Changement batterie Samsung', icon: TrendingUp },
    { type: 'popular', text: 'Réparation iPad', icon: TrendingUp },
  ];

  // Suggestions de localisation
  const locationSuggestions: SearchSuggestion[] = userLocation
    ? [
        {
          type: 'location',
          text: `Réparateurs près de ${userLocation}`,
          subtitle: userLocation,
          icon: MapPin,
        },
      ]
    : [];

  const allSuggestions: SearchSuggestion[] = [
    ...recentSearches.slice(0, 3).map(text => ({
      type: 'recent' as const,
      text,
      icon: Clock,
    })),
    ...locationSuggestions,
    ...popularSearches,
  ];

  const filteredSuggestions = value
    ? allSuggestions.filter(s =>
        s.text.toLowerCase().includes(value.toLowerCase())
      )
    : allSuggestions;

  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    // Sauvegarder dans les recherches récentes
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    setShowSuggestions(false);
    onSearch(query);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    handleSearch(suggestion.text);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(value);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-12 pr-12 h-14 text-lg shadow-lg border-2 focus:border-primary transition-all"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="absolute top-full mt-2 w-full z-50 shadow-xl border-2 max-h-96 overflow-y-auto">
              <div className="p-2 space-y-1">
                {/* Header avec clear button pour les recherches récentes */}
                {recentSearches.length > 0 && !value && (
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Recherches récentes
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}
                      className="h-auto py-1 px-2 text-xs"
                    >
                      Effacer
                    </Button>
                  </div>
                )}

                {filteredSuggestions.map((suggestion, index) => {
                  const Icon = suggestion.icon || Search;
                  
                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-muted transition-colors text-left group"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {suggestion.text}
                        </p>
                        {suggestion.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">
                            {suggestion.subtitle}
                          </p>
                        )}
                      </div>
                      {suggestion.type === 'popular' && (
                        <Badge variant="secondary" className="text-xs">
                          Populaire
                        </Badge>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

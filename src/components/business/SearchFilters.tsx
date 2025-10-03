import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, MapPin, Star, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export interface SearchFiltersState {
  maxDistance: number;
  minRating: number;
  isOpenNow: boolean;
  isCertified: boolean;
  isPremium: boolean;
  specialties: string[];
}

interface SearchFiltersProps {
  isOpen: boolean;
  filters: SearchFiltersState;
  onFiltersChange: (filters: SearchFiltersState) => void;
  onClose: () => void;
  availableSpecialties: string[];
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  isOpen,
  filters,
  onFiltersChange,
  onClose,
  availableSpecialties
}) => {
  const updateFilter = <K extends keyof SearchFiltersState>(
    key: K,
    value: SearchFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSpecialty = (specialty: string) => {
    const newSpecialties = filters.specialties.includes(specialty)
      ? filters.specialties.filter(s => s !== specialty)
      : [...filters.specialties, specialty];
    updateFilter('specialties', newSpecialties);
  };

  const resetFilters = () => {
    onFiltersChange({
      maxDistance: 50,
      minRating: 0,
      isOpenNow: false,
      isCertified: false,
      isPremium: false,
      specialties: []
    });
  };

  const activeFiltersCount = 
    (filters.isOpenNow ? 1 : 0) +
    (filters.isCertified ? 1 : 0) +
    (filters.isPremium ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxDistance < 50 ? 1 : 0) +
    filters.specialties.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />

          {/* Filters Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l z-50 overflow-y-auto"
          >
            <Card className="h-full rounded-none border-0">
              <CardHeader className="sticky top-0 bg-background z-10 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    <CardTitle>Filtres de recherche</CardTitle>
                    {activeFiltersCount > 0 && (
                      <Badge variant="info">{activeFiltersCount}</Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-6">
                {/* Distance */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Distance maximale
                    </Label>
                    <span className="text-sm font-medium">
                      {filters.maxDistance} km
                    </span>
                  </div>
                  <Slider
                    value={[filters.maxDistance]}
                    onValueChange={(value) => updateFilter('maxDistance', value[0])}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Rating */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      Note minimale
                    </Label>
                    <span className="text-sm font-medium">
                      {filters.minRating > 0 ? `${filters.minRating}+ ⭐` : 'Toutes'}
                    </span>
                  </div>
                  <Slider
                    value={[filters.minRating]}
                    onValueChange={(value) => updateFilter('minRating', value[0])}
                    min={0}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Quick Filters */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Filtres rapides</Label>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Ouvert maintenant</span>
                    </div>
                    <Switch
                      checked={filters.isOpenNow}
                      onCheckedChange={(checked) => updateFilter('isOpenNow', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-success" />
                      <span className="text-sm">Certifié uniquement</span>
                    </div>
                    <Switch
                      checked={filters.isCertified}
                      onCheckedChange={(checked) => updateFilter('isCertified', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm">Premium uniquement</span>
                    </div>
                    <Switch
                      checked={filters.isPremium}
                      onCheckedChange={(checked) => updateFilter('isPremium', checked)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Specialties */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Spécialités</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableSpecialties.map((specialty) => (
                      <Badge
                        key={specialty}
                        variant={filters.specialties.includes(specialty) ? "default" : "outline"}
                        className="cursor-pointer transition-all hover:scale-105"
                        onClick={() => toggleSpecialty(specialty)}
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="flex-1"
                  >
                    Réinitialiser
                  </Button>
                  <Button
                    variant="default"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Appliquer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

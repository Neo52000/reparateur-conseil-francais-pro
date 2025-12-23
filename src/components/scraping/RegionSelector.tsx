import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe2 } from 'lucide-react';
import { REGIONS } from './controls/scrapingConstants';

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (value: string) => void;
}

const RegionSelector = ({ selectedRegion, onRegionChange }: RegionSelectorProps) => {
  const selectedRegionData = REGIONS.find(r => r.name === selectedRegion);
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center">
        <Globe2 className="h-4 w-4 mr-2 text-primary" />
        Région entière
      </label>
      <Select value={selectedRegion} onValueChange={onRegionChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une région" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <SelectItem value="">-- Aucune région --</SelectItem>
          {REGIONS.map((region) => (
            <SelectItem key={region.name} value={region.name}>
              <div className="flex items-center justify-between w-full gap-2">
                <span>{region.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {region.departments.length} dép.
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedRegionData && (
        <div className="mt-2 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">
            Départements inclus ({selectedRegionData.departments.length}):
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedRegionData.departments.map((dept) => (
              <Badge key={dept.code} variant="outline" className="text-xs">
                {dept.code}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Scraper tous les départements d'une région en une seule opération
      </p>
    </div>
  );
};

export default RegionSelector;

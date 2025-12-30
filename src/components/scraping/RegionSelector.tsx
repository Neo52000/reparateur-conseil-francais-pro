import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe2, CheckCircle, Clock } from 'lucide-react';
import { REGIONS } from './controls/scrapingConstants';
import { useScrapedRegionsStats } from '@/hooks/useScrapedRegionsStats';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (value: string) => void;
}

const RegionSelector = ({ selectedRegion, onRegionChange }: RegionSelectorProps) => {
  const selectedRegionData = REGIONS.find(r => r.name === selectedRegion);
  const { regionStats, departmentStats, loading } = useScrapedRegionsStats();
  
  const getRegionIndicator = (regionName: string) => {
    const stats = regionStats.get(regionName);
    if (!stats || stats.totalRepairers === 0) return null;
    
    const coverage = Math.round((stats.scrapedDepartments / stats.totalDepartments) * 100);
    
    return {
      repairers: stats.totalRepairers,
      coverage,
      scrapedDepts: stats.scrapedDepartments,
      totalDepts: stats.totalDepartments,
      lastAdded: stats.lastAdded
    };
  };

  const getDepartmentIndicator = (deptCode: string) => {
    const stats = departmentStats.get(deptCode);
    if (!stats || stats.repairerCount === 0) return null;
    return stats;
  };
  
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
          {REGIONS.map((region) => {
            const indicator = getRegionIndicator(region.name);
            return (
              <SelectItem key={region.name} value={region.name}>
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2">
                    {indicator && (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    )}
                    <span>{region.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {indicator ? (
                      <>
                        <Badge variant="default" className="text-xs bg-green-500/20 text-green-700 border-green-500/30">
                          {indicator.repairers}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {indicator.scrapedDepts}/{indicator.totalDepts}
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        {region.departments.length} dép.
                      </Badge>
                    )}
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {selectedRegionData && (
        <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-2">
          {(() => {
            const indicator = getRegionIndicator(selectedRegionData.name);
            if (indicator) {
              return (
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>
                    {indicator.repairers} réparateurs • {indicator.scrapedDepts}/{indicator.totalDepts} départements scrapés
                    {indicator.lastAdded && (
                      <span className="text-muted-foreground ml-1">
                        • Mis à jour {formatDistanceToNow(new Date(indicator.lastAdded), { addSuffix: true, locale: fr })}
                      </span>
                    )}
                  </span>
                </div>
              );
            }
            return null;
          })()}
          
          <p className="text-xs text-muted-foreground">
            Départements ({selectedRegionData.departments.length}):
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedRegionData.departments.map((dept) => {
              const deptIndicator = getDepartmentIndicator(dept.code);
              return (
                <Badge 
                  key={dept.code} 
                  variant={deptIndicator ? "default" : "outline"} 
                  className={`text-xs ${deptIndicator ? 'bg-green-500/20 text-green-700 border-green-500/30' : ''}`}
                  title={deptIndicator ? `${deptIndicator.repairerCount} réparateurs, ${deptIndicator.cityCount} villes` : 'Non scrapé'}
                >
                  {dept.code}
                  {deptIndicator && <span className="ml-1 opacity-70">({deptIndicator.repairerCount})</span>}
                </Badge>
              );
            })}
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

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, CheckCircle } from 'lucide-react';
import { REGIONS } from './controls/scrapingConstants';
import { useScrapedRegionsStats } from '@/hooks/useScrapedRegionsStats';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DepartmentSelectorProps {
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
}

const DepartmentSelector = ({ selectedDepartment, onDepartmentChange }: DepartmentSelectorProps) => {
  const { departmentStats, loading } = useScrapedRegionsStats();
  
  const getDepartmentIndicator = (deptCode: string) => {
    const stats = departmentStats.get(deptCode);
    if (!stats || stats.repairerCount === 0) return null;
    return stats;
  };

  // Trouver le département sélectionné pour afficher les détails
  const selectedDeptInfo = (() => {
    for (const region of REGIONS) {
      const dept = region.departments.find(d => d.code === selectedDepartment);
      if (dept) return { ...dept, region: region.name };
    }
    return null;
  })();

  const selectedDeptStats = selectedDepartment ? getDepartmentIndicator(selectedDepartment) : null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center">
        <MapPin className="h-4 w-4 mr-2 text-primary" />
        Département cible
      </label>
      <Select value={selectedDepartment || "75"} onValueChange={onDepartmentChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un département" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {REGIONS.map((region) => (
            <React.Fragment key={region.name}>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                {region.name}
              </div>
              {region.departments.map((dept) => {
                const indicator = getDepartmentIndicator(dept.code);
                return (
                  <SelectItem key={dept.code} value={dept.code}>
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-2">
                        {indicator && (
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                        )}
                        <span>{dept.code} - {dept.name}</span>
                      </div>
                      {indicator && (
                        <Badge variant="default" className="text-xs bg-green-500/20 text-green-700 border-green-500/30 ml-2">
                          {indicator.repairerCount}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
      
      {selectedDeptStats && selectedDeptInfo && (
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-1.5 rounded">
          <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            {selectedDeptStats.repairerCount} réparateurs dans {selectedDeptStats.cityCount} villes
            {selectedDeptStats.lastAdded && (
              <span className="text-muted-foreground ml-1">
                • Mis à jour {formatDistanceToNow(new Date(selectedDeptStats.lastAdded), { addSuffix: true, locale: fr })}
              </span>
            )}
          </span>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Le scraping sera effectué pour ce département spécifique
      </p>
    </div>
  );
};

export default DepartmentSelector;

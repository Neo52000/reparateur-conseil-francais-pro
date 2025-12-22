
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { REGIONS } from './controls/scrapingConstants';

interface DepartmentSelectorProps {
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
}

const DepartmentSelector = ({ selectedDepartment, onDepartmentChange }: DepartmentSelectorProps) => {
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
              {region.departments.map((dept) => (
                <SelectItem key={dept.code} value={dept.code}>
                  {dept.code} - {dept.name}
                </SelectItem>
              ))}
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Le scraping sera effectué pour ce département spécifique
      </p>
    </div>
  );
};

export default DepartmentSelector;

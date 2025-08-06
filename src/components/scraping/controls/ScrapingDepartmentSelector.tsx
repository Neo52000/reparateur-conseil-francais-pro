
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS } from './scrapingConstants';

interface ScrapingDepartmentSelectorProps {
  selectedDepartment: string;
  onDepartmentChange: (department: string) => void;
}

const ScrapingDepartmentSelector: React.FC<ScrapingDepartmentSelectorProps> = ({
  selectedDepartment,
  onDepartmentChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Département cible</label>
      <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DEPARTMENTS.map((dept) => (
            <SelectItem key={dept.code} value={dept.code}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ScrapingDepartmentSelector;

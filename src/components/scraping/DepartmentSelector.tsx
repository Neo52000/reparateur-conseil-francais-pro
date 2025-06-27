
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

interface DepartmentSelectorProps {
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
}

const DepartmentSelector = ({ selectedDepartment, onDepartmentChange }: DepartmentSelectorProps) => {
  const departments = [
    { code: "75", name: "Paris" },
    { code: "13", name: "Bouches-du-Rhône" },
    { code: "69", name: "Rhône" },
    { code: "59", name: "Nord" },
    { code: "33", name: "Gironde" },
    { code: "31", name: "Haute-Garonne" },
    { code: "44", name: "Loire-Atlantique" },
    { code: "67", name: "Bas-Rhin" },
    { code: "06", name: "Alpes-Maritimes" },
    { code: "92", name: "Hauts-de-Seine" }
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center">
        <MapPin className="h-4 w-4 mr-2 text-blue-600" />
        Département cible
      </label>
      <Select value={selectedDepartment || "75"} onValueChange={onDepartmentChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un département" />
        </SelectTrigger>
        <SelectContent>
          {departments.map((dept) => (
            <SelectItem key={dept.code} value={dept.code}>
              {dept.code} - {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500">
        Le scraping sera effectué pour ce département spécifique
      </p>
    </div>
  );
};

export default DepartmentSelector;

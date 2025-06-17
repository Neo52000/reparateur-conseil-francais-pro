
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DepartmentSelectorProps {
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
}

const departments = [
  { code: 'all', name: 'Toute la France (101 départements)' },
  { code: '75', name: '75 - Paris' },
  { code: '69', name: '69 - Rhône (Lyon)' },
  { code: '13', name: '13 - Bouches-du-Rhône (Marseille)' },
  { code: '31', name: '31 - Haute-Garonne (Toulouse)' },
  { code: '06', name: '06 - Alpes-Maritimes (Nice)' },
  { code: '33', name: '33 - Gironde (Bordeaux)' },
  { code: '59', name: '59 - Nord (Lille)' },
  { code: '44', name: '44 - Loire-Atlantique (Nantes)' },
  { code: '67', name: '67 - Bas-Rhin (Strasbourg)' },
  { code: '35', name: '35 - Ille-et-Vilaine (Rennes)' },
  { code: '34', name: '34 - Hérault (Montpellier)' },
  { code: '38', name: '38 - Isère (Grenoble)' },
  { code: '76', name: '76 - Seine-Maritime (Rouen)' },
  { code: '62', name: '62 - Pas-de-Calais' },
  { code: '83', name: '83 - Var (Toulon)' },
  { code: '42', name: '42 - Loire (Saint-Étienne)' },
];

const DepartmentSelector = ({ selectedDepartment, onDepartmentChange }: DepartmentSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Zone géographique</label>
      <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une zone" />
        </SelectTrigger>
        <SelectContent>
          {departments.map((dept) => (
            <SelectItem key={dept.code} value={dept.code}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DepartmentSelector;

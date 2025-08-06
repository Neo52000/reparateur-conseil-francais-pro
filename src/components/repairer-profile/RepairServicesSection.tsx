
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RepairerProfile, REPAIR_TYPES } from '@/types/repairerProfile';

interface RepairServicesSectionProps {
  formData: RepairerProfile;
  setFormData: React.Dispatch<React.SetStateAction<RepairerProfile>>;
  onRepairTypeChange: (type: string, checked: boolean) => void;
}

const RepairServicesSection: React.FC<RepairServicesSectionProps> = ({ 
  formData, 
  setFormData, 
  onRepairTypeChange 
}) => {
  const hasAutresSelected = formData.repair_types.includes('autres');

  return (
    <>
      <div className="space-y-4">
        <h3 className="font-semibold">Types de réparations proposées</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {REPAIR_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={type.value}
                checked={formData.repair_types.includes(type.value)}
                onCheckedChange={(checked) => onRepairTypeChange(type.value, checked as boolean)}
              />
              <Label htmlFor={type.value}>{type.label}</Label>
            </div>
          ))}
        </div>

        {hasAutresSelected && (
          <div className="space-y-2">
            <Label htmlFor="other_services">Précisez vos autres services</Label>
            <Textarea
              id="other_services"
              value={formData.other_services || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, other_services: e.target.value }))}
              placeholder="Décrivez vos autres services de réparation..."
              rows={3}
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="has_qualirepar_label"
          checked={formData.has_qualirepar_label}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_qualirepar_label: checked as boolean }))}
        />
        <Label htmlFor="has_qualirepar_label">Possède le label QualiRépar</Label>
      </div>
    </>
  );
};

export default RepairServicesSection;

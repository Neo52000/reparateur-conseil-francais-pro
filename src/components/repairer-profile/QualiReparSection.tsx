
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RepairerProfile } from '@/types/repairerProfile';

interface QualiReparSectionProps {
  formData: RepairerProfile;
  setFormData: React.Dispatch<React.SetStateAction<RepairerProfile>>;
}

const QualiReparSection: React.FC<QualiReparSectionProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="has_qualirepar_label"
          checked={formData.has_qualirepar_label}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_qualirepar_label: checked as boolean }))}
        />
        <Label htmlFor="has_qualirepar_label">Label QualiRépar</Label>
      </div>
      <p className="text-sm text-gray-600">
        Le label QualiRépar est une certification officielle qui garantit la qualité des services de réparation. 
        Cochez cette case uniquement si vous possédez effectivement cette certification.
        <span className="text-blue-600 font-medium"> ✓ Boost SEO garanti</span> - Cette certification sera mise en avant dans votre description générée par IA.
      </p>
    </div>
  );
};

export default QualiReparSection;


import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RepairerProfile } from '@/types/repairerProfile';

interface BasicInfoSectionProps {
  formData: RepairerProfile;
  setFormData: React.Dispatch<React.SetStateAction<RepairerProfile>>;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, setFormData }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="business_name">Nom commercial *</Label>
          <Input
            id="business_name"
            value={formData.business_name}
            onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="siret_number">N° SIRET</Label>
          <Input
            id="siret_number"
            value={formData.siret_number || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, siret_number: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          placeholder="Décrivez votre activité, vos spécialités..."
        />
      </div>
    </>
  );
};

export default BasicInfoSection;

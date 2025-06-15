
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RepairerProfile, RepairerProfileFormProps } from '@/types/repairerProfile';
import { useRepairerProfileSave } from '@/hooks/useRepairerProfileSave';
import BasicInfoSection from './BasicInfoSection';
import ContactInfoSection from './ContactInfoSection';
import SocialMediaSection from './SocialMediaSection';
import RepairServicesSection from './RepairServicesSection';

const RepairerProfileFormMain: React.FC<RepairerProfileFormProps> = ({
  profile,
  onSave,
  onCancel,
  isAdmin = false
}) => {
  const [formData, setFormData] = useState(profile);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { saveProfile } = useRepairerProfileSave();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const savedProfile = await saveProfile(formData, profile);
      onSave(savedProfile);
      
      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRepairTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        repair_types: [...prev.repair_types, type]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        repair_types: prev.repair_types.filter(t => t !== type)
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInfoSection formData={formData} setFormData={setFormData} />
      <ContactInfoSection formData={formData} setFormData={setFormData} />
      <SocialMediaSection formData={formData} setFormData={setFormData} />
      <RepairServicesSection 
        formData={formData} 
        setFormData={setFormData}
        onRepairTypeChange={handleRepairTypeChange}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
};

export default RepairerProfileFormMain;

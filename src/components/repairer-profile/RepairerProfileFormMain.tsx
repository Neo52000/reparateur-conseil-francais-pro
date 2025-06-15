
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RepairerProfile, RepairerProfileFormProps } from '@/types/repairerProfile';
import { useRepairerProfileSave } from '@/hooks/useRepairerProfileSave';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BasicInfoSection from './BasicInfoSection';
import ContactInfoSection from './ContactInfoSection';
import SocialMediaSection from './SocialMediaSection';
import RepairServicesSection from './RepairServicesSection';
import BusinessInfoSection from './BusinessInfoSection';

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
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de sauvegarder le profil",
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
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Général</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="business">Entreprise</TabsTrigger>
          <TabsTrigger value="social">Réseaux</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <BasicInfoSection formData={formData} setFormData={setFormData} />
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <ContactInfoSection formData={formData} setFormData={setFormData} />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <RepairServicesSection 
            formData={formData} 
            setFormData={setFormData}
            onRepairTypeChange={handleRepairTypeChange}
          />
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <BusinessInfoSection formData={formData} setFormData={setFormData} />
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <SocialMediaSection formData={formData} setFormData={setFormData} />
        </TabsContent>
      </Tabs>

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

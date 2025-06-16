
import React, { useState, useEffect } from 'react';
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
import OpeningHoursSection from './OpeningHoursSection';

/**
 * Formulaire principal pour l'édition des profils réparateurs
 * Gère l'état local du formulaire et la sauvegarde
 */
const RepairerProfileFormMain: React.FC<RepairerProfileFormProps> = ({
  profile,
  onSave,
  onCancel,
  isAdmin = false
}) => {
  const [formData, setFormData] = useState<RepairerProfile>(profile);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { saveProfile } = useRepairerProfileSave();

  // S'assurer que les données du profil sont bien synchronisées
  useEffect(() => {
    console.log('📋 Profile data received in form:', {
      business_name: profile.business_name,
      repair_types: profile.repair_types,
      id: profile.id
    });
    
    // S'assurer que repair_types est un tableau
    const updatedProfile = {
      ...profile,
      repair_types: Array.isArray(profile.repair_types) ? profile.repair_types : []
    };
    
    setFormData(updatedProfile);
  }, [profile]);

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Form submission started...');
    console.log('📄 Form data to save:', formData);
    
    setLoading(true);

    try {
      // Sauvegarder le profil via le hook
      const savedProfile = await saveProfile(formData, profile);
      console.log('✅ Profile saved, calling onSave callback...');
      
      // Appeler le callback de sauvegarde
      onSave(savedProfile);

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès",
      });
    } catch (error: any) {
      console.error('❌ Error saving profile:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de sauvegarder le profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gère les changements de types de réparation
   */
  const handleRepairTypeChange = (type: string, checked: boolean) => {
    console.log('🔧 Repair type change:', { type, checked });
    
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Général</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="business">Entreprise</TabsTrigger>
          <TabsTrigger value="hours">Horaires</TabsTrigger>
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

        <TabsContent value="hours" className="space-y-4">
          <OpeningHoursSection formData={formData} setFormData={setFormData} />
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <SocialMediaSection formData={formData} setFormData={setFormData} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            console.log('❌ Form canceled');
            onCancel();
          }}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
};

export default RepairerProfileFormMain;

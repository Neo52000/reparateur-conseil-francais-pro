import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RepairerProfileForm from './RepairerProfileForm';
import RepairerProfileHeader from './profile/RepairerProfileHeader';
import GeneralInfoTab from './profile/GeneralInfoTab';
import ContactSocialTab from './profile/ContactSocialTab';
import ServicesTab from './profile/ServicesTab';
import { RepairerProfile, getMockProfile } from '@/services/mockRepairerProfiles';
import { useRepairers } from '@/hooks/useRepairers';

interface RepairerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  repairerId: string;
  isAdmin?: boolean;
}

const RepairerProfileModal: React.FC<RepairerProfileModalProps> = ({
  isOpen,
  onClose,
  repairerId,
  isAdmin = false
}) => {
  const [profile, setProfile] = useState<RepairerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { repairers } = useRepairers();

  useEffect(() => {
    if (isOpen && repairerId) {
      fetchProfile();
    }
  }, [isOpen, repairerId]);

  const createMockProfileFromRepairer = async (repairerId: string): Promise<RepairerProfile | null> => {
    try {
      // Récupérer le réparateur depuis la base de données Supabase
      const { data: repairer, error } = await supabase
        .from('repairers')
        .select('*')
        .eq('id', repairerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching repairer from database:', error);
        return null;
      }

      if (!repairer) {
        console.log('Repairer not found in database:', repairerId);
        return null;
      }

      // Créer un profil mocké basé sur les données du réparateur
      return {
        id: repairerId,
        user_id: repairerId,
        business_name: repairer.name,
        description: `${repairer.name} est un réparateur professionnel spécialisé dans la réparation d'appareils électroniques. Avec une expertise reconnue et des années d'expérience, nous offrons des services de qualité pour tous vos besoins de réparation.`,
        address: repairer.address,
        city: repairer.city,
        postal_code: repairer.postal_code,
        phone: repairer.phone || '+33 1 23 45 67 89',
        email: repairer.email || `contact@${repairer.name.toLowerCase().replace(/\s+/g, '')}.fr`,
        website: repairer.website || `https://www.${repairer.name.toLowerCase().replace(/\s+/g, '')}.fr`,
        siret_number: '12345678901234',
        repair_types: repairer.services || [],
        profile_image_url: null,
        facebook_url: `https://facebook.com/${repairer.name.toLowerCase().replace(/\s+/g, '')}`,
        twitter_url: `https://twitter.com/${repairer.name.toLowerCase().replace(/\s+/g, '')}`,
        instagram_url: `https://instagram.com/${repairer.name.toLowerCase().replace(/\s+/g, '')}`,
        linkedin_url: `https://linkedin.com/company/${repairer.name.toLowerCase().replace(/\s+/g, '')}`,
        has_qualirepar_label: Math.random() > 0.5,
        created_at: repairer.created_at,
        updated_at: repairer.updated_at
      };
    } catch (error) {
      console.error('Error creating profile from repairer data:', error);
      return null;
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      console.log('Fetching profile for repairer ID:', repairerId);
      
      // D'abord essayer de récupérer le profil depuis Supabase
      const { data, error } = await supabase
        .from('repairer_profiles')
        .select('*')
        .eq('user_id', repairerId)
        .maybeSingle();

      if (error && !error.message.includes('invalid input syntax for type uuid')) {
        throw error;
      }

      if (data) {
        console.log('Profile found in Supabase:', data);
        setProfile(data);
      } else {
        console.log('No profile in Supabase, trying to create from repairer data...');
        
        // Créer un profil depuis les données du réparateur dans la DB
        const profileFromRepairer = await createMockProfileFromRepairer(repairerId);
        
        if (profileFromRepairer) {
          console.log('Created profile from repairer data:', profileFromRepairer);
          setProfile(profileFromRepairer);
        } else {
          // En dernier recours, essayer les profils mockés existants
          const mockProfile = getMockProfile(repairerId);
          if (mockProfile) {
            console.log('Using existing mock profile:', mockProfile);
            setProfile(mockProfile);
          } else {
            console.log('No profile data available for repairer:', repairerId);
            setProfile(null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // En cas d'erreur, essayer de créer un profil depuis les données du réparateur
      const fallbackProfile = await createMockProfileFromRepairer(repairerId);
      if (fallbackProfile) {
        setProfile(fallbackProfile);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil du réparateur",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: RepairerProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
    toast({
      title: "Succès",
      description: "Profil mis à jour avec succès"
    });
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Profil non trouvé</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun profil trouvé pour ce réparateur.</p>
            <p className="text-sm text-gray-400 mt-2">Le réparateur n'a peut-être pas encore créé son profil.</p>
            <Button onClick={onClose} className="mt-4">Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isEditing) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
          </DialogHeader>
          <RepairerProfileForm
            profile={profile}
            onSave={handleProfileUpdate}
            onCancel={() => setIsEditing(false)}
            isAdmin={isAdmin}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <RepairerProfileHeader
            profile={profile}
            onEdit={() => setIsEditing(true)}
          />
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Informations générales</TabsTrigger>
            <TabsTrigger value="contact">Contact & Réseaux</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralInfoTab profile={profile} />
          </TabsContent>

          <TabsContent value="contact">
            <ContactSocialTab profile={profile} />
          </TabsContent>

          <TabsContent value="services">
            <ServicesTab profile={profile} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RepairerProfileModal;

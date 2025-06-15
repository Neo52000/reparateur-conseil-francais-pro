
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

  useEffect(() => {
    if (isOpen && repairerId) {
      fetchProfile();
    }
  }, [isOpen, repairerId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
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
        setProfile(data);
      } else {
        // Si pas de profil trouvé ou erreur UUID, utiliser les données mockées
        const mockProfile = getMockProfile(repairerId);
        setProfile(mockProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // En cas d'erreur, essayer les données mockées
      const mockProfile = getMockProfile(repairerId);
      if (mockProfile) {
        setProfile(mockProfile);
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

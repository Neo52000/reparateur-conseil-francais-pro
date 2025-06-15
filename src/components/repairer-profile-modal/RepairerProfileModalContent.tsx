
import React from 'react';
import { DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import RepairerProfileForm from '@/components/RepairerProfileForm';
import RepairerProfileHeader from '@/components/profile/RepairerProfileHeader';
import GeneralInfoTab from '@/components/profile/GeneralInfoTab';
import ContactSocialTab from '@/components/profile/ContactSocialTab';
import ServicesTab from '@/components/profile/ServicesTab';
import { RepairerProfile } from '@/types/repairerProfile';

interface RepairerProfileModalContentProps {
  profile: RepairerProfile;
  isEditing: boolean;
  isAdmin?: boolean;
  onEdit: () => void;
  onSave: (profile: RepairerProfile) => void;
  onCancel: () => void;
  onClose: () => void;
}

const RepairerProfileModalContent: React.FC<RepairerProfileModalContentProps> = ({
  profile,
  isEditing,
  isAdmin = false,
  onEdit,
  onSave,
  onCancel,
  onClose
}) => {
  if (isEditing) {
    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <h2 className="text-2xl font-semibold">Modifier le profil</h2>
        </DialogHeader>
        <RepairerProfileForm
          profile={profile}
          onSave={onSave}
          onCancel={onCancel}
          isAdmin={isAdmin}
        />
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <RepairerProfileHeader
          profile={profile}
          onEdit={onEdit}
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
  );
};

export default RepairerProfileModalContent;

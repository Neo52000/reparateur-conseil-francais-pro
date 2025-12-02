import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users } from 'lucide-react';
import AdminDataProcessingRegister from '@/components/gdpr/AdminDataProcessingRegister';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminGDPRTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Gestion RGPD</h2>
        <p className="text-muted-foreground">
          Outils de conformité et registre des traitements
        </p>
      </div>

      <Tabs defaultValue="register" className="w-full">
        <TabsList>
          <TabsTrigger value="register" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Registre des traitements
          </TabsTrigger>
          <TabsTrigger value="consents" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Consentements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="mt-6">
          <AdminDataProcessingRegister />
        </TabsContent>

        <TabsContent value="consents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des consentements</CardTitle>
              <CardDescription>
                Consultez l'historique des consentements RGPD de tous les utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fonctionnalité à venir : vue d'ensemble des consentements utilisateurs avec filtres par type et date.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminGDPRTab;

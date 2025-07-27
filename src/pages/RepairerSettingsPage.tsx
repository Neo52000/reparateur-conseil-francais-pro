import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, CreditCard, Mail } from 'lucide-react';
import { RepairerApiSettings } from '@/components/repairers/RepairerApiSettings';

const RepairerSettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Paramètres du réparateur</h1>
          <p className="text-muted-foreground mt-2">
            Configurez vos modules et paramètres API
          </p>
        </div>

        <Tabs defaultValue="api-settings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="api-settings" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Configuration API
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Paramètres généraux
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api-settings">
            <RepairerApiSettings />
          </TabsContent>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
                <CardDescription>
                  Configuration générale de votre compte réparateur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  D'autres paramètres seront ajoutés ici prochainement.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RepairerSettingsPage;
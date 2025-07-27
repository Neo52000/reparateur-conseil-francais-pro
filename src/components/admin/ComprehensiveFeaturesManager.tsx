import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OptionalModulesManagerDB from '@/components/OptionalModulesManagerDB';
import AdminFeatureFlags from '@/components/AdminFeatureFlags';
import FooterManager from '@/components/admin/FooterManager';
import { 
  Settings, 
  Package, 
  Flag, 
  Layout,
  Info
} from 'lucide-react';

export default function ComprehensiveFeaturesManager() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Gestion des Fonctionnalités</h1>
          <p className="text-muted-foreground">
            Configuration complète des modules, flags et éléments de l'interface
          </p>
        </div>
      </div>

      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Modules Optionnels
          </TabsTrigger>
          <TabsTrigger value="flags" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Footer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Configuration des Modules Optionnels
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gérez les modules disponibles pour chaque plan d'abonnement. 
                Les modules actifs sont proposés aux réparateurs selon leur niveau d'abonnement.
              </p>
            </CardHeader>
            <CardContent>
              <OptionalModulesManagerDB />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Feature Flags
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Activez ou désactivez des fonctionnalités spécifiques de l'application 
                sans redéploiement. Idéal pour les tests A/B et le déploiement progressif.
              </p>
            </CardHeader>
            <CardContent>
              <AdminFeatureFlags />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Configuration du Footer
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Personnalisez le contenu du footer de manière dynamique. 
                Utilisez l'IA pour générer du contenu optimisé et gérez les liens facilement.
              </p>
            </CardHeader>
            <CardContent>
              <FooterManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Section d'aide */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Info className="h-5 w-5" />
            Guide d'utilisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Modules Optionnels</h4>
            <p className="text-sm text-blue-700">
              Les modules permettent d'étendre les fonctionnalités selon le plan d'abonnement. 
              Configurez le prix et les plans disponibles pour chaque module.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Feature Flags</h4>
            <p className="text-sm text-blue-700">
              Contrôlez l'activation des fonctionnalités en temps réel. 
              Parfait pour tester de nouvelles features ou faire des déploiements progressifs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Footer Dynamique</h4>
            <p className="text-sm text-blue-700">
              Modifiez le contenu du footer sans intervention technique. 
              L'IA peut vous aider à générer du contenu optimisé pour le SEO.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
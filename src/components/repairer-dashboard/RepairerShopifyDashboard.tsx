import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Package, BarChart3, Settings } from 'lucide-react';
import ShopifyStoreActivation from '@/components/shopify/ShopifyStoreActivation';
import ShopifyOrdersManager from '@/components/shopify/ShopifyOrdersManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RepairerShopifyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('activation');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">E-commerce Shopify</h1>
        <p className="text-muted-foreground mt-2">
          Gérez votre boutique en ligne et vendez vos produits/services
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activation" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Ma Boutique
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Commandes
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activation" className="space-y-6">
          <ShopifyStoreActivation />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <ShopifyOrdersManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques Shopify</CardTitle>
              <CardDescription>
                Consultez vos statistiques détaillées directement dans votre admin Shopify
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Les statistiques e-commerce complètes sont disponibles dans votre tableau de bord Shopify.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Shopify</CardTitle>
              <CardDescription>
                Gérez les paramètres de votre boutique depuis l'admin Shopify
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Personnalisez votre boutique, configurez les paiements, les expéditions et bien plus depuis votre admin Shopify.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RepairerShopifyDashboard;

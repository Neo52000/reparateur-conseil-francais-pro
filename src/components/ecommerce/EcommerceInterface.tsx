import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Settings,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import { ProductsManagement } from './ProductsManagement';
import { OrdersManagement } from './OrdersManagement';
import { CustomersManagement } from './CustomersManagement';
import { StoreSettings } from './StoreSettings';
import EcommerceAnalytics from './EcommerceAnalytics';
import { StoreFront } from './StoreFront';
import InventoryManagement from './InventoryManagement';
import UserPreferences from './UserPreferences';
import NotificationCenter from './NotificationCenter';

interface EcommerceInterfaceProps {
  onBackToDashboard?: () => void;
}

const EcommerceInterface: React.FC<EcommerceInterfaceProps> = ({ 
  onBackToDashboard 
}) => {
  const [activeTab, setActiveTab] = useState('storefront');
  const { hasModuleAccess } = useModuleAccess();

  // Vérifier l'accès au module e-commerce
  if (!hasModuleAccess('ecommerce')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Accès E-commerce Requis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Vous devez activer le module E-commerce pour accéder à cette interface.
            </p>
            {onBackToDashboard && (
              <Button onClick={onBackToDashboard} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBackToDashboard && (
                <Button 
                  variant="ghost" 
                  onClick={onBackToDashboard}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Store className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">E-commerce</h1>
                  <p className="text-sm text-muted-foreground">
                    Gestion de votre boutique en ligne
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                <Store className="w-3 h-3 mr-1" />
                Module Actif
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 lg:w-fit">
            <TabsTrigger value="storefront" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Vitrine</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Produits</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Commandes</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Stock</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Préférences</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="storefront" className="space-y-6">
            <StoreFront />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomersManagement />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <InventoryManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <EcommerceAnalytics />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <UserPreferences />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <StoreSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EcommerceInterface;
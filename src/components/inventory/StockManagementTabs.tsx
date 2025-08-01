import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntelligentInventoryManagement } from './IntelligentInventoryManagement';
import { SupplierManagement } from './SupplierManagement';
import { AIStockDashboard } from './AIStockDashboard';
import { 
  Package, 
  Truck, 
  Brain, 
  BarChart3 
} from 'lucide-react';

export const StockManagementTabs: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion Intelligente des Stocks</h1>
        <p className="text-muted-foreground mt-2">
          Système complet de gestion d'inventaire avec IA, fournisseurs et analytics avancées
        </p>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventaire
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Fournisseurs
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA & Suggestions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <IntelligentInventoryManagement />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <SupplierManagement />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <AIStockDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder pour analytics avancées */}
            <div className="col-span-full text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Analytics Avancées</h3>
              <p className="text-muted-foreground">
                Tableaux de bord détaillés avec métriques de performance, 
                prévisions de demande et optimisation automatique des stocks.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
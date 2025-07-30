import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Smartphone, Tag, Wrench, BarChart3, Plus, Edit, Trash2, TrendingUp, AlertTriangle } from 'lucide-react';
import DeviceTypesManagement from './DeviceTypesManagement';
import BrandsManagement from './BrandsManagement';
import DeviceModelsManagement from './DeviceModelsManagement';
import RepairTypesManagement from './RepairTypesManagement';
import CatalogAnalytics from './CatalogAnalytics';
interface CatalogStats {
  deviceTypes: number;
  brands: number;
  deviceModels: number;
  repairTypes: number;
  totalQuotes: number;
  unmatchedQuotes: number;
}
const CatalogManagement: React.FC = () => {
  const [stats, setStats] = useState<CatalogStats>({
    deviceTypes: 0,
    brands: 0,
    deviceModels: 0,
    repairTypes: 0,
    totalQuotes: 0,
    unmatchedQuotes: 0
  });
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          
          
        </div>
      </div>

      {/* Statistiques du catalogue */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Types d'appareils</p>
                <p className="text-2xl font-bold">{stats.deviceTypes}</p>
              </div>
              <Smartphone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Marques</p>
                <p className="text-2xl font-bold">{stats.brands}</p>
              </div>
              <Tag className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Modèles</p>
                <p className="text-2xl font-bold">{stats.deviceModels}</p>
              </div>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Types réparation</p>
                <p className="text-2xl font-bold">{stats.repairTypes}</p>
              </div>
              <Wrench className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Devis liés</p>
                <p className="text-2xl font-bold text-primary">{stats.totalQuotes}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gaps détectés</p>
                <p className="text-2xl font-bold text-red-600">{stats.unmatchedQuotes}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes importantes */}
      {stats.unmatchedQuotes > 0 && <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-900">Attention : Gaps dans le catalogue détectés</h4>
                <p className="text-sm text-orange-700">
                  {stats.unmatchedQuotes} devis ne correspondent à aucun élément du catalogue. 
                  Consultez l'onglet "Analytics" pour plus de détails.
                </p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Analyser
              </Button>
            </div>
          </CardContent>
        </Card>}

      <Tabs defaultValue="device-types" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="device-types" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Types d'appareils
          </TabsTrigger>
          <TabsTrigger value="brands" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Marques
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Modèles
          </TabsTrigger>
          <TabsTrigger value="repair-types" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Types de réparation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="device-types">
          <DeviceTypesManagement onStatsUpdate={count => setStats(prev => ({
          ...prev,
          deviceTypes: count
        }))} />
        </TabsContent>

        <TabsContent value="brands">
          <BrandsManagement onStatsUpdate={count => setStats(prev => ({
          ...prev,
          brands: count
        }))} />
        </TabsContent>

        <TabsContent value="models">
          <DeviceModelsManagement onStatsUpdate={count => setStats(prev => ({
          ...prev,
          deviceModels: count
        }))} />
        </TabsContent>

        <TabsContent value="repair-types">
          <RepairTypesManagement onStatsUpdate={count => setStats(prev => ({
          ...prev,
          repairTypes: count
        }))} />
        </TabsContent>

        <TabsContent value="analytics">
          <CatalogAnalytics onStatsUpdate={analyticsStats => setStats(prev => ({
          ...prev,
          totalQuotes: analyticsStats.totalQuotes,
          unmatchedQuotes: analyticsStats.unmatchedQuotes
        }))} />
        </TabsContent>
      </Tabs>
    </div>;
};
export default CatalogManagement;
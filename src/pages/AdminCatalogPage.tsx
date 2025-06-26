
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Package, Wrench, DollarSign, Settings } from 'lucide-react';
import BrandsManagement from '@/components/catalog/BrandsManagement';
import DeviceModelsManagement from '@/components/catalog/DeviceModelsManagement';
import RepairTypesManagement from '@/components/catalog/RepairTypesManagement';
import RepairPricesManagement from '@/components/catalog/RepairPricesManagement';

const AdminCatalogPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('brands');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/admin')} 
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour Admin
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Gestion du Catalogue</h1>
                <p className="text-sm text-gray-600">
                  Gérer les marques, modèles d'appareils et types de réparations
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="brands" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Marques & Modèles
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Modèles d'appareils
            </TabsTrigger>
            <TabsTrigger value="repairs" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Types de réparations
            </TabsTrigger>
            <TabsTrigger value="prices" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Grille tarifaire
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brands">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Marques</CardTitle>
              </CardHeader>
              <CardContent>
                <BrandsManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Modèles d'Appareils</CardTitle>
              </CardHeader>
              <CardContent>
                <DeviceModelsManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="repairs">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Types de Réparations</CardTitle>
              </CardHeader>
              <CardContent>
                <RepairTypesManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prices">
            <Card>
              <CardHeader>
                <CardTitle>Grille Tarifaire Recommandée</CardTitle>
              </CardHeader>
              <CardContent>
                <RepairPricesManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminCatalogPage;

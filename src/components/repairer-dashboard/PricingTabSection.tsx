import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, List, Plus } from 'lucide-react';
import FullCatalogSection from './FullCatalogSection';
import CustomPriceModal from './CustomPriceModal';
import { useRepairerPrices } from '@/hooks/catalog/useRepairerPrices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Calculator, Sparkles, Euro, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RepairerCustomPrice } from '@/types/repairerPricing';

const PricingTabSection = () => {
  const { repairerPrices, basePrices, loading, createCustomPrice, updateCustomPrice, deleteCustomPrice, bulkApplyMargin } = useRepairerPrices();
  const [customPriceModal, setCustomPriceModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);

  const handleCreatePrice = async (data: any) => {
    await createCustomPrice(data);
  };

  const handleEditPrice = (price: RepairerCustomPrice) => {
    setEditingPrice(price);
    setCustomPriceModal(true);
  };

  const handleUpdatePrice = async (data: any) => {
    if (editingPrice) {
      await updateCustomPrice(editingPrice.id, data);
    }
  };

  const handleDeletePrice = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce prix personnalisé ?')) {
      await deleteCustomPrice(id);
    }
  };

  const getMarginBadge = (margin?: number) => {
    if (!margin) return null;
    
    if (margin > 0) {
      return <Badge variant="default" className="bg-green-100 text-green-800">+{margin}%</Badge>;
    } else if (margin < 0) {
      return <Badge variant="destructive">-{Math.abs(margin)}%</Badge>;
    }
    return <Badge variant="outline">0%</Badge>;
  };

  const getPriceComparison = (customPrice: number, basePrice: number) => {
    const diff = customPrice - basePrice;
    const percentage = (diff / basePrice) * 100;
    
    if (diff > 0) {
      return (
        <div className="flex items-center text-green-600 text-sm">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{diff.toFixed(2)}€ ({percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%)
        </div>
      );
    } else if (diff < 0) {
      return (
        <div className="flex items-center text-red-600 text-sm">
          <TrendingDown className="h-3 w-3 mr-1" />
          {diff.toFixed(2)}€ ({percentage.toFixed(1)}%)
        </div>
      );
    }
    return <div className="text-gray-500 text-sm">Identique</div>;
  };

  const stats = {
    total: repairerPrices.length,
    customized: repairerPrices.filter(p => p.custom_price_eur !== p.repair_price?.price_eur).length,
    avgMargin: repairerPrices.length > 0 
      ? repairerPrices.reduce((sum, p) => sum + (p.margin_percentage || 0), 0) / repairerPrices.length 
      : 0
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="catalog" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Catalogue complet</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center space-x-2">
            <List className="h-4 w-4" />
            <span>Prix personnalisés</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="mt-6">
          <FullCatalogSection />
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Mes Tarifs Personnalisés</h3>
                <p className="text-sm text-gray-600">
                  Gérez vos prix de réparation basés sur le catalogue de référence
                </p>
              </div>
              <button
                onClick={() => setCustomPriceModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Plus className="h-4 w-4" />
                <span>Personnaliser un prix</span>
              </button>
            </div>
            
            <div className="text-center py-8 text-gray-500">
              <p>Cette section affiche vos prix personnalisés existants.</p>
              <p className="text-sm mt-2">Utilisez l'onglet "Catalogue complet" pour une gestion avancée.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de création/édition */}
      <CustomPriceModal
        isOpen={customPriceModal}
        onClose={() => setCustomPriceModal(false)}
        onSave={createCustomPrice}
        editingPrice={editingPrice}
        basePrices={basePrices}
      />
    </div>
  );
};

export default PricingTabSection;

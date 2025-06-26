
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, Calculator, Sparkles, Euro, Edit, Trash2 } from 'lucide-react';
import { useRepairerPrices } from '@/hooks/catalog/useRepairerPrices';
import { useToast } from '@/hooks/use-toast';
import CustomPriceModal from './CustomPriceModal';
import type { RepairerCustomPrice } from '@/types/repairerPricing';

const PricingTabSection = () => {
  const { repairerPrices, basePrices, loading, createCustomPrice, updateCustomPrice, deleteCustomPrice, bulkApplyMargin } = useRepairerPrices();
  const { toast } = useToast();
  const [marginDialog, setMarginDialog] = useState(false);
  const [bulkMargin, setBulkMargin] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [customPriceModal, setCustomPriceModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<RepairerCustomPrice | null>(null);

  const handleApplyMargin = async () => {
    if (!bulkMargin) return;
    
    try {
      await bulkApplyMargin(parseFloat(bulkMargin));
      setMarginDialog(false);
      setBulkMargin('');
    } catch (error) {
      console.error('Error applying margin:', error);
    }
  };

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

  const handleCloseModal = () => {
    setCustomPriceModal(false);
    setEditingPrice(null);
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

  const filteredPrices = repairerPrices.filter(price => {
    switch (selectedFilter) {
      case 'customized':
        return price.custom_price_eur !== price.repair_price?.price_eur;
      case 'default':
        return price.custom_price_eur === price.repair_price?.price_eur;
      case 'high_margin':
        return (price.margin_percentage || 0) > 20;
      default:
        return true;
    }
  });

  if (loading) {
    return <div className="flex justify-center p-8">Chargement de vos tarifs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Mes Tarifs Personnalisés</h3>
          <p className="text-sm text-gray-600">
            Gérez vos prix de réparation basés sur le catalogue de référence
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={marginDialog} onOpenChange={setMarginDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
                Appliquer marge
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Appliquer une marge globale</DialogTitle>
                <DialogDescription>
                  Cette marge sera appliquée à tous vos prix de réparation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Marge (%)</label>
                  <Input
                    type="number"
                    value={bulkMargin}
                    onChange={(e) => setBulkMargin(e.target.value)}
                    placeholder="Ex: 15 pour +15%"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setMarginDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleApplyMargin}>
                    Appliquer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => setCustomPriceModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Personnaliser un prix
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix configurés</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.customized} personnalisé(s)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marge moyenne</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgMargin > 0 ? '+' : ''}{stats.avgMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix de base</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basePrices.length}</div>
            <p className="text-xs text-muted-foreground">
              Dans le catalogue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les prix</SelectItem>
            <SelectItem value="customized">Personnalisés seulement</SelectItem>
            <SelectItem value="default">Prix par défaut</SelectItem>
            <SelectItem value="high_margin">Marge élevée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tableau des prix */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Appareil</TableHead>
                <TableHead>Réparation</TableHead>
                <TableHead>Prix de base</TableHead>
                <TableHead>Mon prix</TableHead>
                <TableHead>Différence</TableHead>
                <TableHead>Marge</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {price.repair_price?.device_model?.brand?.name} {price.repair_price?.device_model?.model_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {price.repair_price?.repair_type?.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono">
                      {price.repair_price?.price_eur.toFixed(2)}€
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono font-bold">
                      {price.custom_price_eur.toFixed(2)}€
                    </div>
                  </TableCell>
                  <TableCell>
                    {price.repair_price && getPriceComparison(price.custom_price_eur, price.repair_price.price_eur)}
                  </TableCell>
                  <TableCell>
                    {getMarginBadge(price.margin_percentage)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditPrice(price)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeletePrice(price.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredPrices.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun prix personnalisé configuré</p>
              <p className="text-sm text-gray-400 mt-2">
                Commencez par personnaliser les prix du catalogue de base
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création/édition */}
      <CustomPriceModal
        isOpen={customPriceModal}
        onClose={handleCloseModal}
        onSave={editingPrice ? handleUpdatePrice : handleCreatePrice}
        editingPrice={editingPrice}
        basePrices={basePrices}
      />
    </div>
  );
};

export default PricingTabSection;

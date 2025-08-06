import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Plus, Trash2, Edit, Target, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  description?: string;
  isDefault: boolean;
  categories: string[];
  regions?: string[];
  isActive: boolean;
}

interface TaxCategory {
  id: string;
  name: string;
  description: string;
  taxRateId: string;
  examples: string[];
}

interface TaxManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTaxRate: any;
  onSave: (taxConfig: any) => void;
}

const TaxManagementModal: React.FC<TaxManagementModalProps> = ({
  open,
  onOpenChange,
  currentTaxRate,
  onSave
}) => {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    {
      id: 'standard',
      name: 'TVA Standard',
      rate: 20,
      description: 'Taux normal applicable aux biens et services',
      isDefault: true,
      categories: ['general', 'electronics'],
      isActive: true
    },
    {
      id: 'reduced',
      name: 'TVA Réduite',
      rate: 10,
      description: 'Taux réduit pour certains produits',
      isDefault: false,
      categories: ['books', 'culture'],
      isActive: true
    },
    {
      id: 'super_reduced',
      name: 'TVA Super Réduite',
      rate: 5.5,
      description: 'Taux super réduit (produits de première nécessité)',
      isDefault: false,
      categories: ['food', 'medical'],
      isActive: true
    },
    {
      id: 'zero',
      name: 'TVA à 0%',
      rate: 0,
      description: 'Exonération de TVA',
      isDefault: false,
      categories: ['export', 'education'],
      isActive: false
    }
  ]);

  const [categories, setCategories] = useState<TaxCategory[]>([
    {
      id: 'general',
      name: 'Général',
      description: 'Produits et services généraux',
      taxRateId: 'standard',
      examples: ['Réparations standard', 'Accessoires']
    },
    {
      id: 'electronics',
      name: 'Électronique',
      description: 'Appareils électroniques et composants',
      taxRateId: 'standard',
      examples: ['Écrans', 'Batteries', 'Circuits']
    }
  ]);

  const [newRate, setNewRate] = useState({
    name: '',
    rate: 0,
    description: '',
    categories: [] as string[]
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    taxRateId: 'standard',
    examples: ''
  });

  const [testAmount, setTestAmount] = useState(100);
  const [showAddRate, setShowAddRate] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  
  const { toast } = useToast();

  const addTaxRate = () => {
    if (!newRate.name.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom pour le taux de TVA",
        variant: "destructive"
      });
      return;
    }

    const rate: TaxRate = {
      id: `custom_${Date.now()}`,
      name: newRate.name,
      rate: newRate.rate,
      description: newRate.description,
      isDefault: false,
      categories: newRate.categories,
      isActive: true
    };

    setTaxRates([...taxRates, rate]);
    setNewRate({ name: '', rate: 0, description: '', categories: [] });
    setShowAddRate(false);
    
    toast({
      title: "Taux ajouté",
      description: `Le taux "${rate.name}" a été ajouté avec succès.`
    });
  };

  const addCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom pour la catégorie",
        variant: "destructive"
      });
      return;
    }

    const category: TaxCategory = {
      id: `cat_${Date.now()}`,
      name: newCategory.name,
      description: newCategory.description,
      taxRateId: newCategory.taxRateId,
      examples: newCategory.examples.split(',').map(e => e.trim()).filter(e => e)
    };

    setCategories([...categories, category]);
    setNewCategory({ name: '', description: '', taxRateId: 'standard', examples: '' });
    setShowAddCategory(false);
    
    toast({
      title: "Catégorie ajoutée",
      description: `La catégorie "${category.name}" a été ajoutée avec succès.`
    });
  };

  const toggleRateDefault = (id: string) => {
    setTaxRates(rates => rates.map(rate => ({
      ...rate,
      isDefault: rate.id === id ? true : false
    })));
  };

  const toggleRateActive = (id: string) => {
    setTaxRates(rates => rates.map(rate => 
      rate.id === id ? { ...rate, isActive: !rate.isActive } : rate
    ));
  };

  const deleteRate = (id: string) => {
    if (['standard', 'reduced', 'super_reduced', 'zero'].includes(id)) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les taux de TVA par défaut",
        variant: "destructive"
      });
      return;
    }

    setTaxRates(rates => rates.filter(rate => rate.id !== id));
    toast({
      title: "Taux supprimé",
      description: "Le taux de TVA a été supprimé avec succès."
    });
  };

  const calculateTax = (amount: number, rateId: string) => {
    const rate = taxRates.find(r => r.id === rateId);
    if (!rate) return { tax: 0, total: amount };
    
    const tax = (amount * rate.rate) / 100;
    return { tax, total: amount + tax };
  };

  const handleSave = () => {
    const defaultRate = taxRates.find(rate => rate.isDefault) || taxRates[0];
    const activeRates = taxRates.filter(rate => rate.isActive);
    
    const taxConfig = {
      rates: activeRates,
      default_rate: defaultRate,
      categories: categories,
      calculation_type: 'inclusive', // ou 'exclusive'
      display_tax_details: true
    };

    onSave(taxConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Gestion avancée de la TVA
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="rates" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rates">Taux de TVA</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
            <TabsTrigger value="calculator">Calculateur</TabsTrigger>
            <TabsTrigger value="regions">Régions</TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Taux de TVA configurés</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddRate(!showAddRate)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un taux
              </Button>
            </div>

            {taxRates.map((rate) => (
              <Card key={rate.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-medium">{rate.name}</h4>
                        <p className="text-sm text-muted-foreground">{rate.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="font-mono">
                          {rate.rate}%
                        </Badge>
                        {rate.isDefault && (
                          <Badge variant="default">Par défaut</Badge>
                        )}
                        <Badge variant={rate.isActive ? "default" : "secondary"}>
                          {rate.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRateDefault(rate.id)}
                        disabled={rate.isDefault}
                      >
                        <Target className="w-4 h-4" />
                      </Button>
                      <Switch
                        checked={rate.isActive}
                        onCheckedChange={() => toggleRateActive(rate.id)}
                      />
                      {!['standard', 'reduced', 'super_reduced', 'zero'].includes(rate.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRate(rate.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {rate.categories.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Catégories associées:</p>
                      <div className="flex gap-2 flex-wrap">
                        {rate.categories.map(catId => {
                          const category = categories.find(c => c.id === catId);
                          return category ? (
                            <Badge key={catId} variant="secondary">
                              {category.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {showAddRate && (
              <Card>
                <CardHeader>
                  <CardTitle>Ajouter un taux de TVA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rate-name">Nom du taux</Label>
                      <Input
                        id="rate-name"
                        value={newRate.name}
                        onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
                        placeholder="Ex: TVA Spéciale"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rate-value">Taux (%)</Label>
                      <Input
                        id="rate-value"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={newRate.rate}
                        onChange={(e) => setNewRate({ ...newRate, rate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate-description">Description</Label>
                    <Textarea
                      id="rate-description"
                      value={newRate.description}
                      onChange={(e) => setNewRate({ ...newRate, description: e.target.value })}
                      placeholder="Description du taux de TVA..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddRate(false)}>
                      Annuler
                    </Button>
                    <Button onClick={addTaxRate}>
                      Ajouter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Catégories de produits</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddCategory(!showAddCategory)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une catégorie
              </Button>
            </div>

            {categories.map((category) => {
              const associatedRate = taxRates.find(r => r.id === category.taxRateId);
              return (
                <Card key={category.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                        {category.examples.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-1">Exemples:</p>
                            <div className="flex gap-1 flex-wrap">
                              {category.examples.map((example, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {example}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {associatedRate && (
                          <Badge variant="default">
                            {associatedRate.name} ({associatedRate.rate}%)
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {showAddCategory && (
              <Card>
                <CardHeader>
                  <CardTitle>Ajouter une catégorie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Nom de la catégorie</Label>
                      <Input
                        id="cat-name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="Ex: Produits médicaux"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-tax">Taux de TVA associé</Label>
                      <select
                        id="cat-tax"
                        className="w-full px-3 py-2 border rounded-md"
                        value={newCategory.taxRateId}
                        onChange={(e) => setNewCategory({ ...newCategory, taxRateId: e.target.value })}
                      >
                        {taxRates.filter(r => r.isActive).map(rate => (
                          <option key={rate.id} value={rate.id}>
                            {rate.name} ({rate.rate}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-description">Description</Label>
                    <Textarea
                      id="cat-description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="Description de la catégorie..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-examples">Exemples (séparés par des virgules)</Label>
                    <Input
                      id="cat-examples"
                      value={newCategory.examples}
                      onChange={(e) => setNewCategory({ ...newCategory, examples: e.target.value })}
                      placeholder="Exemple 1, Exemple 2, Exemple 3"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddCategory(false)}>
                      Annuler
                    </Button>
                    <Button onClick={addCategory}>
                      Ajouter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calculator" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Calculateur de TVA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-amount">Montant de test (€)</Label>
                    <Input
                      id="test-amount"
                      type="number"
                      step="0.01"
                      value={testAmount}
                      onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Calculs par taux de TVA</h4>
                  {taxRates.filter(r => r.isActive).map(rate => {
                    const calc = calculateTax(testAmount, rate.id);
                    return (
                      <Card key={rate.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">{rate.name}</h5>
                              <p className="text-sm text-muted-foreground">{rate.rate}%</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">HT: {testAmount.toFixed(2)}€</p>
                              <p className="text-sm text-muted-foreground">TVA: {calc.tax.toFixed(2)}€</p>
                              <p className="font-bold">TTC: {calc.total.toFixed(2)}€</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Configuration par région
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Fonctionnalité à venir : Configuration des taux de TVA par région/pays
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Sauvegarder la configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaxManagementModal;
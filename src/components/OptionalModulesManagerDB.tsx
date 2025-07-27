import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { useOptionalModulesDB, OptionalModuleDB } from '@/hooks/useOptionalModulesDB';
import { Settings, Edit, Save, Plus, Trash2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OptionalModulesManagerDB() {
  const { modules, loading, saving, toggleModule, updateModulePricing, updateAvailablePlans, updateModule, createModule, deleteModule } = useOptionalModulesDB();
  const [editingModule, setEditingModule] = useState<OptionalModuleDB | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    module_id: '',
    module_name: '',
    description: '',
    icon: '',
    category: '',
    features: [] as string[],
    color: '#6b7280',
    is_active: false,
    pricing_monthly: 0,
    pricing_yearly: 0,
    available_plans: [] as string[]
  });

  const availablePlans = ['free', 'basic', 'pro', 'premium', 'enterprise'];
  const categories = ['Point de Vente', 'E-commerce', 'Gestion', 'Marketing', 'Analytics', 'Autre'];

  const resetForm = () => {
    setFormData({
      module_id: '',
      module_name: '',
      description: '',
      icon: '',
      category: '',
      features: [],
      color: '#6b7280',
      is_active: false,
      pricing_monthly: 0,
      pricing_yearly: 0,
      available_plans: []
    });
    setEditingModule(null);
  };

  const openEditDialog = (module: OptionalModuleDB) => {
    setEditingModule(module);
    setFormData({
      module_id: module.module_id,
      module_name: module.module_name,
      description: module.description,
      icon: module.icon,
      category: module.category,
      features: module.features,
      color: module.color,
      is_active: module.is_active,
      pricing_monthly: module.pricing_monthly,
      pricing_yearly: module.pricing_yearly,
      available_plans: module.available_plans
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingModule) {
      await updateModule(editingModule.id, formData);
    } else {
      await createModule(formData);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const togglePlan = (plan: string) => {
    setFormData(prev => ({
      ...prev,
      available_plans: prev.available_plans.includes(plan)
        ? prev.available_plans.filter(p => p !== plan)
        : [...prev.available_plans, plan]
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-40 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Gestion des Modules Optionnels
          </h2>
          <p className="text-muted-foreground mt-1">
            Configurez les modules disponibles pour chaque plan d'abonnement
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Module
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingModule ? 'Modifier le module' : 'Créer un nouveau module'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="module_id">ID du module</Label>
                  <Input
                    id="module_id"
                    value={formData.module_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, module_id: e.target.value }))}
                    placeholder="ex: pos, ecommerce, ai-diagnostic"
                  />
                </div>
                <div>
                  <Label htmlFor="module_name">Nom du module</Label>
                  <Input
                    id="module_name"
                    value={formData.module_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, module_name: e.target.value }))}
                    placeholder="ex: Point de Vente"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description détaillée du module"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="icon">Icône</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="ShoppingCart"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="color">Couleur</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricing_monthly">Prix mensuel (€)</Label>
                  <Input
                    id="pricing_monthly"
                    type="number"
                    value={formData.pricing_monthly}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricing_monthly: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="pricing_yearly">Prix annuel (€)</Label>
                  <Input
                    id="pricing_yearly"
                    type="number"
                    value={formData.pricing_yearly}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricing_yearly: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-4 block">Plans disponibles</Label>
                <div className="grid grid-cols-5 gap-2">
                  {availablePlans.map(plan => (
                    <div key={plan} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={plan}
                        checked={formData.available_plans.includes(plan)}
                        onChange={() => togglePlan(plan)}
                      />
                      <Label htmlFor={plan} className="text-sm capitalize">
                        {plan}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Fonctionnalités</Label>
                  <Button size="sm" variant="outline" onClick={addFeature}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Fonctionnalité"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Module actif</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: module.color }}
                  />
                  {module.module_name}
                  <Badge variant={module.is_active ? "default" : "secondary"}>
                    {module.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(module)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteModule(module.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {module.description}
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-1">Prix</h4>
                  <p className="text-sm">
                    {module.pricing_monthly}€/mois • {module.pricing_yearly}€/an
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Plans ({module.available_plans.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {module.available_plans.map(plan => (
                      <Badge key={plan} variant="outline" className="text-xs">
                        {plan}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Fonctionnalités ({module.features.length})</h4>
                  <div className="space-y-1">
                    {module.features.slice(0, 3).map((feature, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        • {feature}
                      </p>
                    ))}
                    {module.features.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        ... et {module.features.length - 3} autres
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Statut</span>
                  <Switch
                    checked={module.is_active}
                    onCheckedChange={(checked) => toggleModule(module.id, checked)}
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun module configuré</h3>
          <p className="text-muted-foreground mb-4">
            Commencez par créer votre premier module optionnel
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un module
          </Button>
        </div>
      )}
    </div>
  );
}
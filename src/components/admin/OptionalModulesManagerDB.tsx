import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Plus, Package } from "lucide-react";
import { useOptionalModulesDB, OptionalModuleDB } from "@/hooks/useOptionalModulesDB";
import { useToast } from "@/hooks/use-toast";

const AVAILABLE_ICONS = [
  'Smartphone', 'ShoppingCart', 'Euro', 'Brain', 'TrendingUp', 'Megaphone',
  'Package', 'Settings', 'Zap', 'Shield', 'BarChart', 'Calendar'
];

const AVAILABLE_COLORS = [
  'blue', 'green', 'purple', 'orange', 'red', 'yellow', 'pink', 'gray'
];

const AVAILABLE_PLANS = ['basic', 'premium', 'enterprise'];

export default function OptionalModulesManagerDB() {
  const { modules, loading, saving, toggleModule, updateModule, createModule, deleteModule } = useOptionalModulesDB();
  const [editingModule, setEditingModule] = useState<OptionalModuleDB | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    module_id: '',
    module_name: '',
    description: '',
    icon: 'Package',
    category: '',
    features: [] as string[],
    color: 'blue',
    pricing_monthly: 0,
    pricing_yearly: 0,
    available_plans: ['premium', 'enterprise'] as string[],
    is_active: true
  });

  const handleEdit = (module: OptionalModuleDB) => {
    setEditingModule(module);
    setFormData({
      module_id: module.module_id,
      module_name: module.module_name,
      description: module.description,
      icon: module.icon,
      category: module.category,
      features: module.features,
      color: module.color,
      pricing_monthly: module.pricing_monthly,
      pricing_yearly: module.pricing_yearly,
      available_plans: module.available_plans,
      is_active: module.is_active
    });
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingModule(null);
    setFormData({
      module_id: '',
      module_name: '',
      description: '',
      icon: 'Package',
      category: '',
      features: [],
      color: 'blue',
      pricing_monthly: 0,
      pricing_yearly: 0,
      available_plans: ['premium', 'enterprise'],
      is_active: true
    });
    setIsCreateMode(true);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (isCreateMode) {
        await createModule(formData);
      } else if (editingModule) {
        await updateModule(editingModule.id, formData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (moduleId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      await deleteModule(moduleId);
    }
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
      features: prev.features.map((f, i) => i === index ? value : f)
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
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Chargement des modules...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-electric-blue">Gestion des Modules Optionnels</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Configurez les modules optionnels disponibles pour chaque plan d'abonnement.
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-electric-blue hover:bg-electric-blue/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Module
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {modules.map((module) => (
            <div key={module.id} className="border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg bg-${module.color}-100 text-${module.color}-600`}>
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium">{module.module_name}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{module.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        ID: {module.module_id}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-right">
                    <div className="font-medium">
                      {module.pricing_monthly > 0 ? `${module.pricing_monthly}€/mois` : 'Gratuit'}
                    </div>
                    <div className="text-muted-foreground">
                      {module.pricing_yearly > 0 ? `${module.pricing_yearly}€/an` : ''}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {module.available_plans.map(plan => (
                      <Badge key={plan} variant="secondary" className="text-xs">
                        {plan}
                      </Badge>
                    ))}
                  </div>
                  <Switch
                    checked={module.is_active}
                    onCheckedChange={(checked) => toggleModule(module.id, checked)}
                    disabled={saving}
                  />
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(module)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(module.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {module.features.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-sm text-muted-foreground mb-1">Fonctionnalités :</div>
                  <div className="flex flex-wrap gap-1">
                    {module.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {modules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun module configuré. Cliquez sur "Nouveau Module" pour commencer.
            </div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreateMode ? 'Créer un nouveau module' : 'Modifier le module'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="module_id">ID du module</Label>
                  <Input
                    id="module_id"
                    value={formData.module_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, module_id: e.target.value }))}
                    disabled={!isCreateMode}
                  />
                </div>
                <div>
                  <Label htmlFor="module_name">Nom du module</Label>
                  <Input
                    id="module_name"
                    value={formData.module_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, module_name: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="icon">Icône</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ICONS.map(icon => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="color">Couleur</Label>
                  <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_COLORS.map(color => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricing_monthly">Prix mensuel (€)</Label>
                  <Input
                    id="pricing_monthly"
                    type="number"
                    step="0.01"
                    value={formData.pricing_monthly}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricing_monthly: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="pricing_yearly">Prix annuel (€)</Label>
                  <Input
                    id="pricing_yearly"
                    type="number"
                    step="0.01"
                    value={formData.pricing_yearly}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricing_yearly: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <Label>Plans disponibles</Label>
                <div className="flex space-x-2 mt-2">
                  {AVAILABLE_PLANS.map(plan => (
                    <label key={plan} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.available_plans.includes(plan)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, available_plans: [...prev.available_plans, plan] }));
                          } else {
                            setFormData(prev => ({ ...prev, available_plans: prev.available_plans.filter(p => p !== plan) }));
                          }
                        }}
                      />
                      <span className="capitalize">{plan}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Fonctionnalités</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Nom de la fonctionnalité"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => removeFeature(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Module actif</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={saving} className="bg-electric-blue hover:bg-electric-blue/90">
                  {saving ? 'Sauvegarde...' : (isCreateMode ? 'Créer' : 'Modifier')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
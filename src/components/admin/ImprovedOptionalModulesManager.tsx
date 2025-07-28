import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOptionalModules } from '@/hooks/useOptionalModules';
import { 
  Euro, Brain, TrendingUp, Megaphone, Smartphone, ShoppingCart, 
  Eye, Settings, Package, DollarSign, Users, Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ImprovedOptionalModulesManager: React.FC = () => {
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [editPricing, setEditPricing] = useState<{monthly: number, yearly: number} | null>(null);
  
  const {
    modules,
    loading,
    saving,
    toggleModule,
    updateModulePricing,
    saveConfigurations
  } = useOptionalModules();

  const getIcon = (iconName: string) => {
    const iconProps = { className: "h-5 w-5" };
    switch (iconName) {
      case 'Smartphone': return <Smartphone {...iconProps} />;
      case 'ShoppingCart': return <ShoppingCart {...iconProps} />;
      case 'Euro': return <Euro {...iconProps} />;
      case 'Brain': return <Brain {...iconProps} />;
      case 'TrendingUp': return <TrendingUp {...iconProps} />;
      case 'Megaphone': return <Megaphone {...iconProps} />;
      default: return <Package {...iconProps} />;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-50';
  };

  const getPriceDisplay = (module: any) => {
    if (module.pricing.monthly === 0) {
      return (
        <div className="text-right">
          <div className="text-green-600 font-semibold">Inclus</div>
          <div className="text-xs text-gray-500">Dans le plan</div>
        </div>
      );
    }
    return (
      <div className="text-right">
        <div className="font-semibold text-lg">{module.pricing.monthly}€</div>
        <div className="text-xs text-gray-500">par mois</div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Package className="h-5 w-5 animate-pulse" />
            <span>Chargement des modules optionnels...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeModules = modules.filter(m => m.isActive);
  const inactiveModules = modules.filter(m => !m.isActive);
  const totalRevenue = activeModules.reduce((sum, m) => sum + m.pricing.monthly, 0);

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Package className="h-6 w-6 text-blue-600" />
                Gestion des Modules Optionnels
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Configurez et gérez les modules additionnels pour vos plans d'abonnement
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{totalRevenue}€</div>
              <div className="text-xs text-gray-500">Revenus mensuels potentiels</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <div className="text-xl font-bold">{modules.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Actifs</span>
              </div>
              <div className="text-xl font-bold text-green-600">{activeModules.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Prix moyen</span>
              </div>
              <div className="text-xl font-bold">
                {activeModules.length > 0 ? Math.round(totalRevenue / activeModules.length) : 0}€
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Utilisateurs</span>
              </div>
              <div className="text-xl font-bold">---</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interface principale */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Modules Actifs ({activeModules.length})
              </TabsTrigger>
              <TabsTrigger value="inactive" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Modules Inactifs ({inactiveModules.length})
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Aperçu Tarification
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeModules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun module actif</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeModules.map((module) => (
                    <ModuleCard 
                      key={module.id} 
                      module={module} 
                      onView={() => {
                        setSelectedModule(module);
                        setIsDetailDialogOpen(true);
                      }}
                      onConfigure={() => {
                        setSelectedModule(module);
                        setEditPricing({
                          monthly: module.pricing.monthly,
                          yearly: module.pricing.yearly
                        });
                        setIsConfigDialogOpen(true);
                      }}
                      onToggle={(checked) => toggleModule(module.id, checked)}
                      getIcon={getIcon}
                      getPriceDisplay={getPriceDisplay}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="inactive" className="space-y-4">
              {inactiveModules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tous les modules sont actifs</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {inactiveModules.map((module) => (
                    <ModuleCard 
                      key={module.id} 
                      module={module} 
                      onView={() => {
                        setSelectedModule(module);
                        setIsDetailDialogOpen(true);
                      }}
                      onConfigure={() => {
                        setSelectedModule(module);
                        setEditPricing({
                          monthly: module.pricing.monthly,
                          yearly: module.pricing.yearly
                        });
                        setIsConfigDialogOpen(true);
                      }}
                      onToggle={(checked) => toggleModule(module.id, checked)}
                      getIcon={getIcon}
                      getPriceDisplay={getPriceDisplay}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <PricingOverview modules={activeModules} getIcon={getIcon} />
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t flex gap-3">
            <Button
              onClick={saveConfigurations}
              disabled={saving}
              size="lg"
              className="flex-1 sm:flex-none"
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ModuleDetailDialog 
        module={selectedModule}
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        getIcon={getIcon}
      />

      <ModuleConfigDialog 
        module={selectedModule}
        isOpen={isConfigDialogOpen}
        onClose={() => {
          setIsConfigDialogOpen(false);
          setEditPricing(null);
        }}
        editPricing={editPricing}
        setEditPricing={setEditPricing}
        onSave={(pricing) => {
          if (selectedModule && pricing) {
            updateModulePricing(selectedModule.id, pricing);
            toast({
              title: "Tarifs mis à jour",
              description: `Les tarifs du module ${selectedModule.name} ont été mis à jour.`,
            });
            setIsConfigDialogOpen(false);
            setEditPricing(null);
          }
        }}
        getIcon={getIcon}
      />
    </div>
  );
};

// Composant ModuleCard séparé pour plus de clarté
const ModuleCard: React.FC<any> = ({ 
  module, onView, onConfigure, onToggle, getIcon, getPriceDisplay 
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${
          module.isActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
        }`}>
          {getIcon(module.icon)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{module.name}</h3>
            <Badge variant={module.isActive ? "default" : "secondary"}>
              {module.isActive ? "Actif" : "Inactif"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
          <div className="flex flex-wrap gap-1">
            {module.availableForPlans.map((plan: string) => (
              <Badge key={plan} variant="outline" className="text-xs">
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {getPriceDisplay(module)}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onView}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onConfigure}>
              <Settings className="w-4 h-4" />
            </Button>
            <Switch checked={module.isActive} onCheckedChange={onToggle} />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Composant PricingOverview
const PricingOverview: React.FC<any> = ({ modules, getIcon }) => (
  <Card>
    <CardHeader>
      <CardTitle>Récapitulatif des revenus par module</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {modules.map((module: any) => (
          <div key={module.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                {getIcon(module.icon)}
              </div>
              <div>
                <h4 className="font-medium">{module.name}</h4>
                <p className="text-sm text-gray-600">
                  Plans: {module.availableForPlans.join(', ')}
                </p>
              </div>
            </div>
            <div className="text-right">
              {module.pricing.monthly === 0 ? (
                <div className="text-green-600 font-medium">Inclus</div>
              ) : (
                <div>
                  <div className="font-medium">{module.pricing.monthly}€/mois</div>
                  <div className="text-sm text-gray-500">{module.pricing.yearly}€/an</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Dialog components
const ModuleDetailDialog: React.FC<any> = ({ module, isOpen, onClose, getIcon }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {module && getIcon(module.icon)}
          Détails du module : {module?.name}
        </DialogTitle>
      </DialogHeader>
      {module && (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-muted-foreground">{module.description}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Fonctionnalités principales</h4>
            <ul className="space-y-1">
              {module.features.map((feature: string, index: number) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start">
                  <span className="mr-2">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Catégorie</h4>
              <Badge variant="outline">{module.category}</Badge>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Plans compatibles</h4>
              <div className="flex flex-wrap gap-1">
                {module.availableForPlans.map((plan: string) => (
                  <Badge key={plan} variant="secondary" className="text-xs">
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

const ModuleConfigDialog: React.FC<any> = ({ 
  module, isOpen, onClose, editPricing, setEditPricing, onSave, getIcon 
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {module && getIcon(module.icon)}
          Configurer : {module?.name}
        </DialogTitle>
      </DialogHeader>
      {module && editPricing && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthly-price">Prix mensuel (€)</Label>
              <Input
                id="monthly-price"
                type="number"
                value={editPricing.monthly}
                onChange={(e) => setEditPricing((prev: any) => ({
                  ...prev,
                  monthly: parseFloat(e.target.value) || 0
                }))}
                step="0.10"
              />
            </div>
            <div>
              <Label htmlFor="yearly-price">Prix annuel (€)</Label>
              <Input
                id="yearly-price"
                type="number"
                value={editPricing.yearly}
                onChange={(e) => setEditPricing((prev: any) => ({
                  ...prev,
                  yearly: parseFloat(e.target.value) || 0
                }))}
                step="1.00"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={() => onSave(editPricing)}>
              Sauvegarder
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

export default ImprovedOptionalModulesManager;
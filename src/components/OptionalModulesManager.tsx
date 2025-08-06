import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOptionalModules } from '@/hooks/useOptionalModules';
import { Euro, Brain, TrendingUp, Megaphone, Smartphone, ShoppingCart, Eye, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OptionalModulesManager: React.FC = () => {
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
      default: return <Smartphone {...iconProps} />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'border-blue-200 bg-blue-50';
      case 'green': return 'border-green-200 bg-green-50';
      case 'purple': return 'border-purple-200 bg-purple-50';
      case 'orange': return 'border-orange-200 bg-orange-50';
      case 'red': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Chargement des modules optionnels...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Modules Optionnels</CardTitle>
        <div className="text-muted-foreground text-sm">
          Configurez la disponibilité et les tarifs des modules optionnels pour chaque plan.
          <div className="mt-2 text-xs font-medium text-blue-600">
            📦 {modules.length} modules • {modules.filter(m => m.isActive).length} actifs
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="modules" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="modules">Configuration Modules</TabsTrigger>
            <TabsTrigger value="pricing">Tarifs & Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-4">
            <div className="grid gap-4">
              {modules.map((module) => (
                <Card key={module.id} className={`border-l-4 ${getColorClasses(module.color)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          module.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          module.color === 'green' ? 'bg-green-100 text-green-600' :
                          module.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                          module.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                          module.color === 'red' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getIcon(module.icon)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{module.name}</h3>
                            <Badge variant={module.isActive ? "default" : "secondary"}>
                              {module.isActive ? "Actif" : "Inactif"}
                            </Badge>
                            {module.pricing.monthly === 0 ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Inclus
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                {module.pricing.monthly}€/mois
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {module.availableForPlans.map(plan => (
                              <Badge key={plan} variant="outline" className="text-xs">
                                {plan.charAt(0).toUpperCase() + plan.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedModule(module);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir détails
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedModule(module);
                            setEditPricing({
                              monthly: module.pricing.monthly,
                              yearly: module.pricing.yearly
                            });
                            setIsConfigDialogOpen(true);
                          }}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Configurer
                        </Button>
                        <Switch
                          checked={module.isActive}
                          onCheckedChange={(checked) => toggleModule(module.id, checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Récapitulatif des Tarifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modules.filter(m => m.isActive).map(module => (
                      <div key={module.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            module.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                            module.color === 'green' ? 'bg-green-100 text-green-600' :
                            module.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                            module.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                            module.color === 'red' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {getIcon(module.icon)}
                          </div>
                          <div>
                            <h4 className="font-medium">{module.name}</h4>
                            <div className="text-sm text-gray-600">
                              Plans: {module.availableForPlans.join(', ')}
                            </div>
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
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 pt-6 border-t">
          <Button
            onClick={saveConfigurations}
            disabled={saving}
            size="lg"
            className="w-full sm:w-auto"
          >
            {saving ? "Enregistrement en cours..." : "Enregistrer les modifications"}
          </Button>
        </div>

        {/* Dialog pour voir les détails */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedModule && getIcon(selectedModule.icon)}
                Détails du module : {selectedModule?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedModule && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedModule.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Fonctionnalités principales</h4>
                  <ul className="space-y-1">
                    {selectedModule.features.map((feature: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground">• {feature}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Catégorie</h4>
                  <Badge variant="outline">{selectedModule.category}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tarification</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-lg font-semibold">{selectedModule.pricing.monthly}€</p>
                      <p className="text-sm text-muted-foreground">par mois</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-lg font-semibold">{selectedModule.pricing.yearly}€</p>
                      <p className="text-sm text-muted-foreground">par an</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Plans compatibles</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedModule.availableForPlans.map((plan: string) => (
                      <Badge key={plan} variant="secondary">
                        {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog pour configurer le module */}
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedModule && getIcon(selectedModule.icon)}
                Configurer : {selectedModule?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedModule && editPricing && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthly-price">Prix mensuel (€)</Label>
                    <Input
                      id="monthly-price"
                      type="number"
                      value={editPricing.monthly}
                      onChange={(e) => setEditPricing(prev => ({
                        ...prev!,
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
                      onChange={(e) => setEditPricing(prev => ({
                        ...prev!,
                        yearly: parseFloat(e.target.value) || 0
                      }))}
                      step="1.00"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsConfigDialogOpen(false);
                      setEditPricing(null);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => {
                      if (editPricing) {
                        updateModulePricing(selectedModule.id, editPricing);
                        toast({
                          title: "Tarifs mis à jour",
                          description: `Les tarifs du module ${selectedModule.name} ont été mis à jour.`,
                        });
                        setIsConfigDialogOpen(false);
                        setEditPricing(null);
                      }
                    }}
                  >
                    Sauvegarder
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default OptionalModulesManager;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOptionalModules } from '@/hooks/useOptionalModules';
import { Euro, Brain, TrendingUp, Megaphone, Smartphone, ShoppingCart } from 'lucide-react';

const OptionalModulesManager: React.FC = () => {
  const {
    modules,
    loading,
    saving,
    toggleModule,
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
      </CardContent>
    </Card>
  );
};

export default OptionalModulesManager;
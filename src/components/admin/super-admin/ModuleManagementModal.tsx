import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Store, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock,
  Euro,
  Users,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ModuleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  repairerId: string;
  repairerName: string;
}

interface ModuleStatus {
  pos: {
    active: boolean;
    plan: 'basic' | 'pro' | 'enterprise';
    monthlyRevenue: number;
    totalTransactions: number;
    lastActivity: string;
  };
  ecommerce: {
    active: boolean;
    plan: 'basic' | 'pro' | 'enterprise';
    monthlyRevenue: number;
    monthlyOrders: number;
    storeName: string;
    domain: string;
  };
}

const ModuleManagementModal: React.FC<ModuleManagementModalProps> = ({
  isOpen,
  onClose,
  repairerId,
  repairerName
}) => {
  const [modules, setModules] = useState<ModuleStatus>({
    pos: {
      active: false,
      plan: 'basic',
      monthlyRevenue: 0,
      totalTransactions: 0,
      lastActivity: new Date().toISOString()
    },
    ecommerce: {
      active: false,
      plan: 'basic',
      monthlyRevenue: 0,
      monthlyOrders: 0,
      storeName: '',
      domain: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && repairerId) {
      fetchModuleStatus();
    }
  }, [isOpen, repairerId]);

  const fetchModuleStatus = async () => {
    try {
      setIsLoading(true);

      // Récupérer les données POS
      const { data: posData } = await supabase
        .from('pos_systems')
        .select('*')
        .eq('repairer_id', repairerId)
        .single();

      // Récupérer les données E-commerce
      const { data: ecommerceData } = await supabase
        .from('ecommerce_stores')
        .select('*')
        .eq('repairer_id', repairerId)
        .single();

      setModules({
        pos: {
          active: posData?.status === 'active' || false,
          plan: (posData?.plan_type as 'basic' | 'pro' | 'enterprise') || 'basic',
          monthlyRevenue: Number(posData?.monthly_revenue) || 0,
          totalTransactions: posData?.total_transactions || 0,
          lastActivity: posData?.last_activity || new Date().toISOString()
        },
        ecommerce: {
          active: ecommerceData?.status === 'active' || false,
          plan: (ecommerceData?.plan_type as 'basic' | 'pro' | 'enterprise') || 'basic',
          monthlyRevenue: Number(ecommerceData?.monthly_revenue) || 0,
          monthlyOrders: ecommerceData?.monthly_orders || 0,
          storeName: ecommerceData?.store_name || '',
          domain: ecommerceData?.domain || ''
        }
      });

    } catch (error) {
      console.error('Erreur lors du chargement des modules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = async (moduleType: 'pos' | 'ecommerce', active: boolean) => {
    try {
      setIsLoading(true);

      if (moduleType === 'pos') {
        if (active) {
          // Activer le module POS
          await supabase
            .from('pos_systems')
            .upsert({
              repairer_id: repairerId,
              system_name: `${repairerName} POS`,
              status: 'active',
              plan_type: modules.pos.plan
            });
        } else {
          // Désactiver le module POS
          await supabase
            .from('pos_systems')
            .update({ status: 'inactive' })
            .eq('repairer_id', repairerId);
        }
      } else {
        if (active) {
          // Activer le module E-commerce
          await supabase
            .from('ecommerce_stores')
            .upsert({
              repairer_id: repairerId,
              store_name: `${repairerName} Store`,
              status: 'active',
              plan_type: modules.ecommerce.plan,
              domain: `${repairerName.toLowerCase().replace(/\s+/g, '')}.repairhub.fr`
            });
        } else {
          // Désactiver le module E-commerce
          await supabase
            .from('ecommerce_stores')
            .update({ status: 'inactive' })
            .eq('repairer_id', repairerId);
        }
      }

      await fetchModuleStatus();
      
      toast({
        title: "Module mis à jour",
        description: `Le module ${moduleType === 'pos' ? 'POS' : 'E-commerce'} a été ${active ? 'activé' : 'désactivé'}`,
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du module:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le module",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlan = async (moduleType: 'pos' | 'ecommerce', plan: 'basic' | 'pro' | 'enterprise') => {
    try {
      setIsLoading(true);

      if (moduleType === 'pos') {
        await supabase
          .from('pos_systems')
          .update({ plan_type: plan })
          .eq('repairer_id', repairerId);
      } else {
        await supabase
          .from('ecommerce_stores')
          .update({ plan_type: plan })
          .eq('repairer_id', repairerId);
      }

      await fetchModuleStatus();
      
      toast({
        title: "Plan mis à jour",
        description: `Le plan ${moduleType === 'pos' ? 'POS' : 'E-commerce'} a été changé vers ${plan}`,
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du plan:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le plan",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestion des modules - {repairerName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="pos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pos" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Système POS
            </TabsTrigger>
            <TabsTrigger value="ecommerce" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              E-commerce
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pos" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Module POS
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={modules.pos.active ? 'default' : 'secondary'}>
                      {modules.pos.active ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Switch
                      checked={modules.pos.active}
                      onCheckedChange={(checked) => toggleModule('pos', checked)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {modules.pos.active && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Euro className="h-5 w-5 text-admin-green" />
                        <div>
                          <p className="text-sm text-muted-foreground">CA Mensuel</p>
                          <p className="font-medium">{modules.pos.monthlyRevenue.toLocaleString()}€</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Activity className="h-5 w-5 text-admin-blue" />
                        <div>
                          <p className="text-sm text-muted-foreground">Transactions</p>
                          <p className="font-medium">{modules.pos.totalTransactions.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Clock className="h-5 w-5 text-admin-purple" />
                        <div>
                          <p className="text-sm text-muted-foreground">Dernière activité</p>
                          <p className="font-medium text-sm">
                            {new Date(modules.pos.lastActivity).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Plan POS</h4>
                      <div className="flex gap-2">
                        {['basic', 'pro', 'enterprise'].map((plan) => (
                          <Button
                            key={plan}
                            variant={modules.pos.plan === plan ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updatePlan('pos', plan as 'basic' | 'pro' | 'enterprise')}
                            disabled={isLoading}
                          >
                            {plan.charAt(0).toUpperCase() + plan.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ecommerce" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Module E-commerce
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={modules.ecommerce.active ? 'default' : 'secondary'}>
                      {modules.ecommerce.active ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Switch
                      checked={modules.ecommerce.active}
                      onCheckedChange={(checked) => toggleModule('ecommerce', checked)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {modules.ecommerce.active && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Euro className="h-5 w-5 text-admin-green" />
                        <div>
                          <p className="text-sm text-muted-foreground">CA Mensuel</p>
                          <p className="font-medium">{modules.ecommerce.monthlyRevenue.toLocaleString()}€</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Users className="h-5 w-5 text-admin-blue" />
                        <div>
                          <p className="text-sm text-muted-foreground">Commandes/mois</p>
                          <p className="font-medium">{modules.ecommerce.monthlyOrders.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <CheckCircle className="h-5 w-5 text-admin-purple" />
                        <div>
                          <p className="text-sm text-muted-foreground">Boutique</p>
                          <p className="font-medium text-sm">{modules.ecommerce.storeName}</p>
                        </div>
                      </div>
                    </div>

                    {modules.ecommerce.domain && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Domaine de la boutique</p>
                        <p className="font-medium">{modules.ecommerce.domain}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-medium">Plan E-commerce</h4>
                      <div className="flex gap-2">
                        {['basic', 'pro', 'enterprise'].map((plan) => (
                          <Button
                            key={plan}
                            variant={modules.ecommerce.plan === plan ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updatePlan('ecommerce', plan as 'basic' | 'pro' | 'enterprise')}
                            disabled={isLoading}
                          >
                            {plan.charAt(0).toUpperCase() + plan.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleManagementModal;
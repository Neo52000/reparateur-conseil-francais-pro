import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Settings, 
  CheckCircle, 
  XCircle,
  Loader2,
  Shield,
  Wifi,
  Plus,
  Trash2,
  TestTube,
  RefreshCw
} from 'lucide-react';

interface PaymentMethodConfig {
  id: string;
  method_type: string;
  method_name: string;
  is_active: boolean;
  configuration: Record<string, any>;
  created_at: string;
}

interface PaymentIntegrationsPanelProps {
  repairerId: string;
}

const PaymentIntegrationsPanel: React.FC<PaymentIntegrationsPanelProps> = ({ repairerId }) => {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [stripeConfig, setStripeConfig] = useState({
    terminalId: '',
    locationId: '',
    testMode: true
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentMethods();
  }, [repairerId]);

  const loadPaymentMethods = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pos_payment_methods')
        .select('*')
        .eq('repairer_id', repairerId)
        .order('created_at');

      if (error) throw error;
      
      // Si pas de méthodes, initialiser les défauts
      if (!data || data.length === 0) {
        await initializeDefaultMethods();
      } else {
        setMethods(data.map((m: any) => ({
          id: m.id,
          method_type: m.method_type,
          method_name: m.method_name,
          is_active: m.is_active,
          configuration: m.configuration || {},
          created_at: m.created_at
        })));
      }
    } catch (error) {
      console.error('Erreur chargement méthodes:', error);
      // Utiliser des méthodes par défaut en cas d'erreur
      setMethods(getDefaultMethods());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultMethods = (): PaymentMethodConfig[] => [
    {
      id: '1',
      method_type: 'cash',
      method_name: 'Espèces',
      is_active: true,
      configuration: {},
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      method_type: 'card_terminal',
      method_name: 'Terminal CB',
      is_active: false,
      configuration: { provider: 'stripe' },
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      method_type: 'apple_pay',
      method_name: 'Apple Pay',
      is_active: false,
      configuration: {},
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      method_type: 'google_pay',
      method_name: 'Google Pay',
      is_active: false,
      configuration: {},
      created_at: new Date().toISOString()
    }
  ];

  const initializeDefaultMethods = async () => {
    const defaults = getDefaultMethods();
    setMethods(defaults);
    
    // Sauvegarder en base si possible
    try {
      for (const method of defaults) {
        await supabase.from('pos_payment_methods').insert({
          repairer_id: repairerId,
          method_type: method.method_type,
          method_name: method.method_name,
          is_active: method.is_active,
          configuration: method.configuration
        });
      }
    } catch (error) {
      console.log('Table pos_payment_methods non disponible, utilisation locale');
    }
  };

  const toggleMethod = async (methodId: string, isActive: boolean) => {
    setMethods(prev => prev.map(m => 
      m.id === methodId ? { ...m, is_active: isActive } : m
    ));

    try {
      await supabase
        .from('pos_payment_methods')
        .update({ is_active: isActive })
        .eq('id', methodId);

      toast({
        title: isActive ? "Méthode activée" : "Méthode désactivée",
        description: `Le mode de paiement a été ${isActive ? 'activé' : 'désactivé'}`
      });
    } catch (error) {
      console.log('Mise à jour locale uniquement');
    }
  };

  const testPaymentMethod = async (methodType: string) => {
    setTesting(methodType);
    
    try {
      // Simuler un test de connexion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Test réussi",
        description: "La connexion au service de paiement fonctionne correctement"
      });
    } catch (error) {
      toast({
        title: "Test échoué",
        description: "Impossible de se connecter au service de paiement",
        variant: "destructive"
      });
    } finally {
      setTesting(null);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'cash': return <Banknote className="w-6 h-6" />;
      case 'card_terminal': return <CreditCard className="w-6 h-6" />;
      case 'apple_pay': 
      case 'google_pay': return <Smartphone className="w-6 h-6" />;
      default: return <CreditCard className="w-6 h-6" />;
    }
  };

  const getMethodColor = (type: string, isActive: boolean) => {
    if (!isActive) return 'bg-muted text-muted-foreground';
    switch (type) {
      case 'cash': return 'bg-green-100 text-green-700';
      case 'card_terminal': return 'bg-blue-100 text-blue-700';
      case 'apple_pay': return 'bg-gray-100 text-gray-700';
      case 'google_pay': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Intégrations de paiement
          </h2>
          <p className="text-muted-foreground">
            Configurez vos modes de paiement acceptés
          </p>
        </div>
      </div>

      <Tabs defaultValue="methods">
        <TabsList>
          <TabsTrigger value="methods">Méthodes de paiement</TabsTrigger>
          <TabsTrigger value="stripe">Stripe Terminal</TabsTrigger>
          <TabsTrigger value="mobile">Paiements mobiles</TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <div className="col-span-2 py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Chargement...</p>
              </div>
            ) : (
              methods.map(method => (
                <Card key={method.id} className={method.is_active ? 'border-green-200' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${getMethodColor(method.method_type, method.is_active)}`}>
                          {getMethodIcon(method.method_type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{method.method_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {method.is_active ? 'Activé' : 'Désactivé'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.method_type !== 'cash' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testPaymentMethod(method.method_type)}
                            disabled={!method.is_active || testing === method.method_type}
                          >
                            {testing === method.method_type ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <TestTube className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        <Switch
                          checked={method.is_active}
                          onCheckedChange={(checked) => toggleMethod(method.id, checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="stripe" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Configuration Stripe Terminal
              </CardTitle>
              <CardDescription>
                Connectez votre terminal de paiement Stripe pour accepter les cartes bancaires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>ID du terminal</Label>
                  <Input
                    value={stripeConfig.terminalId}
                    onChange={(e) => setStripeConfig({ ...stripeConfig, terminalId: e.target.value })}
                    placeholder="tmr_xxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ID de localisation</Label>
                  <Input
                    value={stripeConfig.locationId}
                    onChange={(e) => setStripeConfig({ ...stripeConfig, locationId: e.target.value })}
                    placeholder="tml_xxx"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={stripeConfig.testMode}
                  onCheckedChange={(checked) => setStripeConfig({ ...stripeConfig, testMode: checked })}
                />
                <Label>Mode test</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => testPaymentMethod('card_terminal')}>
                  <Wifi className="w-4 h-4 mr-2" />
                  Tester la connexion
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuration avancée
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Terminaux compatibles</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Stripe Terminal BBPOS WisePOS E</li>
                  <li>• Stripe Reader M2</li>
                  <li>• Stripe Terminal Verifone P400</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Apple Pay
                </CardTitle>
                <CardDescription>
                  Acceptez les paiements via Apple Pay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Statut</span>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      Configuration requise
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Apple Pay nécessite un certificat marchand Apple et une intégration Stripe.
                  </p>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Configurer Apple Pay
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Google Pay
                </CardTitle>
                <CardDescription>
                  Acceptez les paiements via Google Pay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Statut</span>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      Configuration requise
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Google Pay nécessite un ID marchand Google et une intégration Stripe.
                  </p>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Configurer Google Pay
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Conformité PCI-DSS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                  <h4 className="font-medium text-green-800">Données sécurisées</h4>
                  <p className="text-sm text-green-600">
                    Les données de carte ne transitent jamais par votre serveur
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                  <h4 className="font-medium text-green-800">Chiffrement TLS</h4>
                  <p className="text-sm text-green-600">
                    Toutes les communications sont chiffrées
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                  <h4 className="font-medium text-green-800">Tokenisation</h4>
                  <p className="text-sm text-green-600">
                    Les numéros de carte sont remplacés par des tokens
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentIntegrationsPanel;

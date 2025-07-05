import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Settings,
  Plus,
  ArrowLeft,
  Eye,
  ExternalLink,
  Palette,
  Globe,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import { ProductsManagement } from './ProductsManagement';
import { OrdersManagement } from './OrdersManagement';
import { CustomersManagement } from './CustomersManagement';

interface EcommerceInterfaceProps {
  onBackToDashboard?: () => void;
}

interface StoreStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  monthlyRevenue: number;
  conversionRate: number;
  storeStatus: string;
}

const AdvancedEcommerceInterface: React.FC<EcommerceInterfaceProps> = ({ 
  onBackToDashboard 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [storeStats, setStoreStats] = useState<StoreStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    storeStatus: 'active'
  });
  const [loading, setLoading] = useState(true);
  const { hasModuleAccess } = useModuleAccess();
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger les statistiques de la boutique
  const loadStoreStats = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Charger les stats depuis les différentes tables
      const [productsResult, ordersResult, customersResult] = await Promise.all([
        supabase
          .from('ecommerce_products')
          .select('id, status')
          .eq('repairer_id', user.id),
        supabase
          .from('ecommerce_orders')
          .select('id, total_amount, created_at')
          .eq('repairer_id', user.id),
        supabase
          .from('ecommerce_customers')
          .select('id')
          .eq('repairer_id', user.id)
      ]);

      const products = productsResult.data || [];
      const orders = ordersResult.data || [];
      const customers = customersResult.data || [];

      // Calculer le CA du mois
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });
      
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);

      setStoreStats({
        totalProducts: products.filter(p => p.status === 'published').length,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        monthlyRevenue,
        conversionRate: 2.4, // À calculer plus tard avec les analytics
        storeStatus: 'active'
      });

    } catch (error) {
      console.error('Erreur chargement stats boutique:', error);
      // En mode démo, utiliser des données simulées
      if (user?.email === 'demo@demo.fr') {
        setStoreStats({
          totalProducts: 15,
          totalOrders: 47,
          totalCustomers: 23,
          monthlyRevenue: 3240.50,
          conversionRate: 3.2,
          storeStatus: 'active'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreStats();
  }, [user?.id]);

  // Créer une boutique de démonstration
  const createDemoStore = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('ecommerce_stores')
        .insert({
          repairer_id: user.id,
          store_name: 'Ma Boutique Réparation',
          domain: `${user.email?.split('@')[0]}.repairhub.fr`,
          status: 'active',
          plan_type: 'basic',
          store_settings: {
            theme: 'modern',
            colors: {
              primary: '#3b82f6',
              secondary: '#64748b'
            },
            currency: 'EUR',
            shipping: {
              free_threshold: 50,
              standard_rate: 5.99
            }
          }
        });

      if (error) throw error;

      toast({
        title: "Boutique créée",
        description: "Votre boutique en ligne a été initialisée avec succès"
      });
      
      await loadStoreStats();
    } catch (error) {
      console.error('Erreur création boutique:', error);
    }
  };

  // Vérifier l'accès au module e-commerce
  if (!hasModuleAccess('ecommerce')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Accès E-commerce Requis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Vous devez activer le module E-commerce pour accéder à cette interface.
            </p>
            {onBackToDashboard && (
              <Button onClick={onBackToDashboard} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header moderne */}
      <div className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBackToDashboard && (
                <Button 
                  variant="ghost" 
                  onClick={onBackToDashboard}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Store className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">E-commerce</h1>
                  <p className="text-sm text-slate-500">
                    Gestion complète de votre boutique en ligne
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                <Store className="w-3 h-3 mr-1" />
                Module E-commerce Actif
              </Badge>
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Voir la boutique
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit bg-white">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Tableau de bord</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Produits</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Commandes</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="customization" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Personnalisation</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Produits actifs</p>
                      <p className="text-2xl font-bold text-slate-900">{storeStats.totalProducts}</p>
                      <p className="text-xs text-emerald-600">+2 ce mois</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-full">
                      <ShoppingCart className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Commandes totales</p>
                      <p className="text-2xl font-bold text-slate-900">{storeStats.totalOrders}</p>
                      <p className="text-xs text-emerald-600">+8 ce mois</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Clients</p>
                      <p className="text-2xl font-bold text-slate-900">{storeStats.totalCustomers}</p>
                      <p className="text-xs text-emerald-600">+5 ce mois</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <DollarSign className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">CA mensuel</p>
                      <p className="text-2xl font-bold text-slate-900">{storeStats.monthlyRevenue.toFixed(0)}€</p>
                      <p className="text-xs text-emerald-600">+12% ce mois</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" onClick={() => setActiveTab('products')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un produit
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('orders')}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Voir les commandes
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('customization')}>
                    <Palette className="w-4 h-4 mr-2" />
                    Personnaliser ma boutique
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Performance de la boutique</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Taux de conversion</span>
                      <span className="font-semibold text-slate-900">{storeStats.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Panier moyen</span>
                      <span className="font-semibold text-slate-900">68.90€</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Visiteurs mensuels</span>
                      <span className="font-semibold text-slate-900">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Statut boutique</span>
                      <Badge variant="default" className="bg-emerald-600">
                        {storeStats.storeStatus === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomersManagement />
          </TabsContent>

          <TabsContent value="customization" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Personnalisation de la boutique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Preview de la boutique */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Aperçu de votre boutique</h3>
                    <div className="border rounded-lg p-4 bg-slate-50 min-h-[400px]">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded"></div>
                          <h4 className="font-semibold">Ma Boutique Réparation</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="border rounded p-3 bg-white">
                              <div className="w-full h-20 bg-slate-200 rounded mb-2"></div>
                              <div className="text-sm font-medium">Produit {i}</div>
                              <div className="text-sm text-slate-600">Prix</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Options de personnalisation */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Thème et couleurs</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Couleur principale</label>
                          <div className="flex gap-2 mt-2">
                            {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'].map(color => (
                              <button
                                key={color}
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Style de boutique</label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <button className="p-3 border rounded text-sm hover:bg-slate-50">
                              Moderne
                            </button>
                            <button className="p-3 border rounded text-sm hover:bg-slate-50">
                              Classique
                            </button>
                            <button className="p-3 border rounded text-sm hover:bg-slate-50">
                              Minimaliste
                            </button>
                            <button className="p-3 border rounded text-sm hover:bg-slate-50">
                              Coloré
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-4">Configuration</h3>
                      <div className="space-y-3">
                        <Button className="w-full justify-start">
                          <Globe className="w-4 h-4 mr-2" />
                          Configurer le domaine
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Settings className="w-4 h-4 mr-2" />
                          Paramètres de livraison
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Outils marketing
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Paramètres de la boutique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Informations générales</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Nom de la boutique</label>
                        <input 
                          type="text" 
                          className="w-full mt-1 p-2 border rounded-md" 
                          defaultValue="Ma Boutique Réparation"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <textarea 
                          className="w-full mt-1 p-2 border rounded-md h-20" 
                          defaultValue="Votre spécialiste en réparation de smartphones"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Paramètres de vente</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Devise</label>
                        <select className="w-full mt-1 p-2 border rounded-md">
                          <option value="EUR">Euro (€)</option>
                          <option value="USD">Dollar ($)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Frais de livraison gratuite à partir de</label>
                        <input 
                          type="number" 
                          className="w-full mt-1 p-2 border rounded-md" 
                          defaultValue="50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 pt-6 border-t">
                  <Button>
                    Sauvegarder les modifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedEcommerceInterface;
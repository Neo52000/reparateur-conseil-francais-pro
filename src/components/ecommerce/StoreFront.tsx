import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Store, 
  Eye, 
  Globe, 
  Settings,
  ShoppingBag,
  Package,
  TrendingUp,
  Users,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

interface StoreStats {
  total_products: number;
  published_products: number;
  total_orders: number;
  total_revenue: number;
  total_customers: number;
}

export const StoreFront: React.FC = () => {
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeEnabled, setStoreEnabled] = useState(true);
  const [urlCopied, setUrlCopied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // URL de la boutique (exemple)
  const storeUrl = `https://boutique.repair-connect.fr/${user?.id}`;

  // Charger les statistiques de la boutique
  const loadStoreStats = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Statistiques des produits
      const { data: productsData } = await supabase
        .from('ecommerce_products')
        .select('status')
        .eq('repairer_id', user.id);

      // Statistiques des commandes
      const { data: ordersData } = await supabase
        .from('ecommerce_orders')
        .select('total_amount, payment_status')
        .eq('repairer_id', user.id);

      // Statistiques des clients
      const { data: customersData } = await supabase
        .from('ecommerce_customers')
        .select('id')
        .eq('repairer_id', user.id);

      const stats: StoreStats = {
        total_products: productsData?.length || 0,
        published_products: productsData?.filter(p => p.status === 'published').length || 0,
        total_orders: ordersData?.length || 0,
        total_revenue: ordersData?.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total_amount, 0) || 0,
        total_customers: customersData?.length || 0
      };

      setStoreStats(stats);
    } catch (error) {
      console.error('Erreur chargement statistiques boutique:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreStats();
  }, [user?.id]);

  // Copier l'URL de la boutique
  const copyStoreUrl = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setUrlCopied(true);
      toast({
        title: "URL copiée",
        description: "L'URL de votre boutique a été copiée dans le presse-papier"
      });
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier l'URL",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec contrôle de la boutique */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6" />
            Vitrine de votre boutique
          </h2>
          <p className="text-muted-foreground">
            Gérez l'apparence et la visibilité de votre boutique en ligne
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={storeEnabled}
              onCheckedChange={setStoreEnabled}
            />
            <span className="text-sm">
              Boutique {storeEnabled ? 'activée' : 'désactivée'}
            </span>
          </div>
          <Badge variant={storeEnabled ? "default" : "secondary"} className={storeEnabled ? "bg-emerald-600" : ""}>
            {storeEnabled ? 'En ligne' : 'Hors ligne'}
          </Badge>
        </div>
      </div>

      {/* URL de la boutique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            URL de votre boutique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm">{storeUrl}</code>
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyStoreUrl}
            >
              {urlCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir
            </Button>
          </div>
          {!storeEnabled && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                ⚠️ Votre boutique est actuellement désactivée. Les visiteurs verront un message indiquant qu'elle est temporairement fermée.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques de la boutique */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Produits</p>
                <p className="text-2xl font-bold">
                  {storeStats?.published_products || 0}
                  <span className="text-sm text-muted-foreground ml-1">
                    / {storeStats?.total_products || 0}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">publiés / total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">Commandes</p>
                <p className="text-2xl font-bold">{storeStats?.total_orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">€{(storeStats?.total_revenue || 0).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Clients</p>
                <p className="text-2xl font-bold">{storeStats?.total_customers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Gestion des produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Ajoutez et gérez les produits de votre boutique en ligne.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Ajouter un produit
              </Button>
              <Button variant="outline" size="sm">
                Voir tous les produits
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Personnalisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Personnalisez l'apparence et les paramètres de votre boutique.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Thème et couleurs
              </Button>
              <Button variant="outline" size="sm">
                Paramètres
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aperçu de la boutique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Aperçu de votre boutique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Votre Boutique de Réparation</h3>
              <p className="text-muted-foreground mb-4">
                Découvrez nos services de réparation et nos pièces détachées de qualité
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>📱 Smartphones</span>
                <span>💻 Ordinateurs</span>
                <span>🎧 Accessoires</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Button onClick={() => window.open(storeUrl, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir la boutique complète
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conseils pour optimiser la boutique */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Conseils pour optimiser votre boutique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Photos de qualité</h4>
              <p className="text-sm text-muted-foreground">
                Ajoutez des photos nettes et bien éclairées de vos produits pour attirer les clients.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Descriptions détaillées</h4>
              <p className="text-sm text-muted-foreground">
                Rédigez des descriptions complètes incluant compatibilité et garanties.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Prix compétitifs</h4>
              <p className="text-sm text-muted-foreground">
                Surveillez la concurrence et ajustez vos prix pour rester attractif.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Stock à jour</h4>
              <p className="text-sm text-muted-foreground">
                Maintenez votre inventaire à jour pour éviter les ruptures de stock.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
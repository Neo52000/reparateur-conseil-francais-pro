import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Store, 
  CheckCircle2, 
  Loader2, 
  ExternalLink,
  ShoppingBag,
  CreditCard,
  Rocket,
  Info
} from 'lucide-react';
import { useShopifyStore } from '@/hooks/useShopifyStore';
import { useModuleAccess } from '@/hooks/useModuleAccess';

const ShopifyStoreActivation: React.FC = () => {
  const { store, loading, creating, createStore, claimStore } = useShopifyStore();
  const { hasModuleAccess, loading: accessLoading } = useModuleAccess();
  const hasEcommerceAccess = hasModuleAccess('ecommerce');
  const [storeName, setStoreName] = useState('');
  const [storeEmail, setStoreEmail] = useState('');

  const handleCreateStore = async () => {
    await createStore(storeName, storeEmail);
  };

  const handleClaimStore = async () => {
    if (store) {
      await claimStore(store.id);
    }
  };

  if (loading || accessLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!hasEcommerceAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Module E-commerce Shopify
          </CardTitle>
          <CardDescription>
            Activez le module e-commerce pour créer votre boutique Shopify
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              Le module e-commerce Shopify nécessite un abonnement Enterprise (€89/mois ou €890/an).
              Contactez-nous pour activer ce module.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Store exists - show status
  if (store) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  {store.store_name || 'Ma Boutique Shopify'}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-sm">{store.shop_domain}</span>
                  <Badge variant={
                    store.store_status === 'active' || store.store_status === 'claimed' 
                      ? 'default' 
                      : 'secondary'
                  }>
                    {store.store_status === 'sandbox' && 'Mode Développement'}
                    {store.store_status === 'claimed' && 'Activée'}
                    {store.store_status === 'active' && 'Active'}
                  </Badge>
                </CardDescription>
              </div>
              {(store.store_status === 'active' || store.store_status === 'claimed') && (
                <Button asChild variant="outline">
                  <a 
                    href={`https://${store.shop_domain}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Voir ma boutique
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Store info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Commission plateforme</p>
                <p className="text-lg font-semibold">{store.commission_rate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold capitalize">
                  {store.is_development_store ? 'Développement' : 'Production'}
                </p>
              </div>
            </div>

            {/* Sandbox mode - show claim button */}
            {store.store_status === 'sandbox' && (
              <Alert>
                <Rocket className="w-4 h-4" />
                <AlertDescription className="space-y-4">
                  <p>
                    Votre boutique est en <strong>mode développement</strong>. 
                    Vous pouvez la personnaliser et tester toutes les fonctionnalités gratuitement.
                  </p>
                  <div className="space-y-2">
                    <p className="font-semibold">Pour commencer à vendre :</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Cliquez sur "Activer ma boutique"</li>
                      <li>Profitez de <strong>30 jours d'essai gratuit Shopify</strong></li>
                      <li>Après l'essai, abonnement Shopify requis (à partir de 25€/mois)</li>
                    </ul>
                  </div>
                  <Button onClick={handleClaimStore} className="w-full">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Activer ma boutique (30 jours gratuits)
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Active store info */}
            {(store.store_status === 'claimed' || store.store_status === 'active') && (
              <div className="space-y-3">
                <Alert>
                  <CheckCircle2 className="w-4 h-4" />
                  <AlertDescription>
                    Votre boutique est active ! Vous pouvez maintenant vendre en ligne.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-3 gap-3">
                  <Button asChild variant="outline" className="w-full">
                    <a 
                      href={`https://${store.shop_domain}/admin`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Store className="w-4 h-4 mr-2" />
                      Admin Shopify
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a 
                      href={`https://${store.shop_domain}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Ma Boutique
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a 
                      href="https://www.shopify.com/fr/pos" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Shopify POS
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Commission plateforme : {store.commission_rate}%</p>
                <p className="text-sm text-muted-foreground">
                  Prélevée automatiquement sur chaque vente
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Abonnement Shopify requis</p>
                <p className="text-sm text-muted-foreground">
                  Après les 30 jours gratuits, à partir de 25€/mois
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShoppingBag className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Gestion complète via Shopify</p>
                <p className="text-sm text-muted-foreground">
                  Produits, commandes, clients, inventaire, paiements
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No store yet - show creation form
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          Créer votre Boutique Shopify
        </CardTitle>
        <CardDescription>
          Créez votre boutique en ligne professionnelle en quelques clics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            <strong>Mode développement gratuit :</strong> Testez toutes les fonctionnalités sans frais.
            Quand vous serez prêt à vendre, activez votre boutique avec 30 jours d'essai gratuit Shopify.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Nom de votre boutique</Label>
            <Input
              id="storeName"
              placeholder="Ex: Réparations Pro"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeEmail">Email de contact</Label>
            <Input
              id="storeEmail"
              type="email"
              placeholder="contact@monentreprise.fr"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleCreateStore} 
            disabled={creating}
            className="w-full"
            size="lg"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Store className="w-4 h-4 mr-2" />
                Créer ma boutique (gratuit)
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <p className="font-semibold">Ce que vous obtenez :</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <span>Boutique en ligne complète et personnalisable</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <span>Gestion des produits, commandes et clients</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <span>Paiements sécurisés intégrés</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <span>Application Shopify POS pour vente en magasin</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <span>Synchronisation automatique des stocks</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopifyStoreActivation;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  Check, 
  Settings,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface StoreConfig {
  id: string;
  repairer_id: string;
  is_active: boolean;
  store_name: string;
  store_description?: string;
  store_url?: string;
  created_at: string;
  updated_at: string;
}

const EcommerceActivation: React.FC = () => {
  const [isStoreActive, setIsStoreActive] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Configuration de l'auto-save
  const storeData = useMemo(() => ({
    isStoreActive,
    storeName,
    storeDescription,
    storeUrl
  }), [isStoreActive, storeName, storeDescription, storeUrl]);

  const handleAutoSave = useCallback(async (data: typeof storeData) => {
    if (!data.storeName.trim() || !user) return;
    // Auto-save logic would go here
  }, [user]);

  const { isSaving, lastSaved } = useAutoSave({
    data: storeData,
    onSave: handleAutoSave,
    delay: 3000,
    enabled: isStoreActive && storeName.trim().length > 0
  });

  useEffect(() => {
    loadStoreConfig();
  }, []);

  const loadStoreConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: config } = await supabase
        .from('ecommerce_store_config' as any)
        .select('*')
        .eq('repairer_id', user.id)
        .maybeSingle();

      if (config) {
        const typedConfig = config as unknown as StoreConfig;
        setIsStoreActive(typedConfig.is_active || false);
        setStoreName(typedConfig.store_name || '');
        setStoreDescription(typedConfig.store_description || '');
        setStoreUrl(typedConfig.store_url || '');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleActivation = async () => {
    if (!storeName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la boutique est requis",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Vérifier si une configuration existe déjà
      const { data: existingConfig } = await supabase
        .from('ecommerce_store_config' as any)
        .select('id')
        .eq('repairer_id', user.id)
        .maybeSingle();

      const configData = {
        repairer_id: user.id,
        is_active: isStoreActive,
        store_name: storeName,
        store_description: storeDescription,
        store_url: storeUrl,
        updated_at: new Date().toISOString()
      };

      if (existingConfig) {
        const typedConfig = existingConfig as unknown as { id: string };
        await supabase
          .from('ecommerce_store_config' as any)
          .update(configData)
          .eq('id', typedConfig.id);
      } else {
        await supabase
          .from('ecommerce_store_config' as any)
          .insert({
            ...configData,
            created_at: new Date().toISOString()
          });
      }

      // Créer les paramètres par défaut si nécessaire
      if (isStoreActive) {
        await supabase
          .from('ecommerce_settings' as any)
          .upsert({
            repairer_id: user.id,
            settings: {
              payment_methods: ['stripe', 'click_and_collect'],
              default_currency: 'EUR',
              tax_rate: 20,
              shipping_enabled: true,
              inventory_tracking: true
            },
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'repairer_id'
          });
      }

      toast({
        title: "Configuration sauvegardée",
        description: isStoreActive ? 
          "Votre boutique e-commerce est maintenant active !" :
          "Configuration de la boutique sauvegardée.",
        variant: "default"
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Activation de la Boutique E-commerce
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statut actuel */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isStoreActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              <div>
                <p className="font-medium">
                  Boutique {isStoreActive ? 'Active' : 'Inactive'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isStoreActive ? 
                    'Votre boutique est accessible aux clients' : 
                    'La boutique n\'est pas encore activée'}
                </p>
              </div>
            </div>
            <Badge variant={isStoreActive ? "default" : "secondary"}>
              {isStoreActive ? "En ligne" : "Hors ligne"}
            </Badge>
          </div>

          {/* Configuration de base */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nom de la boutique *</Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ex: Réparations Expert"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeDescription">Description</Label>
              <Input
                id="storeDescription"
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                placeholder="Brève description de votre boutique"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeUrl">URL personnalisée</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  topreparateurs.fr/boutique/
                </span>
                <Input
                  id="storeUrl"
                  className="rounded-l-none"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="mon-nom-boutique"
                />
              </div>
            </div>
          </div>

          {/* Switch d'activation */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Activer la boutique</p>
              <p className="text-sm text-muted-foreground">
                Rendre la boutique accessible au public
              </p>
            </div>
            <Switch
              checked={isStoreActive}
              onCheckedChange={setIsStoreActive}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleActivation}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Sauvegarde..." : "Sauvegarder la configuration"}
            </Button>
          </div>

          {/* Informations supplémentaires */}
          {isStoreActive && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex gap-2">
                <Check className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-800">Boutique activée !</p>
                  <p className="text-sm text-emerald-700 mt-1">
                    Votre boutique est maintenant accessible. N'oubliez pas de :
                  </p>
                  <ul className="text-sm text-emerald-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Configurer vos méthodes de paiement</li>
                    <li>Synchroniser vos produits depuis le POS</li>
                    <li>Définir vos zones de livraison</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Étapes suivantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Prochaines étapes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Synchroniser les produits</p>
                <p className="text-sm text-muted-foreground">Importer depuis votre POS</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Configurer les paiements</p>
                <p className="text-sm text-muted-foreground">Stripe & Click & Collect</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Personnaliser l'apparence</p>
                <p className="text-sm text-muted-foreground">Couleurs et style</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EcommerceActivation;
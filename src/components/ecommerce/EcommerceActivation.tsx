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
  AlertCircle, 
  Settings,
  Globe,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EcommerceActivation: React.FC = () => {
  const [isStoreActive, setIsStoreActive] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStoreConfig();
  }, []);

  const fetchStoreConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ecommerce_store_config')
        .select('*')
        .eq('repairer_id', user.id)
        .single();

      if (data) {
        setConfig(data);
        setIsStoreActive(data.is_active);
        setStoreName(data.store_name || '');
        setStoreDescription(data.store_description || '');
        setStoreUrl(data.store_url || '');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
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
      if (!user) return;

      const storeConfig = {
        repairer_id: user.id,
        store_name: storeName,
        store_description: storeDescription,
        store_url: storeUrl || `${storeName.toLowerCase().replace(/\s+/g, '-')}-store`,
        is_active: isStoreActive,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('ecommerce_store_config')
        .upsert(storeConfig);

      if (error) throw error;

      // Créer les tables/configuration nécessaires si activé
      if (isStoreActive) {
        await initializeStoreComponents(user.id);
      }

      toast({
        title: "Configuration sauvegardée",
        description: isStoreActive ? 
          "Votre boutique e-commerce est maintenant active !" :
          "Configuration de la boutique sauvegardée.",
        variant: "default"
      });

      fetchStoreConfig();
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

  const initializeStoreComponents = async (repairerId: string) => {
    try {
      // Initialiser les paramètres par défaut de la boutique
      await supabase
        .from('ecommerce_settings')
        .upsert({
          repairer_id: repairerId,
          currency: 'EUR',
          payment_methods: ['stripe', 'click_collect'],
          shipping_zones: ['local'],
          tax_rate: 20.0,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
    }
  };

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
                <span className="text-sm font-medium text-primary">1</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Synchroniser les produits</p>
                <p className="text-sm text-muted-foreground">Importer depuis votre POS</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">2</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Configurer les paiements</p>
                <p className="text-sm text-muted-foreground">Stripe & Click & Collect</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">3</span>
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
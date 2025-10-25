import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);
  
  return { user };
};

interface ShopifyStore {
  id: string;
  repairer_id: string;
  shop_domain: string;
  store_status: string;
  store_name: string | null;
  store_email: string | null;
  commission_rate: number;
  setup_completed: boolean;
  onboarding_step: number;
  is_development_store: boolean;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useShopifyStore = () => {
  const [store, setStore] = useState<ShopifyStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load store
  const loadStore = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shopify_stores')
        .select('*')
        .eq('repairer_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setStore(data);
    } catch (error) {
      console.error('Error loading Shopify store:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger votre boutique Shopify',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create store
  const createStore = async (storeName?: string, storeEmail?: string) => {
    if (!user) return null;

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('shopify-create-store', {
        body: { storeName, storeEmail }
      });

      if (error) throw error;

      if (data.success) {
        setStore(data.store);
        toast({
          title: 'Boutique créée',
          description: 'Votre boutique Shopify sandbox a été créée avec succès',
        });
        return data.store;
      }

      throw new Error(data.error || 'Failed to create store');
    } catch (error) {
      console.error('Error creating store:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer votre boutique Shopify',
        variant: 'destructive',
      });
      return null;
    } finally {
      setCreating(false);
    }
  };

  // Claim store (convert to production)
  const claimStore = async (storeId: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.functions.invoke('shopify-claim-store', {
        body: { storeId }
      });

      if (error) throw error;

      if (data.success) {
        setStore(data.store);
        toast({
          title: 'Boutique activée',
          description: data.message,
        });
        return true;
      }

      throw new Error(data.error || 'Failed to claim store');
    } catch (error: any) {
      console.error('Error claiming store:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'activer votre boutique',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Update store settings
  const updateStore = async (updates: Partial<ShopifyStore>) => {
    if (!store) return false;

    try {
      const { error } = await supabase
        .from('shopify_stores')
        .update(updates)
        .eq('id', store.id);

      if (error) throw error;

      setStore({ ...store, ...updates });
      toast({
        title: 'Paramètres mis à jour',
        description: 'Les paramètres de votre boutique ont été mis à jour',
      });
      return true;
    } catch (error) {
      console.error('Error updating store:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les paramètres',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    loadStore();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('shopify_stores_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopify_stores',
          filter: `repairer_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log('Shopify store updated:', payload);
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setStore(payload.new as ShopifyStore);
          } else if (payload.eventType === 'DELETE') {
            setStore(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    store,
    loading,
    creating,
    createStore,
    claimStore,
    updateStore,
    refreshStore: loadStore,
  };
};


import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useBlogNewsletter = () => {
  const { toast } = useToast();

  const subscribeToNewsletter = useCallback(async (email: string, name?: string) => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          name,
          status: 'active',
          preferences: {
            blog_updates: true,
            product_news: true,
            promotions: false
          },
          subscribed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Déjà abonné",
            description: "Cette adresse email est déjà abonnée à la newsletter"
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Inscription réussie",
        description: "Vous êtes maintenant abonné à notre newsletter"
      });

      return true;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast({
        title: "Erreur",
        description: "Impossible de s'abonner à la newsletter",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  return {
    subscribeToNewsletter
  };
};

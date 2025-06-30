
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBlogNewsletter = () => {
  const { toast } = useToast();

  // Gestion de la newsletter
  const subscribeToNewsletter = async (email: string, name?: string) => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, name })
        .select()
        .single();

      if (error) throw error;
      toast({
        title: "Succès",
        description: "Inscription à la newsletter réussie"
      });
      return data;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast({
        title: "Erreur",
        description: "Impossible de s'inscrire à la newsletter",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    subscribeToNewsletter
  };
};

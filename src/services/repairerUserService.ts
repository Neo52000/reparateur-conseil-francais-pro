
import { supabase } from '@/integrations/supabase/client';

export const createUserIfNotExists = async (
  email: string,
  first_name?: string,
  last_name?: string,
  phone?: string
): Promise<string | null> => {
  try {
    // Obtenir la session courante pour les headers d'autorisation
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    // Ajouter l'autorisation si une session existe
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    
    console.log('Calling create-repairer-user with:', { email, first_name, phone });
    
    const res = await fetch(
      "https://nbugpbakfkyvvjzgfjmw.functions.supabase.co/create-repairer-user",
      {
        method: "POST",
        headers,
        body: JSON.stringify({ email, first_name, last_name, phone }),
      }
    );
    
    const data = await res.json();
    console.log('Response from create-repairer-user:', { status: res.status, data });
    
    if (!res.ok || data?.error) {
      const msg = data?.error || `Erreur HTTP ${res.status}`;
      console.error('Edge function error:', msg);
      throw new Error(msg);
    }
    
    return data.user_id as string;
  } catch (error) {
    console.error('Error in createUserIfNotExists:', error);
    throw error;
  }
};

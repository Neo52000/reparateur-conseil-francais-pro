
import { supabase } from '@/integrations/supabase/client';

/**
 * Service pour la gestion des utilisateurs réparateurs
 */
export class RepairerUserService {
  /**
   * Crée un utilisateur réparateur s'il n'existe pas déjà
   */
  static async createUserIfNotExists(
    email: string,
    first_name?: string,
    last_name?: string,
    phone?: string
  ): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      
      console.log('🔧 Creating user with data:', { email, first_name, phone });
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(
        `${supabaseUrl}/functions/v1/create-repairer-user`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ email, first_name, last_name, phone }),
        }
      );
      
      const data = await res.json();
      console.log('📥 User creation response:', { status: res.status, data });
      
      if (!res.ok || data?.error) {
        throw new Error(data?.error || `Erreur HTTP ${res.status}`);
      }
      
      return data.user_id as string;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }
}


import { supabase } from '@/integrations/supabase/client';

export const testDatabaseConnection = async () => {
  try {
    console.log("[databaseConnection] 🔍 Test de connectivité à la base...");
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log("[databaseConnection] Session:", { 
      hasSession: !!sessionData.session,
      error: sessionError?.message 
    });

    const { count, error: countError } = await supabase
      .from('repairers')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error("[databaseConnection] ❌ Erreur de connexion DB:", countError);
      throw new Error(`Erreur DB: ${countError.message}`);
    }

    console.log("[databaseConnection] ✅ Connexion OK, total repairers:", count);
    return true;
  } catch (error) {
    console.error("[databaseConnection] 💥 Test de connexion échoué:", error);
    return false;
  }
};

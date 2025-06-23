
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useScrapingAuth = () => {
  const { toast } = useToast();
  const { user, session, isAdmin } = useAuth();

  const checkAuthAndPermissions = () => {
    console.log("[useScrapingAuth] 🔐 Vérification auth:", { 
      user: !!user, 
      session: !!session, 
      isAdmin,
      userId: user?.id 
    });

    if (!user || !session) {
      toast({
        title: "Non authentifié",
        description: "Vous devez être connecté pour effectuer cette action.",
        variant: "destructive"
      });
      return false;
    }

    if (!isAdmin) {
      toast({
        title: "Permissions insuffisantes",
        description: "Vous devez être administrateur pour effectuer cette action.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return {
    user,
    session,
    isAdmin,
    checkAuthAndPermissions
  };
};

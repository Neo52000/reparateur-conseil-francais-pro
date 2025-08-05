
import { useAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';

export const useScrapingAuth = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const checkAuthAndPermissions = (): boolean => {
    if (!user) {
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
    isAdmin,
    checkAuthAndPermissions
  };
};

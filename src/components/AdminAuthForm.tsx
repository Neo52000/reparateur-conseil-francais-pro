
import { useState, useEffect, FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import AdminAuthFormContent from '@/components/admin/AdminAuthFormContent';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

/**
 * Composant principal de connexion administrateur
 * 
 * Gère deux cas :
 * 1. Affichage du formulaire de connexion pour les utilisateurs non connectés
 * 2. Panneau de debug pour les utilisateurs connectés sans droits admin
 */
const AdminAuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { signInAdmin, user, isAdmin, profile, loading: authLoading, refreshProfile } = useAuth();

  /**
   * Gestion de la soumission du formulaire de connexion
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    logger.debug('Starting admin login process');
    logger.debug('Email:', email);
    logger.debug('Current auth state before login:', {
      hasUser: !!user,
      hasProfile: !!profile,
      isAdmin,
      authLoading
    });

    try {
      const { error } = await signInAdmin(email, password);
      
      if (error) {
        logger.error('Admin login error:', error);
        toast({
          title: "Erreur de connexion admin",
          description: error.message === 'Invalid login credentials' 
            ? "Email ou mot de passe incorrect" 
            : error.message,
          variant: "destructive"
        });
      } else {
        logger.debug('Admin login successful');
        toast({
          title: "Connexion admin réussie",
          description: "Bienvenue dans l'interface d'administration"
        });
      }
    } catch (error) {
      logger.error('Exception during admin login:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gestion du rafraîchissement du profil avec feedback utilisateur
   */
  const handleRefreshProfile = async () => {
    if (refreshProfile) {
      try {
        logger.debug('Refreshing profile manually...');
        await refreshProfile();
        toast({
          title: "Profil actualisé",
          description: "Tentative de récupération du profil effectuée"
        });
      } catch (error) {
        logger.error('Error refreshing profile:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'actualiser le profil",
          variant: "destructive"
        });
      }
    }
  };

  // Effect pour afficher un toast quand un utilisateur non-admin tente d'accéder
  useEffect(() => {
    if (user && !isAdmin && !authLoading) {
      logger.debug('User connected but not admin - showing warning toast');
      toast({
        title: "Connexion admin requise",
        description: "Veuillez vous connecter avec un compte administrateur",
        variant: "destructive"
      });
    }
  }, [user, isAdmin, authLoading, toast]);

  // Debug: Log de l'état actuel
  logger.debug('AdminAuthForm render state:', {
    hasUser: !!user,
    userEmail: user?.email,
    isAdmin,
    authLoading,
    profileRole: profile?.role,
    profileEmail: profile?.email
  });

  // Affichage du formulaire de connexion standard
  logger.debug('Showing login form');
  return (
    <AdminAuthFormContent
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      loading={loading}
      authLoading={authLoading}
      onSubmit={handleSubmit}
    />
  );
};

export default AdminAuthForm;


import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import AdminAuthFormContent from '@/components/admin/AdminAuthFormContent';
import AdminDebugPanel from '@/components/admin/AdminDebugPanel';

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 Attempting admin login for:', email);
      const { error } = await signInAdmin(email, password);
      
      if (error) {
        console.error('❌ Admin login error:', error);
        toast({
          title: "Erreur de connexion admin",
          description: error.message === 'Invalid login credentials' 
            ? "Email ou mot de passe incorrect" 
            : error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ Admin login successful');
        toast({
          title: "Connexion admin réussie",
          description: "Bienvenue dans l'interface d'administration"
        });
      }
    } catch (error) {
      console.error('💥 Exception during admin login:', error);
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
        await refreshProfile();
        toast({
          title: "Profil actualisé",
          description: "Tentative de récupération du profil effectuée"
        });
      } catch (error) {
        console.error('❌ Error refreshing profile:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'actualiser le profil",
          variant: "destructive"
        });
      }
    }
  };

  // Affichage du panneau de debug si l'utilisateur est connecté mais pas admin
  if (user && !isAdmin && !authLoading) {
    return (
      <AdminDebugPanel
        user={user}
        profile={profile}
        isAdmin={isAdmin}
        onRefreshProfile={handleRefreshProfile}
      />
    );
  }

  // Affichage du formulaire de connexion standard
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

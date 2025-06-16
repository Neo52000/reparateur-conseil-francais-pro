
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, RefreshCw } from 'lucide-react';

const AdminAuthForm = () => {
  const [email, setEmail] = useState('reine.elie@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { signIn, user, isAdmin, profile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Redirection automatique si l'utilisateur est déjà connecté et admin
  useEffect(() => {
    if (user && isAdmin) {
      console.log('✅ User is authenticated and admin, staying on admin page');
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 Attempting admin login for:', email);
      const { error } = await signIn(email, password);
      
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

  // Afficher un état de debug si l'utilisateur est connecté mais pas admin
  if (user && !isAdmin && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto border-yellow-200 shadow-lg">
          <CardHeader className="bg-yellow-50 text-center">
            <CardTitle className="flex items-center justify-center text-yellow-800">
              <Shield className="h-6 w-6 mr-2" />
              Problème d'accès admin
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-6 space-y-4">
            <div className="text-sm space-y-2">
              <p><strong>Utilisateur:</strong> {user.email}</p>
              <p><strong>Profil chargé:</strong> {profile ? 'Oui' : 'Non'}</p>
              <p><strong>Rôle:</strong> {profile?.role || 'Non défini'}</p>
              <p><strong>Admin:</strong> {isAdmin ? 'Oui' : 'Non'}</p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleRefreshProfile} 
                className="w-full" 
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser le profil
              </Button>
              
              <Button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full" 
                variant="destructive"
              >
                Réinitialiser et recharger
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-auto border-blue-200 shadow-lg">
        <CardHeader className="bg-blue-50 text-center">
          <CardTitle className="flex items-center justify-center text-blue-800">
            <Shield className="h-6 w-6 mr-2" />
            Accès Administrateur
          </CardTitle>
          <p className="text-sm text-blue-600 mt-2">
            Connexion requise pour accéder au panneau d'administration
          </p>
        </CardHeader>
        <CardContent className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email administrateur</Label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="admin@repairhub.com"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={loading || authLoading}
            >
              {(loading || authLoading) ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Compte de test :</strong>
            </p>
            <p className="text-xs text-blue-600">
              Email: reine.elie@gmail.com<br/>
              Mot de passe: Rpadfhq3@52
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuthForm;

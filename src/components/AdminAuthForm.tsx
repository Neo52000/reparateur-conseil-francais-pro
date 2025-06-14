
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Lock, Mail } from 'lucide-react';

const AdminAuthForm = () => {
  const [email, setEmail] = useState('reine.elie@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signIn } = useAuth();

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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={loading}
            >
              {loading ? (
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

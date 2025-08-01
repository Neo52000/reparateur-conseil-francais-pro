import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Eye, EyeOff } from 'lucide-react';

const ClientAuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Gérer la redirection après connexion réussie
  useEffect(() => {
    if (user) {
      // Vérifier s'il y a une recherche personnalisée en attente
      const pendingPersonalizedSearch = localStorage.getItem('pendingPersonalizedSearch');
      if (pendingPersonalizedSearch) {
        localStorage.removeItem('pendingPersonalizedSearch');
        navigate('/', { replace: true });
        // Dispatch immédiat de l'événement via microtask
        Promise.resolve().then(() => {
          window.dispatchEvent(new CustomEvent('restorePersonalizedSearch'));
        });
      } else {
        // Redirection normale vers la page d'accueil
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erreur de connexion",
            description: error.message === 'Invalid login credentials' 
              ? "Email ou mot de passe incorrect" 
              : error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Connexion réussie",
            description: "Bienvenue dans votre espace client"
          });
        }
      } else {
        const { error } = await signUp(email, password, {
          first_name: firstName,
          last_name: lastName,
          role: 'user', // Utiliser 'user' au lieu de 'client' car c'est le rôle par défaut
          phone: phone
        });
        if (error) {
          toast({
            title: "Erreur d'inscription",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Inscription réussie",
            description: "Vérifiez votre email pour confirmer votre compte"
          });
        }
      }
    } catch (error) {
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
    <Card className="w-full max-w-md mx-auto border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center text-blue-800">
          <User className="h-5 w-5 mr-2" />
          {isLogin ? 'Connexion Client' : 'Inscription Client'}
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isLogin}
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={!isLogin}
                    placeholder="Dupont"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>
            </>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                placeholder="votre@email.fr"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
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
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600"
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientAuthForm;

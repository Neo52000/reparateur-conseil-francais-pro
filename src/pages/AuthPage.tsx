import * as React from 'react';
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Safe auth hook usage with defensive error handling
  let signIn = async (email: string, password: string) => ({ error: { message: 'Auth not available' } });
  let signUp = async (email: string, password: string, userData?: any) => ({ error: { message: 'Auth not available' } });
  
  try {
    const auth = useAuth();
    signIn = auth.signIn;
    signUp = auth.signUp;
  } catch (error) {
    console.error('AuthPage: Failed to load auth context:', error);
  }
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: searchParams.get('role') || 'client'
  });

  const defaultTab = searchParams.get('tab') || 'signin';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté"
        });
        navigate('/');
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>RepairHub</CardTitle>
          <CardDescription>
            Connectez-vous ou créez votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Custom tabs implementation */}
          <div className="w-full">
            <div className="grid w-full grid-cols-2 rounded-lg bg-muted p-1 mb-6">
              <button
                onClick={() => setActiveTab('signin')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  activeTab === 'signin'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  activeTab === 'signup'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Inscription
              </button>
            </div>
            
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
            )}
            
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Inscription...' : 'S\'inscrire'}
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
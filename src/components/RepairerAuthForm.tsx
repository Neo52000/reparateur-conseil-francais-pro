import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Wrench, Phone, Mail, MapPin, Globe, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RepairerAuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erreur de connexion",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Connexion réussie",
            description: "Bienvenue dans votre espace réparateur"
          });
          // Pas besoin de navigate ici : la redirection est prise en charge par le hook useAuth + RepairerSpace
        }
      } else {
        const { error } = await signUp(email, password, {
          first_name: firstName,
          last_name: lastName,
          role: 'repairer',
          business_name: businessName,
          phone: phone,
          address: address,
          website: website
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
          // Redirection après inscription réussie réparateur
          setTimeout(() => {
            navigate('/repairer/plans'); // La route de la page d’abonnement (adapte si le path diffère)
          }, 800);
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
    <Card className="w-full max-w-md mx-auto border-orange-200">
      <CardHeader className="bg-orange-50">
        <CardTitle className="flex items-center text-orange-800">
          <Wrench className="h-5 w-5 mr-2" />
          {isLogin ? 'Connexion Réparateur' : 'Inscription Réparateur'}
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <Label htmlFor="businessName">Nom de l'entreprise</Label>
                <Input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required={!isLogin}
                  placeholder="TechRepair Pro"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isLogin}
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
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <div className="relative">
                  <MapPin className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-10"
                    placeholder="123 Rue de la Réparation, 75001 Paris"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website">Site web (optionnel)</Label>
                <div className="relative">
                  <Globe className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="pl-10"
                    placeholder="https://monsite.fr"
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
          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-600"
          >
            {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepairerAuthForm;

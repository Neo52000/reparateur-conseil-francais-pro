import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Star, Shield, Clock, Smartphone, MapPin, Users, Wrench } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  // Temporairement désactivé pour éviter les erreurs de store
  // const { user, profile } = useAuthStore();
  const user = null; // Temporaire

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/search');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">TopRéparateurs.fr</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Link to="/search">
              <Button variant="ghost">
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
            </Link>
            {user ? (
              <Link to="/dashboard">
                <Button>
                  Tableau de bord
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Connexion</Button>
                </Link>
                <Link to="/register">
                  <Button>S'inscrire</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Trouvez le meilleur réparateur près de chez vous
          </h2>
          <p className="text-xl mb-8 opacity-90">
            La plateforme de référence pour tous vos besoins de réparation de smartphones
          </p>
          <Link to="/search">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              <Search className="mr-2 h-5 w-5" />
              Commencer ma recherche
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">
            Pourquoi choisir TopRéparateurs.fr ?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover-lift">
              <CardHeader>
                <Star className="h-12 w-12 text-accent mx-auto mb-4" />
                <CardTitle>Réparateurs vérifiés</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tous nos réparateurs sont vérifiés et notés par la communauté
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardHeader>
                <Shield className="h-12 w-12 text-accent mx-auto mb-4" />
                <CardTitle>Devis transparents</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Recevez des devis détaillés et comparez les prix facilement
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover-lift">
              <CardHeader>
                <Clock className="h-12 w-12 text-accent mx-auto mb-4" />
                <CardTitle>Service rapide</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Trouvez un réparateur disponible rapidement près de chez vous
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">
            Vous êtes réparateur ?
          </h3>
          <p className="text-lg mb-8 text-muted-foreground">
            Rejoignez notre réseau de professionnels et développez votre activité
          </p>
          <Link to="/register">
            <Button size="lg">
              Devenir partenaire
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 TopRéparateurs.fr - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
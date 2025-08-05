import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Smartphone, Users, MapPin } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground">
          RepairHub
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Le Doctolib de la réparation smartphone & mobile. 
          Trouvez le bon réparateur près de chez vous en quelques clics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/search">
            <Button size="lg" className="w-full sm:w-auto">
              <Search className="w-4 h-4 mr-2" />
              Trouver un réparateur
            </Button>
          </Link>
          <Link to="/auth?tab=signup&role=repairer">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Users className="w-4 h-4 mr-2" />
              Devenir réparateur
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary" />
              Géolocalisation
            </CardTitle>
            <CardDescription>
              Trouvez les réparateurs les plus proches de chez vous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Notre système de géolocalisation vous permet de localiser 
              instantanément les réparateurs dans votre zone.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="w-5 h-5 mr-2 text-primary" />
              Devis instantané
            </CardTitle>
            <CardDescription>
              Obtenez un devis en ligne en quelques minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Décrivez votre problème et recevez rapidement des devis 
              détaillés de réparateurs qualifiés.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary" />
              Réparateurs certifiés
            </CardTitle>
            <CardDescription>
              Tous nos réparateurs sont vérifiés et notés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Consultez les avis clients et choisissez votre réparateur 
              en toute confiance.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="bg-muted rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Prêt à réparer votre smartphone ?
        </h2>
        <p className="text-muted-foreground mb-6">
          Rejoignez des milliers d'utilisateurs qui font confiance à RepairHub
        </p>
        <Link to="/search">
          <Button size="lg">
            Commencer maintenant
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
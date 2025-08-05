import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MapPin, Phone, Star, Shield, Clock } from 'lucide-react';

export default function SimpleIndex() {
  return (
    <>
      <Helmet>
        <title>RepairHub - Trouvez votre réparateur de confiance</title>
        <meta name="description" content="Trouvez le meilleur réparateur près de chez vous. Service rapide, transparent et de qualité." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Navigation simple */}
        <nav className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-primary">RepairHub</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost">Connexion</Button>
                <Button>S'inscrire</Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Trouvez votre réparateur de confiance
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                Service rapide, transparent et de qualité près de chez vous
              </p>
              
              {/* Formulaire de recherche simple */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg p-4 flex gap-2">
                  <div className="flex-1">
                    <Input 
                      placeholder="Que voulez-vous réparer ?" 
                      className="border-0 text-foreground"
                    />
                  </div>
                  <div className="flex-1">
                    <Input 
                      placeholder="Votre ville" 
                      className="border-0 text-foreground"
                    />
                  </div>
                  <Button size="lg">
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistiques */}
        <section className="py-16 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                <div className="text-muted-foreground">Clients satisfaits</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">5000+</div>
                <div className="text-muted-foreground">Réparations effectuées</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">Villes couvertes</div>
              </div>
            </div>
          </div>
        </section>

        {/* Avantages */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Pourquoi choisir RepairHub ?</h2>
              <p className="text-xl text-muted-foreground">
                La plateforme de confiance pour tous vos besoins de réparation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Réparateurs vérifiés</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Tous nos réparateurs sont vérifiés et certifiés pour vous garantir un service de qualité.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Service rapide</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Trouvez un réparateur disponible rapidement et obtenez un devis en quelques clics.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Star className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Qualité garantie</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Avis clients vérifiés et garantie sur les réparations pour votre tranquillité d'esprit.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-accent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à réparer ?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Trouvez le bon réparateur en quelques minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <Search className="h-4 w-4 mr-2" />
                Trouver un réparateur
              </Button>
              <Button variant="outline" size="lg">
                <Phone className="h-4 w-4 mr-2" />
                Nous contacter
              </Button>
            </div>
          </div>
        </section>

        {/* Footer simple */}
        <footer className="bg-card border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-muted-foreground">
              <p>&copy; 2024 RepairHub. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
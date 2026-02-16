import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, Users, Smartphone, Award, ChevronRight, Heart, Target, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AProposPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>À propos de TopRéparateurs - La plateforme de réparation n°1</title>
        <meta name="description" content="Découvrez TopRéparateurs, la plateforme qui met en relation particuliers et réparateurs de smartphones certifiés. Notre mission : rendre la réparation accessible et transparente." />
        <link rel="canonical" href="https://topreparateurs.fr/a-propos" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "TopRéparateurs",
            url: "https://topreparateurs.fr",
            description: "Plateforme de mise en relation entre particuliers et réparateurs de smartphones certifiés.",
            foundingDate: "2024",
            areaServed: { "@type": "Country", name: "France" },
            sameAs: []
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        <nav className="bg-muted/50 py-3 px-4" aria-label="Fil d'Ariane">
          <div className="container mx-auto">
            <ol className="flex items-center gap-1 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary">Accueil</Link></li>
              <ChevronRight className="h-4 w-4" />
              <li className="text-foreground font-medium">À propos</li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <header className="bg-gradient-to-b from-primary/10 to-background py-16 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Qui sommes-nous ?
            </h1>
            <p className="text-lg text-muted-foreground">
              TopRéparateurs est la plateforme française de référence pour trouver un réparateur de smartphone, tablette ou ordinateur près de chez vous. Notre mission : rendre la réparation accessible, transparente et fiable.
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 space-y-16">
          {/* Mission */}
          <section className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'Notre Mission', text: 'Mettre en relation les particuliers avec les meilleurs réparateurs certifiés de leur ville, en toute transparence.' },
              { icon: Heart, title: 'Nos Valeurs', text: 'Confiance, transparence et qualité. Chaque réparateur est vérifié et évalué par de vrais clients.' },
              { icon: Zap, title: 'Notre Vision', text: 'Devenir le Doctolib de la réparation : simple, rapide et fiable pour tous.' }
            ].map((item, i) => (
              <Card key={i}>
                <CardContent className="p-6 text-center">
                  <item.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h2 className="text-xl font-bold mb-3">{item.title}</h2>
                  <p className="text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Chiffres clés */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-8">TopRéparateurs en chiffres</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Users, value: '5 000+', label: 'Réparateurs référencés' },
                { icon: Smartphone, value: '50+', label: 'Villes couvertes' },
                { icon: Shield, value: '6 mois', label: 'Garantie minimum' },
                { icon: Award, value: '4.8/5', label: 'Note moyenne' }
              ].map((stat, i) => (
                <div key={i} className="p-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Comment ça marche */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8">Comment ça marche ?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Décrivez votre panne', text: 'Indiquez votre appareil, le problème rencontré et votre localisation.' },
                { step: '2', title: 'Comparez les réparateurs', text: 'Consultez les avis, les prix et les disponibilités des réparateurs près de chez vous.' },
                { step: '3', title: 'Faites réparer', text: 'Prenez rendez-vous en ligne et bénéficiez d\'une réparation garantie.' }
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center bg-primary/5 rounded-2xl p-12">
            <h2 className="text-2xl font-bold mb-4">Prêt à faire réparer votre appareil ?</h2>
            <p className="text-muted-foreground mb-6">Trouvez un réparateur certifié en quelques clics.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg">
                <Link to="/search">Trouver un réparateur</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/repairer-plans">Devenir réparateur</Link>
              </Button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default AProposPage;

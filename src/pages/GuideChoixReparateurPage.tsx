import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Shield, MapPin, Euro, Clock, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const criteria = [
  { icon: Star, title: 'Les avis clients', text: 'Consultez les avis vérifiés. Un réparateur avec plus de 4 étoiles et au moins 10 avis est un bon indicateur de fiabilité.' },
  { icon: Shield, title: 'La garantie proposée', text: 'Privilégiez les réparateurs offrant au moins 6 mois de garantie sur les pièces et la main d\'œuvre.' },
  { icon: Euro, title: 'La transparence des prix', text: 'Un bon réparateur propose un devis gratuit et détaillé avant toute intervention, sans frais cachés.' },
  { icon: MapPin, title: 'La proximité', text: 'Choisissez un réparateur près de chez vous pour faciliter le dépôt et la récupération de votre appareil.' },
  { icon: Clock, title: 'Les délais d\'intervention', text: 'La plupart des réparations courantes (écran, batterie) peuvent être faites en moins d\'une heure.' },
  { icon: Award, title: 'Les certifications', text: 'Les réparateurs certifiés et les profils vérifiés sur TopRéparateurs offrent une assurance qualité supplémentaire.' }
];

const mistakes = [
  'Se fier uniquement au prix le plus bas (attention à la qualité des pièces)',
  'Ne pas demander de devis écrit avant l\'intervention',
  'Confier son appareil sans vérifier la garantie proposée',
  'Ignorer les avis des précédents clients',
  'Ne pas vérifier si le réparateur est déclaré et assuré'
];

const GuideChoixReparateurPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Comment choisir un réparateur de téléphone - Guide complet</title>
        <meta name="description" content="Découvrez nos conseils pour bien choisir votre réparateur de smartphone : avis, garantie, prix, certifications. Guide pratique pour ne pas se tromper." />
        <link rel="canonical" href="https://topreparateurs.fr/guide-choix-reparateur" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "Comment choisir un réparateur de téléphone",
            description: "Guide complet pour choisir le meilleur réparateur de smartphone",
            step: criteria.map((c, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: c.title,
              text: c.text
            }))
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <nav className="bg-muted/50 py-3 px-4" aria-label="Fil d'Ariane">
          <div className="container mx-auto">
            <ol className="flex items-center gap-1 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary">Accueil</Link></li>
              <ChevronRight className="h-4 w-4" />
              <li className="text-foreground font-medium">Guide : choisir un réparateur</li>
            </ol>
          </div>
        </nav>

        <header className="bg-gradient-to-b from-primary/10 to-background py-16 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Comment choisir un réparateur de téléphone ?
            </h1>
            <p className="text-lg text-muted-foreground">
              6 critères essentiels pour trouver le réparateur idéal et éviter les mauvaises surprises.
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 space-y-12">
          {/* Critères */}
          <section>
            <h2 className="text-2xl font-bold mb-8">Les 6 critères pour bien choisir</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {criteria.map((item, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{item.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Erreurs à éviter */}
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader>
              <CardTitle>❌ Les 5 erreurs à éviter</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mistakes.map((m, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-destructive font-bold">{i + 1}.</span>
                    <span className="text-muted-foreground">{m}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Checklist */}
          <section>
            <h2 className="text-2xl font-bold mb-6">✅ Checklist avant de confier votre appareil</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Demander un devis gratuit détaillé',
                'Vérifier les avis en ligne',
                'S\'assurer de la garantie proposée',
                'Demander le type de pièces utilisées',
                'Sauvegarder vos données avant',
                'Conserver le reçu ou la facture'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center bg-primary/5 rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-4">Trouvez votre réparateur idéal</h2>
            <p className="text-muted-foreground mb-6">Comparez les réparateurs certifiés près de chez vous.</p>
            <Button asChild size="lg">
              <Link to="/search">Comparer les réparateurs</Link>
            </Button>
          </section>
        </main>
      </div>
    </>
  );
};

export default GuideChoixReparateurPage;

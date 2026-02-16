import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Clock, AlertTriangle, ChevronRight, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faq = [
  { q: "Que couvre la garantie TopRéparateurs ?", a: "La garantie couvre les défauts liés à la réparation effectuée : pièces remplacées et main d'œuvre. Si le même problème réapparaît, le réparateur reprend l'intervention gratuitement." },
  { q: "Quelle est la durée de la garantie ?", a: "La garantie minimum est de 6 mois à compter de la date de réparation. Certains réparateurs Premium offrent jusqu'à 12 mois de garantie." },
  { q: "Comment faire jouer la garantie ?", a: "Contactez directement le réparateur via votre espace client ou la messagerie intégrée. En cas de litige, notre service client intervient comme médiateur." },
  { q: "La garantie est-elle valable pour les pièces non-originales ?", a: "Oui, la garantie s'applique quelle que soit la qualité des pièces utilisées (originales ou compatibles haute qualité). Le réparateur doit vous informer du type de pièce utilisé." }
];

const GarantiePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Notre garantie réparation - TopRéparateurs</title>
        <meta name="description" content="Toutes les réparations sur TopRéparateurs sont garanties 6 mois minimum. Découvrez nos engagements qualité et comment faire jouer votre garantie." />
        <link rel="canonical" href="https://topreparateurs.fr/garantie" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map(f => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a }
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
              <li className="text-foreground font-medium">Garantie</li>
            </ol>
          </div>
        </nav>

        <header className="bg-gradient-to-b from-primary/10 to-background py-16 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <Shield className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Notre garantie</h1>
            <p className="text-lg text-muted-foreground">
              Toutes les réparations effectuées par nos réparateurs certifiés sont couvertes par une garantie de 6 mois minimum sur les pièces et la main d'œuvre.
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 space-y-12">
          {/* Engagements */}
          <section className="grid md:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle, title: 'Pièces garanties', text: 'Toutes les pièces remplacées sont couvertes contre les défauts de fabrication.' },
              { icon: Clock, title: '6 mois minimum', text: 'Une durée de garantie confortable pour une tranquillité d\'esprit totale.' },
              { icon: Phone, title: 'SAV réactif', text: 'Un problème ? Contactez le réparateur ou notre service client sous 24h.' }
            ].map((item, i) => (
              <Card key={i}>
                <CardContent className="p-6 text-center">
              <item.icon className="h-10 w-10 mx-auto mb-4 text-primary" />
                  <h2 className="text-lg font-bold mb-2">{item.title}</h2>
                  <p className="text-muted-foreground text-sm">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Exclusions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Ce que la garantie ne couvre pas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                {[
                  'Les dommages causés après la réparation (chute, immersion, etc.)',
                  'L\'usure normale de l\'appareil',
                  'Les problèmes logiciels non liés à la réparation',
                  'Les appareils ouverts ou modifiés par un tiers après la réparation'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Questions fréquentes sur la garantie</h2>
            <Accordion type="single" collapsible className="w-full">
              {faq.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* CTA */}
          <section className="text-center bg-primary/5 rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-4">Besoin d'une réparation garantie ?</h2>
            <Button asChild size="lg">
              <Link to="/search">Trouver un réparateur certifié</Link>
            </Button>
          </section>
        </main>
      </div>
    </>
  );
};

export default GarantiePage;

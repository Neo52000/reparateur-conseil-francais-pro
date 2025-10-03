import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, CheckCircle, Shield, Clock, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const ConsoleRepairPage = () => {
  const commonIssues = [
    { icon: Gamepad2, title: 'Manette', description: 'Réparation boutons et joysticks' },
    { icon: CheckCircle, title: 'Lecteur disque', description: 'Problème lecture jeux' },
    { icon: Shield, title: 'Surchauffe', description: 'Nettoyage et changement pâte thermique' },
    { icon: Clock, title: 'Connectivité', description: 'WiFi, Bluetooth, HDMI' }
  ];

  const brands = ['PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'Steam Deck'];

  return (
    <>
      <Helmet>
        <title>Réparation Console de Jeux - PS5, Xbox, Nintendo Switch | TopRéparateurs</title>
        <meta name="description" content="Réparation console de jeux toutes marques. PlayStation, Xbox, Nintendo Switch. Manette, lecteur, surchauffe... Experts gaming près de chez vous." />
        <meta name="keywords" content="réparation console, réparation PS5, réparation Xbox, réparation Switch, manette cassée" />
        <link rel="canonical" href="https://topreparateurs.fr/reparation-console" />
      </Helmet>

      <Navigation />

      <main className="min-h-screen">
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="premium" className="mb-4">
                <Gamepad2 className="h-3 w-3 mr-1" />
                Experts Gaming
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Réparation Console de Jeux
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                PlayStation, Xbox, Nintendo Switch. Réparation rapide par des experts gaming.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button size="lg" className="button-lift">
                    Trouver un réparateur
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/quotes-appointments">
                  <Button size="lg" variant="outline">
                    Devis gratuit
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto"
            >
              {[
                { icon: Shield, label: 'Experts', value: '1500+' },
                { icon: Star, label: 'Satisfaction', value: '97%' },
                { icon: Clock, label: 'Réparation', value: '< 3h' },
                { icon: CheckCircle, label: 'Garantie', value: '6 mois' }
              ].map((item, i) => (
                <Card key={i} variant="glass" className="text-center">
                  <CardContent className="p-4">
                    <item.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold mb-1">{item.value}</div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Pannes Fréquentes</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {commonIssues.map((issue, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card variant="elevated" className="h-full hover-scale">
                    <CardContent className="p-6 text-center">
                      <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                        <issue.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{issue.title}</h3>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Toutes Consoles</h2>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {brands.map((brand, index) => (
                <Badge key={index} variant="glass" className="text-base px-6 py-2">
                  {brand}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Console en Panne ?</h2>
            <p className="text-xl mb-8 opacity-90">
              Retrouvez le plaisir de jouer rapidement
            </p>
            <Link to="/">
              <Button size="lg" variant="secondary" className="button-lift">
                Trouver un expert
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ConsoleRepairPage;

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Laptop, CheckCircle, Shield, Clock, Star, ArrowRight, HardDrive, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const ComputerRepairPage = () => {
  const commonIssues = [
    { icon: Cpu, title: 'Problème démarrage', description: 'Diagnostic et réparation système' },
    { icon: HardDrive, title: 'Disque dur', description: 'Remplacement HDD/SSD et récupération données' },
    { icon: Laptop, title: 'Écran défectueux', description: 'Changement dalle LCD' },
    { icon: CheckCircle, title: 'Virus & lenteurs', description: 'Nettoyage et optimisation' }
  ];

  return (
    <>
      <Helmet>
        <title>Réparation Ordinateur PC et Mac - Dépannage Informatique | TopRéparateurs</title>
        <meta name="description" content="Réparation ordinateur portable et fixe. Problème démarrage, virus, écran cassé, récupération données. Techniciens experts près de chez vous." />
        <meta name="keywords" content="réparation ordinateur, dépannage PC, réparation Mac, virus ordinateur, récupération données" />
        <link rel="canonical" href="https://topreparateurs.fr/reparation-ordinateur" />
      </Helmet>

      <Navigation />

      <main className="min-h-screen w-full">
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 sm:py-20 w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="premium" className="mb-4">
                <Laptop className="h-3 w-3 mr-1" />
                Experts Informatique
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Réparation & Dépannage Ordinateur
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                PC, Mac, portable ou fixe. Intervention rapide par des techniciens certifiés.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button size="lg" className="button-lift">
                    Trouver un technicien
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
                { icon: Shield, label: 'Techniciens', value: '3000+' },
                { icon: Star, label: 'Note', value: '4.9/5' },
                { icon: Clock, label: 'Intervention', value: '< 24h' },
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
              <h2 className="text-3xl font-bold mb-4">Problèmes Courants</h2>
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

        <section className="py-16 bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Besoin d'un Dépannage ?</h2>
            <p className="text-xl mb-8 opacity-90">
              Nos techniciens interviennent rapidement
            </p>
            <Link to="/">
              <Button size="lg" variant="secondary" className="button-lift">
                Trouver un technicien
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

export default ComputerRepairPage;

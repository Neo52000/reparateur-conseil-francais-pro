import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tablet, CheckCircle, Shield, Clock, Star, ArrowRight, Battery, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const TabletRepairPage = () => {
  const commonIssues = [
    { icon: Monitor, title: 'Écran tactile', description: 'Remplacement vitre ou dalle LCD' },
    { icon: Battery, title: 'Batterie', description: 'Changement batterie défaillante' },
    { icon: Tablet, title: 'Port de charge', description: 'Réparation connecteur USB' },
    { icon: CheckCircle, title: 'Problème logiciel', description: 'Réinitialisation et optimisation' }
  ];

  const brands = ['Apple iPad', 'Samsung Galaxy Tab', 'Huawei', 'Lenovo', 'Microsoft Surface', 'Amazon Fire'];

  return (
    <>
      <Helmet>
        <title>Réparation Tablette - iPad, Samsung, Huawei | TopRéparateurs</title>
        <meta name="description" content="Réparation tablette toutes marques. Écran cassé, batterie, port de charge... Réparateurs certifiés près de chez vous. Devis gratuit." />
        <meta name="keywords" content="réparation tablette, réparation iPad, écran tablette cassé, batterie tablette, réparateur tablette" />
        <link rel="canonical" href="https://topreparateurs.fr/reparation-tablette" />
      </Helmet>

      <Navigation />

      <main className="min-h-screen w-full">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 sm:py-20 w-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="premium" className="mb-4">
                <Tablet className="h-3 w-3 mr-1" />
                Expert en Tablettes
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Réparation Tablette et iPad
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Intervention rapide pour toutes marques. Écran, batterie, port de charge... Garantie 6 mois.
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
                { icon: Shield, label: 'Certifiés', value: '2500+' },
                { icon: Star, label: 'Satisfaction', value: '98%' },
                { icon: Clock, label: 'Rapide', value: '< 2h' },
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

        {/* Common Issues */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Pannes Fréquentes</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nos experts réparent tous les problèmes de tablettes
              </p>
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

        {/* Brands */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Toutes Marques</h2>
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

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Votre Tablette a Besoin d'une Réparation ?</h2>
            <p className="text-xl mb-8 opacity-90">
              Trouvez un expert près de chez vous
            </p>
            <Link to="/">
              <Button size="lg" variant="secondary" className="button-lift">
                Rechercher un réparateur
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

export default TabletRepairPage;

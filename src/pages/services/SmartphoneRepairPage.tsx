import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, CheckCircle, Shield, Clock, Star, ArrowRight, Battery, Monitor, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const SmartphoneRepairPage = () => {
  const commonIssues = [
    { icon: Monitor, title: 'Écran cassé', description: 'Remplacement d\'écran LCD, OLED ou vitre tactile' },
    { icon: Battery, title: 'Batterie défaillante', description: 'Changement de batterie pour autonomie maximale' },
    { icon: Camera, title: 'Caméra défectueuse', description: 'Réparation caméra avant/arrière' },
    { icon: Smartphone, title: 'Problème de charge', description: 'Réparation port USB, connecteur Lightning' }
  ];

  const brands = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'OnePlus', 'Google', 'Oppo', 'Realme'];

  return (
    <>
      <Helmet>
        <title>Réparation Smartphone - Trouvez un Réparateur Près de Chez Vous | TopRéparateurs</title>
        <meta name="description" content="Réparation smartphone rapide et professionnelle. Écran cassé, batterie, caméra... Trouvez un réparateur certifié près de chez vous. Devis gratuit en ligne." />
        <meta name="keywords" content="réparation smartphone, écran cassé, batterie smartphone, réparateur iPhone, réparateur Samsung, réparation téléphone" />
        <link rel="canonical" href="https://topreparateurs.fr/reparation-smartphone" />
      </Helmet>

      <Navigation />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Badge variant="premium" className="mb-4">
                <Smartphone className="h-3 w-3 mr-1" />
                Service Professionnel
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Réparation Smartphone Rapide et Fiable
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Trouvez le meilleur réparateur près de chez vous. Devis gratuit, intervention rapide, garantie incluse.
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
                    Demander un devis gratuit
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto"
            >
              {[
                { icon: Shield, label: 'Réparateurs Certifiés', value: '5000+' },
                { icon: Star, label: 'Note Moyenne', value: '4.8/5' },
                { icon: Clock, label: 'Réparation Rapide', value: '< 1h' },
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
              <h2 className="text-3xl font-bold mb-4">Problèmes les Plus Courants</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Nos réparateurs experts interviennent sur tous types de pannes smartphones
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
              <h2 className="text-3xl font-bold mb-4">Toutes Marques Réparées</h2>
              <p className="text-muted-foreground">
                Nos réparateurs interviennent sur toutes les marques de smartphones
              </p>
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

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Besoin d'une Réparation ?</h2>
            <p className="text-xl mb-8 opacity-90">
              Trouvez un réparateur près de chez vous en quelques clics
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button size="lg" variant="secondary" className="button-lift">
                  Rechercher un réparateur
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/quotes-appointments">
                <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white">
                  Demander un devis
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default SmartphoneRepairPage;

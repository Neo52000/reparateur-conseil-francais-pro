import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Users, Wrench, Smartphone, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import RepairerAuthForm from '@/components/RepairerAuthForm';
import { Helmet } from 'react-helmet-async';

const RepairerAuthPage = () => {
  return (
    <>
      <Helmet>
        <title>Inscription Réparateur - TopRéparateurs.fr</title>
        <meta 
          name="description" 
          content="Rejoignez le réseau TopRéparateurs.fr et développez votre activité de réparation. Inscription gratuite, outils professionnels inclus." 
        />
        <meta name="keywords" content="inscription réparateur, devenir réparateur, TopRéparateurs, réseau réparation" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            
            {/* Section informative */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Devenez 
                  <span className="text-orange-600"> Réparateur</span>
                  <br />
                  Professionnel
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  Rejoignez le plus grand réseau de réparateurs en France et développez votre activité
                </p>
              </div>

              {/* Avantages */}
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800">
                    <Star className="h-5 w-5 mr-2" />
                    Pourquoi nous rejoindre ?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Plus de clients</h3>
                      <p className="text-gray-600 text-sm">Accédez à des milliers de demandes de réparation chaque mois</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Outils professionnels</h3>
                      <p className="text-gray-600 text-sm">Système POS, gestion de stock, facturation automatique</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Formation continue</h3>
                      <p className="text-gray-600 text-sm">Accès aux dernières techniques et certifications du secteur</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Support dédié</h3>
                      <p className="text-gray-600 text-sm">Équipe d'accompagnement disponible 6j/7</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="text-center p-4">
                  <div className="flex flex-col items-center">
                    <Users className="h-8 w-8 text-orange-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">2K+</div>
                    <div className="text-sm text-gray-600">Réparateurs</div>
                  </div>
                </Card>
                
                <Card className="text-center p-4">
                  <div className="flex flex-col items-center">
                    <Wrench className="h-8 w-8 text-orange-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">50K+</div>
                    <div className="text-sm text-gray-600">Réparations</div>
                  </div>
                </Card>
                
                <Card className="text-center p-4">
                  <div className="flex flex-col items-center">
                    <Smartphone className="h-8 w-8 text-orange-600 mb-2" />
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-sm text-gray-600">Satisfaction</div>
                  </div>
                </Card>
              </div>

              {/* CTA alternatif */}
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-orange-800 mb-1">
                        Déjà réparateur professionnel ?
                      </h3>
                      <p className="text-orange-700 text-sm">
                        Découvrez nos plans tarifaires et services premium
                      </p>
                    </div>
                    <Link to="/repairer/plans">
                      <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                        Voir les plans
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire d'inscription */}
            <div className="flex flex-col justify-center">
              <RepairerAuthForm />
              
              <div className="mt-6 text-center text-sm text-gray-600">
                En vous inscrivant, vous acceptez nos{' '}
                <Link to="/conditions-generales" className="text-orange-600 hover:underline">
                  conditions générales
                </Link>{' '}
                et notre{' '}
                <Link to="/politique-confidentialite" className="text-orange-600 hover:underline">
                  politique de confidentialité
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default RepairerAuthPage;
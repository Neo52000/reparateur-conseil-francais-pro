import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield, Clock, MapPin, User, ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ClientAuthForm from '@/components/ClientAuthForm';
import { Helmet } from 'react-helmet-async';

const ClientAuthPage = () => {
  return (
    <>
      <Helmet>
        <title>Connexion Client - TopRéparateurs.fr</title>
        <meta 
          name="description" 
          content="Connectez-vous à votre espace client TopRéparateurs.fr pour suivre vos réparations et gérer vos demandes." 
        />
        <meta name="keywords" content="connexion client, espace client, TopRéparateurs, suivi réparation" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            
            {/* Section informative */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Votre espace
                  <span className="text-blue-600"> Client</span>
                  <br />
                  personnalisé
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  Accédez à votre tableau de bord pour gérer vos réparations en toute simplicité
                </p>
              </div>

              {/* Avantages */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <User className="h-5 w-5 mr-2" />
                    Votre espace client vous permet de :
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Suivre vos réparations</h3>
                      <p className="text-gray-600 text-sm">Suivez en temps réel l'avancement de vos réparations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Gérer vos devis</h3>
                      <p className="text-gray-600 text-sm">Recevez et validez vos devis directement en ligne</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Historique complet</h3>
                      <p className="text-gray-600 text-sm">Consultez l'historique de toutes vos réparations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Support prioritaire</h3>
                      <p className="text-gray-600 text-sm">Bénéficiez d'un support client dédié et réactif</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fonctionnalités */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="text-center p-4">
                  <div className="flex flex-col items-center">
                    <Clock className="h-8 w-8 text-blue-600 mb-2" />
                    <div className="text-sm font-semibold text-gray-900">Suivi temps réel</div>
                    <div className="text-xs text-gray-600">24h/24</div>
                  </div>
                </Card>
                
                <Card className="text-center p-4">
                  <div className="flex flex-col items-center">
                    <Shield className="h-8 w-8 text-blue-600 mb-2" />
                    <div className="text-sm font-semibold text-gray-900">Sécurisé</div>
                    <div className="text-xs text-gray-600">Données protégées</div>
                  </div>
                </Card>
                
                <Card className="text-center p-4">
                  <div className="flex flex-col items-center">
                    <MapPin className="h-8 w-8 text-blue-600 mb-2" />
                    <div className="text-sm font-semibold text-gray-900">Proximité</div>
                    <div className="text-xs text-gray-600">Partout en France</div>
                  </div>
                </Card>
                
                <Card className="text-center p-4">
                  <div className="flex flex-col items-center">
                    <CheckCircle className="h-8 w-8 text-blue-600 mb-2" />
                    <div className="text-sm font-semibold text-gray-900">Garantie</div>
                    <div className="text-xs text-gray-600">Service inclus</div>
                  </div>
                </Card>
              </div>

              {/* CTA alternatif */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-1">
                        Première visite ?
                      </h3>
                      <p className="text-blue-700 text-sm">
                        Découvrez comment trouver le meilleur réparateur près de chez vous
                      </p>
                    </div>
                    <Link to="/">
                      <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                        Rechercher
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire de connexion */}
            <div className="flex flex-col justify-center">
              <ClientAuthForm />
              
              <div className="mt-6 text-center text-sm text-gray-600">
                En vous connectant, vous acceptez nos{' '}
                <Link to="/conditions-generales" className="text-blue-600 hover:underline">
                  conditions générales
                </Link>{' '}
                et notre{' '}
                <Link to="/politique-confidentialite" className="text-blue-600 hover:underline">
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

export default ClientAuthPage;
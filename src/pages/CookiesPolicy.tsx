
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cookie } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const CookiesPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="bg-orange-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Cookie className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Politique des cookies</h1>
                <p className="text-orange-100 mt-2">Comment nous utilisons les cookies sur TopRéparateurs.fr</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <h2 className="font-semibold text-orange-900 mb-2">Qu'est-ce qu'un cookie ?</h2>
              <p className="text-orange-800">
                Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web. 
                Il permet au site de se souvenir de vos actions et préférences pendant une période donnée.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Types de cookies utilisés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Cookies essentiels</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Ces cookies sont nécessaires au bon fonctionnement du site et ne peuvent pas être désactivés.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Authentification et sécurité</li>
                      <li>• Panier d'achat et préférences</li>
                      <li>• Navigation et accessibilité</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Cookies de performance</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Ces cookies nous aident à améliorer les performances du site en collectant des informations anonymes.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Analyse du trafic et utilisation</li>
                      <li>• Temps de chargement des pages</li>
                      <li>• Erreurs techniques</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Cookies fonctionnels</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Ces cookies permettent d'améliorer votre expérience utilisateur.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Mémorisation de vos préférences</li>
                      <li>• Géolocalisation pour les services locaux</li>
                      <li>• Personnalisation de l'interface</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Durée de conservation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Cookies de session</span>
                    <span className="text-sm text-gray-600">Supprimés à la fermeture du navigateur</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Cookies persistants</span>
                    <span className="text-sm text-gray-600">Conservés jusqu'à 12 mois maximum</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Cookies d'authentification</span>
                    <span className="text-sm text-gray-600">Configurables par l'utilisateur</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Gestion de vos préférences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Vous pouvez gérer vos préférences de cookies de plusieurs façons :
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Via notre bandeau de cookies</h4>
                    <p className="text-sm text-blue-800">
                      Lors de votre première visite, un bandeau vous permet de choisir quels cookies accepter.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Dans les paramètres de votre navigateur</h4>
                    <p className="text-sm text-green-800">
                      Vous pouvez bloquer ou supprimer les cookies directement dans votre navigateur.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                  Cookies tiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Certains services tiers peuvent déposer des cookies sur notre site :
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Google Maps</span>
                    <span className="text-sm text-gray-600">Cartes et géolocalisation</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span>Supabase</span>
                    <span className="text-sm text-gray-600">Base de données et authentification</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                  Impact du refus des cookies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-yellow-800 mb-3">
                    <strong>Important :</strong> Le refus de certains cookies peut affecter votre expérience :
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Nécessité de vous reconnecter à chaque visite</li>
                    <li>• Perte de vos préférences personnalisées</li>
                    <li>• Fonctionnalités de géolocalisation indisponibles</li>
                    <li>• Impossible d'utiliser certains services</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                  Contact et modifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    Pour toute question concernant notre politique des cookies :
                  </p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">
                      <strong>Email :</strong> contact@topreparateurs.fr
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Cette politique peut être modifiée à tout moment. 
                    La version actuelle est disponible sur cette page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CookiesPolicy;

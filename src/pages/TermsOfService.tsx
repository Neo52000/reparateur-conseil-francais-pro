
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const TermsOfService = () => {
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
              <FileText className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Conditions générales d'utilisation</h1>
                <p className="text-orange-100 mt-2">TopRéparateurs.fr - Règles d'utilisation de la plateforme</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Objet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Les présentes CGU définissent les règles d'utilisation du site topreparateurs.fr, 
                  qui met en relation des réparateurs professionnels et des clients.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Acceptation des conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  L'utilisation du site implique l'acceptation pleine et entière des présentes CGU.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Accès au service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>L'accès au service est réservé aux personnes majeures et aux professionnels du secteur de la réparation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>La création d'un compte est nécessaire pour accéder à certaines fonctionnalités.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                  Obligations des utilisateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>Fournir des informations exactes lors de l'inscription</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>Respecter la législation en vigueur</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>Ne pas utiliser le site à des fins frauduleuses ou illicites</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>Respecter les autres utilisateurs et les règles de la plateforme</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                  Responsabilité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>
                      TopRéparateurs s'efforce d'assurer la disponibilité du site, mais ne peut être tenue responsable 
                      des interruptions ou dysfonctionnements.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>
                      TopRéparateurs n'est pas partie aux contrats conclus entre réparateurs et clients et décline 
                      toute responsabilité en cas de litige.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                  Propriété intellectuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Tous les contenus du site (textes, images, logos, etc.) sont protégés par le droit d'auteur. 
                  Toute reproduction est interdite sans autorisation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</span>
                  Données personnelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  La collecte et le traitement des données personnelles sont détaillés dans la politique de confidentialité.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">8</span>
                  Résiliation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Chaque utilisateur peut résilier son compte à tout moment via son espace personnel ou en contactant le support.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">9</span>
                  Modifications des CGU
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  TopRéparateurs se réserve le droit de modifier les CGU à tout moment. 
                  Les utilisateurs seront informés des modifications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">10</span>
                  Loi applicable et juridiction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>Les présentes CGU sont soumises au droit français.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600">•</span>
                    <span>
                      En cas de litige, les tribunaux compétents seront ceux du ressort du siège de TopRéparateurs.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;

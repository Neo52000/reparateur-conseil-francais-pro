
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
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
          <div className="bg-blue-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
                <p className="text-blue-100 mt-2">TopRéparateurs.fr - Protection de vos données personnelles</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h2 className="font-semibold text-blue-900 mb-2">Préambule</h2>
              <p className="text-blue-800">
                La présente politique de confidentialité a pour objectif d'informer les utilisateurs du site topreparateurs.fr 
                sur la collecte, l'utilisation et la protection de leurs données personnelles, conformément au Règlement Général 
                sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Identité du responsable du traitement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>TopRéparateurs.fr - M REINE Elie</strong></p>
                  <p>Adresse : 10 rue toupot de Beveaux - 52000 CHAUMONT</p>
                  <p className="flex items-center gap-2 mt-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Contact : contact@topreparateurs.fr
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Nature des données collectées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Nous collectons les données suivantes :</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Données d'identification (nom, prénom, adresse email, téléphone)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Données professionnelles (activité, spécialité, zone d'intervention)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Données de connexion (adresse IP, logs, cookies)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Finalités de la collecte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Les données sont collectées pour les finalités suivantes :</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Création et gestion de compte utilisateur</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Mise en relation entre réparateurs et clients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Gestion des demandes et du support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Amélioration du service et statistiques</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Respect des obligations légales</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                  Base légale du traitement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Le traitement des données repose sur :</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>L'exécution d'un contrat (inscription, utilisation du service)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Le consentement de l'utilisateur</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Le respect d'obligations légales</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                  Caractère obligatoire ou facultatif des données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Certaines données sont obligatoires pour accéder au service (signalées par un astérisque dans les formulaires). 
                  Les autres sont facultatives.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                  Destinataires des données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Les données collectées sont destinées à :</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>L'équipe de TopRéparateurs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Les prestataires techniques (hébergement, maintenance)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Les clients ou réparateurs dans le cadre de la mise en relation</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-600 italic">
                  Aucune donnée n'est cédée à des tiers à des fins commerciales.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</span>
                  Durée de conservation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Les données sont conservées :</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Aussi longtemps que nécessaire pour la gestion du compte</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Jusqu'à la suppression du compte ou selon les délais légaux applicables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Les logs de connexion sont conservés 12 mois maximum</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">8</span>
                  Droits des utilisateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Vous disposez des droits suivants :</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Droit d'accès, de rectification, d'effacement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Droit à la limitation et à l'opposition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Droit à la portabilité</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Droit d'introduire une réclamation auprès de la CNIL</span>
                  </li>
                </ul>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm">
                    <strong>Pour exercer vos droits :</strong> contact@topreparateurs.fr
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">9</span>
                  Sécurité des données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées pour garantir 
                  la sécurité et la confidentialité de vos données.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">10</span>
                  Cookies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Le site utilise des cookies pour améliorer l'expérience utilisateur et réaliser des statistiques. 
                  Vous pouvez gérer vos préférences via le bandeau cookies.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">11</span>
                  Modifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  La présente politique peut être modifiée à tout moment. Les utilisateurs seront informés des changements importants.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">12</span>
                  Réclamation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  En cas de litige, vous pouvez contacter la CNIL (
                  <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    www.cnil.fr
                  </a>
                  ).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

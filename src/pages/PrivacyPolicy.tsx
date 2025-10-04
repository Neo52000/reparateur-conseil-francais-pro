import { Helmet } from 'react-helmet-async';
import { Shield, Eye, Lock, Database, Cookie, UserCheck, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Politique de Confidentialité | TopRéparateurs.fr</title>
        <meta 
          name="description" 
          content="Politique de confidentialité et protection des données personnelles de TopRéparateurs.fr. Conformité RGPD." 
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Politique de Confidentialité</h1>
            <p className="text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          <section className="bg-card p-6 rounded-lg border mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  TopRéparateurs.fr, accessible à l'adresse www.topreparateurs.fr, s'engage à protéger 
                  la vie privée de ses utilisateurs. Cette politique de confidentialité explique comment 
                  nous collectons, utilisons, partageons et protégeons vos données personnelles conformément 
                  au Règlement Général sur la Protection des Données (RGPD).
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Database className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">2. Données collectées</h2>
                <p className="text-muted-foreground mb-4">
                  Nous collectons les données suivantes :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Données d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
                  <li><strong>Données de localisation :</strong> ville, code postal (pour la recherche de réparateurs)</li>
                  <li><strong>Données de connexion :</strong> adresse IP, logs de connexion, données de navigation</li>
                  <li><strong>Données professionnelles (réparateurs) :</strong> SIRET, qualifications, certifications</li>
                  <li><strong>Données transactionnelles :</strong> historique des devis et réparations</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Eye className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">3. Utilisation des données</h2>
                <p className="text-muted-foreground mb-4">
                  Vos données sont utilisées pour :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Gérer votre compte et authentification</li>
                  <li>Mettre en relation clients et réparateurs</li>
                  <li>Traiter les demandes de devis et réparations</li>
                  <li>Améliorer nos services et votre expérience utilisateur</li>
                  <li>Vous envoyer des communications importantes (avec votre consentement)</li>
                  <li>Assurer la sécurité de la plateforme et prévenir la fraude</li>
                  <li>Respecter nos obligations légales</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Lock className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">4. Base légale du traitement</h2>
                <p className="text-muted-foreground mb-4">
                  Le traitement de vos données repose sur :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Exécution du contrat :</strong> pour fournir nos services</li>
                  <li><strong>Consentement :</strong> pour les communications marketing</li>
                  <li><strong>Intérêt légitime :</strong> pour améliorer nos services</li>
                  <li><strong>Obligation légale :</strong> pour respecter la réglementation</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border mb-6">
            <div className="flex items-start gap-3 mb-4">
              <UserCheck className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">5. Partage des données</h2>
                <p className="text-muted-foreground mb-4">
                  Vos données peuvent être partagées avec :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Réparateurs :</strong> informations nécessaires pour le service</li>
                  <li><strong>Prestataires techniques :</strong> hébergement, maintenance (Supabase, Lovable)</li>
                  <li><strong>Autorités légales :</strong> sur demande légale ou judiciaire</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Nous ne vendons jamais vos données personnelles à des tiers.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Cookie className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">6. Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  Nous utilisons des cookies pour :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
                  <li><strong>Cookies de performance :</strong> analyse de l'utilisation</li>
                  <li><strong>Cookies fonctionnels :</strong> mémorisation de vos préférences</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">7. Vos droits RGPD</h2>
                <p className="text-muted-foreground mb-4">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                  <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                  <li><strong>Droit à l'effacement :</strong> supprimer vos données ("droit à l'oubli")</li>
                  <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
                  <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                  <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                  <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Pour exercer vos droits, contactez-nous à : <strong>contact@topreparateurs.fr</strong>
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Lock className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">8. Sécurité des données</h2>
                <p className="text-muted-foreground">
                  Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour 
                  protéger vos données contre tout accès, modification, divulgation ou destruction non autorisés :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-4">
                  <li>Chiffrement SSL/TLS pour les transmissions</li>
                  <li>Authentification sécurisée (JWT, bcrypt)</li>
                  <li>Hébergement sécurisé sur des serveurs européens</li>
                  <li>Sauvegardes régulières</li>
                  <li>Accès limité aux données par des personnes autorisées</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Database className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">9. Conservation des données</h2>
                <p className="text-muted-foreground">
                  Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles 
                  elles sont traitées :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-4">
                  <li><strong>Compte actif :</strong> pendant toute la durée d'utilisation du service</li>
                  <li><strong>Compte inactif :</strong> suppression après 3 ans d'inactivité</li>
                  <li><strong>Données transactionnelles :</strong> 10 ans (obligation légale comptable)</li>
                  <li><strong>Logs de connexion :</strong> 12 mois maximum</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">10. Contact et réclamations</h2>
                <p className="text-muted-foreground mb-4">
                  Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits :
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="font-semibold">TopRéparateurs.fr</p>
                  <p className="text-muted-foreground">Email : <a href="mailto:contact@topreparateurs.fr" className="text-primary hover:underline">contact@topreparateurs.fr</a></p>
                  <p className="text-muted-foreground">Téléphone : 07 45 06 21 62</p>
                </div>
                <p className="text-muted-foreground mt-4">
                  Vous avez également le droit de déposer une réclamation auprès de la CNIL 
                  (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">11. Modifications</h2>
                <p className="text-muted-foreground">
                  Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
                  Les modifications prennent effet dès leur publication sur cette page. La date de dernière 
                  mise à jour est indiquée en haut de cette page. Nous vous encourageons à consulter 
                  régulièrement cette politique.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;

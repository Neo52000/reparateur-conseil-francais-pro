import { Helmet } from 'react-helmet-async';
import { ShoppingCart, CreditCard, Package, RefreshCw } from 'lucide-react';

const TermsOfSale = () => {
  return (
    <>
      <Helmet>
        <title>Conditions Générales de Vente | TopRéparateurs.fr</title>
        <meta name="description" content="Conditions générales de vente des abonnements et services TopRéparateurs.fr" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Conditions Générales de Vente</h1>

          <div className="space-y-8">
            {/* Préambule */}
            <section className="bg-card p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">1. Préambule</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Les présentes Conditions Générales de Vente (CGV) régissent la vente des abonnements et services payants 
                  proposés par TopRéparateurs.fr aux professionnels de la réparation.
                </p>
                <p>
                  Ces CGV s'appliquent exclusivement aux relations commerciales entre TopRéparateurs.fr et les Réparateurs 
                  souscrivant à un abonnement payant.
                </p>
                <p>
                  Les présentes CGV sont complémentaires aux Conditions Générales d'Utilisation de la Plateforme.
                </p>
              </div>
            </section>

            {/* Offres et tarifs */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">2. Offres et tarifs</h2>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="font-semibold text-lg mt-4">2.1 Abonnements proposés</h3>
                <p>
                  TopRéparateurs.fr propose différentes formules d'abonnement :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Gratuit :</strong> Accès basique à la plateforme (0€/mois)</li>
                  <li><strong>Basic :</strong> Fonctionnalités essentielles (9,90€/mois ou 99€/an)</li>
                  <li><strong>Pro :</strong> Fonctionnalités avancées (19,90€/mois ou 199€/an)</li>
                  <li><strong>Premium :</strong> Fonctionnalités complètes (39,90€/mois ou 399€/an)</li>
                  <li><strong>Enterprise :</strong> Solution sur mesure (99,90€/mois ou 999€/an)</li>
                </ul>

                <h3 className="font-semibold text-lg mt-4">2.2 Modules complémentaires</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Module POS (Point de Vente) :</strong> 49,90€/mois ou 499€/an</li>
                  <li><strong>Module E-commerce :</strong> 89€/mois ou 890€/an</li>
                </ul>

                <h3 className="font-semibold text-lg mt-4">2.3 Tarifs</h3>
                <p>
                  Les prix sont indiqués en euros (€) Hors Taxes (HT). La TVA française au taux en vigueur (20%) 
                  sera ajoutée au montant HT pour les clients établis en France.
                </p>
                <p>
                  TopRéparateurs.fr se réserve le droit de modifier ses tarifs à tout moment. Les nouveaux tarifs 
                  ne s'appliqueront pas aux abonnements en cours et prendront effet uniquement lors du renouvellement.
                </p>
              </div>
            </section>

            {/* Commande et souscription */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">3. Commande et souscription</h2>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="font-semibold text-lg mt-4">3.1 Processus de souscription</h3>
                <p>
                  La souscription s'effectue en ligne via l'espace professionnel du Réparateur. 
                  Le processus comprend les étapes suivantes :
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Sélection de la formule d'abonnement et des options</li>
                  <li>Récapitulatif de la commande et du prix total TTC</li>
                  <li>Acceptation des présentes CGV</li>
                  <li>Saisie des informations de paiement</li>
                  <li>Validation et paiement de la commande</li>
                  <li>Confirmation par email</li>
                </ol>

                <h3 className="font-semibold text-lg mt-4">3.2 Validation de la commande</h3>
                <p>
                  La commande est considérée comme validée après réception du paiement et envoi d'un email de confirmation. 
                  Le Réparateur recevra une facture conforme à la réglementation en vigueur.
                </p>
              </div>
            </section>

            {/* Paiement */}
            <section className="bg-card p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">4. Modalités de paiement</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="font-semibold text-lg mt-4">4.1 Moyens de paiement acceptés</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Carte bancaire (Visa, Mastercard, American Express)</li>
                  <li>Prélèvement SEPA (pour abonnements mensuels)</li>
                  <li>Virement bancaire (pour abonnements annuels)</li>
                </ul>

                <h3 className="font-semibold text-lg mt-4">4.2 Sécurité des paiements</h3>
                <p>
                  Les paiements sont sécurisés par notre prestataire de paiement certifié PCI-DSS. 
                  TopRéparateurs.fr ne conserve aucune donnée bancaire complète.
                </p>

                <h3 className="font-semibold text-lg mt-4">4.3 Facturation</h3>
                <p>
                  Les abonnements mensuels sont facturés le même jour chaque mois. 
                  Les abonnements annuels sont facturés en une seule fois.
                </p>
                <p>
                  Les factures sont disponibles en téléchargement dans l'espace professionnel et envoyées par email.
                </p>

                <h3 className="font-semibold text-lg mt-4">4.4 Retard ou défaut de paiement</h3>
                <p>
                  En cas de défaut de paiement, l'accès aux services sera suspendu après un délai de 7 jours. 
                  Des pénalités de retard au taux de 3 fois le taux d'intérêt légal pourront être appliquées, 
                  ainsi qu'une indemnité forfaitaire de 40€ pour frais de recouvrement.
                </p>
              </div>
            </section>

            {/* Durée et renouvellement */}
            <section className="bg-card p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">5. Durée et renouvellement</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="font-semibold text-lg mt-4">5.1 Durée d'engagement</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Abonnement mensuel :</strong> Sans engagement, tacitement reconductible chaque mois</li>
                  <li><strong>Abonnement annuel :</strong> Engagement de 12 mois, tacitement reconductible pour 12 mois</li>
                </ul>

                <h3 className="font-semibold text-lg mt-4">5.2 Renouvellement automatique</h3>
                <p>
                  Les abonnements sont renouvelés automatiquement sauf résiliation par le Réparateur. 
                  Un email de rappel est envoyé 7 jours avant le renouvellement.
                </p>

                <h3 className="font-semibold text-lg mt-4">5.3 Modification d'abonnement</h3>
                <p>
                  Le Réparateur peut changer de formule à tout moment :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Upgrade :</strong> Effet immédiat, proratisation au prochain cycle de facturation</li>
                  <li><strong>Downgrade :</strong> Prise d'effet à la fin de la période en cours</li>
                </ul>
              </div>
            </section>

            {/* Résiliation */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">6. Résiliation</h2>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="font-semibold text-lg mt-4">6.1 Résiliation par le Réparateur</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Abonnement mensuel :</strong> Résiliable à tout moment, effet immédiat ou à la fin du mois en cours selon le choix</li>
                  <li><strong>Abonnement annuel :</strong> Résiliable avec préavis de 30 jours avant la date d'échéance annuelle</li>
                </ul>
                <p>
                  La résiliation s'effectue depuis l'espace professionnel ou par email à : abonnement@topreparateurs.fr
                </p>
                <p className="text-amber-600 font-semibold">
                  Aucun remboursement ne sera effectué pour la période en cours, sauf en cas d'exercice du droit 
                  de rétractation (voir article 7).
                </p>

                <h3 className="font-semibold text-lg mt-4">6.2 Résiliation par TopRéparateurs.fr</h3>
                <p>
                  TopRéparateurs.fr peut résilier l'abonnement en cas de :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violation des CGU ou CGV</li>
                  <li>Défaut de paiement persistant</li>
                  <li>Comportement frauduleux ou abusif</li>
                  <li>Cessation d'activité du Réparateur</li>
                </ul>
                <p>
                  La résiliation sera notifiée par email avec un préavis de 15 jours, sauf cas de fraude avérée.
                </p>

                <h3 className="font-semibold text-lg mt-4">6.3 Conséquences de la résiliation</h3>
                <p>
                  À l'issue de la résiliation :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>L'accès aux fonctionnalités payantes est immédiatement suspendu</li>
                  <li>Le profil reste visible en version gratuite (si applicable)</li>
                  <li>Les données sont conservées conformément à notre politique de confidentialité</li>
                  <li>Le Réparateur peut exporter ses données pendant 30 jours</li>
                </ul>
              </div>
            </section>

            {/* Droit de rétractation */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">7. Droit de rétractation</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Conformément au Code de la consommation, le Réparateur professionnel ne bénéficie pas du droit 
                  de rétractation de 14 jours (article L221-3 du Code de la consommation).
                </p>
                <p>
                  Toutefois, TopRéparateurs.fr accorde une période de garantie satisfait ou remboursé de 14 jours 
                  à compter de la souscription :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Pour les nouveaux clients uniquement</li>
                  <li>Remboursement intégral sans justification</li>
                  <li>Demande à effectuer par email : remboursement@topreparateurs.fr</li>
                  <li>Traitement sous 7 jours ouvrés</li>
                </ul>
              </div>
            </section>

            {/* Livraison et exécution */}
            <section className="bg-card p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">8. Livraison et exécution du service</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Les services sont activés immédiatement après validation du paiement. 
                  Le Réparateur reçoit un email de confirmation avec ses accès.
                </p>
                <p>
                  En cas de difficulté technique, le support est disponible par email : support@topreparateurs.fr 
                  (délai de réponse : 24h ouvrées).
                </p>
              </div>
            </section>

            {/* Garanties et responsabilité */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">9. Garanties et responsabilité</h2>
              <div className="space-y-3 text-muted-foreground">
                <h3 className="font-semibold text-lg mt-4">9.1 Disponibilité du service</h3>
                <p>
                  TopRéparateurs.fr s'engage à assurer une disponibilité du service de 99,5% sur une base mensuelle, 
                  hors opérations de maintenance planifiées.
                </p>

                <h3 className="font-semibold text-lg mt-4">9.2 Limitations de responsabilité</h3>
                <p>
                  La responsabilité de TopRéparateurs.fr ne peut être engagée que pour les dommages directs 
                  et prévisibles résultant d'un manquement contractuel avéré. Le montant des dommages et intérêts 
                  ne pourra excéder le montant de l'abonnement annuel.
                </p>

                <h3 className="font-semibold text-lg mt-4">9.3 Force majeure</h3>
                <p>
                  TopRéparateurs.fr ne pourra être tenu responsable de tout retard ou inexécution dû à un cas 
                  de force majeure tel que défini par la jurisprudence française.
                </p>
              </div>
            </section>

            {/* Propriété intellectuelle */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">10. Propriété intellectuelle</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  L'abonnement confère au Réparateur un droit d'utilisation personnel, non exclusif et non cessible 
                  des fonctionnalités de la Plateforme.
                </p>
                <p>
                  Le Réparateur s'interdit toute reproduction, représentation, modification ou exploitation commerciale 
                  des éléments de la Plateforme en dehors de l'usage normal du service.
                </p>
              </div>
            </section>

            {/* Données personnelles */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">11. Données personnelles</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Le traitement des données personnelles et professionnelles est effectué conformément au RGPD 
                  et à notre <a href="/privacy" className="text-primary hover:underline">Politique de confidentialité</a>.
                </p>
                <p>
                  Les données de facturation sont conservées pendant 10 ans conformément aux obligations comptables.
                </p>
              </div>
            </section>

            {/* Modification des CGV */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">12. Modification des CGV</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  TopRéparateurs.fr se réserve le droit de modifier les présentes CGV à tout moment. 
                  Les Réparateurs seront informés par email au moins 30 jours avant l'entrée en vigueur 
                  des nouvelles CGV.
                </p>
                <p>
                  Les modifications ne s'appliqueront qu'aux abonnements souscrits ou renouvelés après 
                  leur date d'entrée en vigueur.
                </p>
              </div>
            </section>

            {/* Droit applicable */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">13. Droit applicable et litiges</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Les présentes CGV sont régies par le droit français.
                </p>
                <p>
                  En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. 
                  À défaut d'accord, le litige sera porté devant les tribunaux compétents de Paris.
                </p>
                <p>
                  Conformément à la réglementation, le Réparateur peut recourir à un médiateur de la consommation 
                  agréé en cas de litige.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">14. Contact</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  Pour toute question relative aux présentes CGV ou à votre abonnement :
                </p>
                <p>
                  <strong>Service commercial :</strong> 
                  <a href="mailto:commercial@topreparateurs.fr" className="text-primary hover:underline ml-1">
                    commercial@topreparateurs.fr
                  </a>
                </p>
                <p>
                  <strong>Service abonnements :</strong> 
                  <a href="mailto:abonnement@topreparateurs.fr" className="text-primary hover:underline ml-1">
                    abonnement@topreparateurs.fr
                  </a>
                </p>
                <p>
                  <strong>Service facturation :</strong> 
                  <a href="mailto:facturation@topreparateurs.fr" className="text-primary hover:underline ml-1">
                    facturation@topreparateurs.fr
                  </a>
                </p>
              </div>
            </section>

            {/* Date de mise à jour */}
            <section className="text-center text-sm text-muted-foreground mt-8">
              <p>Date d'entrée en vigueur : {new Date().toLocaleDateString('fr-FR')}</p>
              <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfSale;

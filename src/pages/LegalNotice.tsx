import { Helmet } from 'react-helmet-async';
import { Building2, Mail, Phone, FileText, Shield } from 'lucide-react';

const LegalNotice = () => {
  return (
    <>
      <Helmet>
        <title>Mentions Légales | TopRéparateurs.fr</title>
        <meta name="description" content="Mentions légales et informations légales de TopRéparateurs.fr" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Mentions Légales</h1>

          <div className="space-y-8">
            {/* Éditeur du site */}
            <section className="bg-card p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Éditeur du site</h2>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Raison sociale :</strong> TopRéparateurs.fr</p>
                <p><strong>Forme juridique :</strong> SAS (Société par Actions Simplifiée)</p>
                <p><strong>Capital social :</strong> 10 000 €</p>
                <p><strong>SIRET :</strong> XXX XXX XXX XXXXX</p>
                <p><strong>RCS :</strong> Paris XXX XXX XXX</p>
                <p><strong>TVA intracommunautaire :</strong> FR XX XXXXXXXXX</p>
                <p><strong>Siège social :</strong> [Adresse à compléter]</p>
              </div>
            </section>

            {/* Directeur de publication */}
            <section className="bg-card p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Directeur de publication</h2>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Nom :</strong> [Nom du directeur de publication]</p>
                <p><strong>Fonction :</strong> Président</p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-card p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Contact</h2>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:contact@topreparateurs.fr" className="text-primary hover:underline">
                    contact@topreparateurs.fr
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+33XXXXXXXXX" className="text-primary hover:underline">
                    +33 (0)X XX XX XX XX
                  </a>
                </p>
              </div>
            </section>

            {/* Hébergement */}
            <section className="bg-card p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Hébergement</h2>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Hébergeur :</strong> Supabase Inc.</p>
                <p><strong>Adresse :</strong> 970 Toa Payoh North, #07-04, Singapore 318992</p>
                <p><strong>Site web :</strong> <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com</a></p>
                
                <div className="mt-4">
                  <p className="font-semibold mb-2">Infrastructure Lovable :</p>
                  <p><strong>Plateforme de développement :</strong> Lovable (GPT Vibe Inc.)</p>
                  <p><strong>Adresse :</strong> 340 S Lemon Ave, Walnut, CA 91789, États-Unis</p>
                  <p><strong>Site web :</strong> <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">lovable.dev</a></p>
                </div>
              </div>
            </section>

            {/* Propriété intellectuelle */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">Propriété intellectuelle</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  L'ensemble du contenu du site TopRéparateurs.fr (structure, textes, graphismes, logos, icônes, sons, logiciels, etc.) 
                  est la propriété exclusive de TopRéparateurs.fr ou de ses partenaires, à l'exception des marques, logos ou contenus 
                  appartenant à d'autres sociétés partenaires ou auteurs.
                </p>
                <p>
                  Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle du site 
                  ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit est interdite sans l'autorisation 
                  écrite préalable de TopRéparateurs.fr.
                </p>
                <p>
                  Les marques et logos des réparateurs référencés sont la propriété de leurs titulaires respectifs.
                </p>
              </div>
            </section>

            {/* CNIL */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">Protection des données personnelles</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, 
                  TopRéparateurs.fr s'engage à protéger la vie privée de ses utilisateurs.
                </p>
                <p>
                  <strong>Responsable du traitement :</strong> TopRéparateurs.fr
                </p>
                <p>
                  <strong>Délégué à la protection des données (DPO) :</strong> dpo@topreparateurs.fr
                </p>
                <p>
                  Pour plus d'informations sur le traitement de vos données personnelles, consultez notre 
                  <a href="/privacy" className="text-primary hover:underline ml-1">Politique de confidentialité</a>.
                </p>
                <p>
                  Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles. 
                  Pour exercer ces droits, contactez-nous à : privacy@topreparateurs.fr
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Le site TopRéparateurs.fr utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. 
                  Vous pouvez gérer vos préférences de cookies via le bandeau de consentement.
                </p>
                <p>
                  Pour plus d'informations, consultez notre 
                  <a href="/privacy" className="text-primary hover:underline ml-1">Politique de cookies</a>.
                </p>
              </div>
            </section>

            {/* Médiation */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">Médiation de la consommation</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Conformément à l'article L.616-1 du Code de la consommation, TopRéparateurs.fr propose à ses utilisateurs, 
                  dans le cadre de litiges qui n'auraient pu être résolus à l'amiable, la médiation d'un médiateur de la consommation.
                </p>
                <p>
                  <strong>Médiateur de la consommation :</strong> [Nom du médiateur]
                </p>
                <p>
                  <strong>Site web :</strong> <a href="#" className="text-primary hover:underline">[URL du médiateur]</a>
                </p>
              </div>
            </section>

            {/* Droit applicable */}
            <section className="bg-card p-6 rounded-lg border">
              <h2 className="text-2xl font-semibold mb-4">Droit applicable et juridiction</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Les présentes mentions légales sont soumises au droit français. 
                  En cas de litige, et après une tentative de recherche d'une solution amiable, 
                  compétence expresse est attribuée aux tribunaux français.
                </p>
              </div>
            </section>

            {/* Date de mise à jour */}
            <section className="text-center text-sm text-muted-foreground mt-8">
              <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default LegalNotice;

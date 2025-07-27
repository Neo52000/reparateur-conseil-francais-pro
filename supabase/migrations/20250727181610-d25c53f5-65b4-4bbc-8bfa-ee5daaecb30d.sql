-- Créer la table pour les pages statiques
CREATE TABLE public.static_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tout le monde de voir les pages publiées
CREATE POLICY "Anyone can view published pages" 
ON public.static_pages 
FOR SELECT 
USING (is_published = true);

-- Politique pour permettre aux admins de gérer toutes les pages
CREATE POLICY "Admins can manage all pages" 
ON public.static_pages 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_static_pages_updated_at
BEFORE UPDATE ON public.static_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer quelques pages par défaut
INSERT INTO public.static_pages (slug, title, content, meta_title, meta_description, is_published) VALUES
('mentions-legales', 'Mentions Légales', 
'<h2>Informations légales</h2>
<h3>Éditeur du site</h3>
<p><strong>TopRéparateurs.fr</strong><br>
Plateforme de mise en relation entre particuliers et réparateurs professionnels<br>
Email : contact@topreparateurs.fr<br>
Téléphone : 07 45 06 21 62</p>

<h3>Hébergement</h3>
<p>Ce site est hébergé par :<br>
Supabase Inc.<br>
</p>

<h3>Protection des données personnelles</h3>
<p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d''un droit d''accès, de rectification, de portabilité et d''effacement de vos données ou encore de limitation du traitement. Pour exercer ces droits, contactez-nous à : contact@topreparateurs.fr</p>

<h3>Cookies</h3>
<p>Ce site utilise des cookies pour améliorer votre expérience de navigation. En continuant à utiliser ce site, vous acceptez notre utilisation des cookies.</p>',
'Mentions Légales - TopRéparateurs.fr',
'Consultez les mentions légales de TopRéparateurs.fr, plateforme de mise en relation avec des réparateurs professionnels.',
true),

('politique-confidentialite', 'Politique de Confidentialité',
'<h2>Politique de Confidentialité</h2>
<p>Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles.</p>

<h3>Données collectées</h3>
<p>Nous collectons les informations suivantes :</p>
<ul>
<li>Informations de contact (nom, email, téléphone)</li>
<li>Informations de localisation pour trouver des réparateurs près de chez vous</li>
<li>Données de navigation pour améliorer nos services</li>
</ul>

<h3>Utilisation des données</h3>
<p>Vos données sont utilisées pour :</p>
<ul>
<li>Vous mettre en relation avec des réparateurs qualifiés</li>
<li>Améliorer nos services</li>
<li>Vous envoyer des informations importantes</li>
</ul>

<h3>Protection des données</h3>
<p>Nous mettons en place des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès non autorisé, altération, divulgation ou destruction.</p>

<h3>Vos droits</h3>
<p>Vous avez le droit de :</p>
<ul>
<li>Accéder à vos données personnelles</li>
<li>Rectifier vos données</li>
<li>Supprimer vos données</li>
<li>Limiter le traitement de vos données</li>
<li>Porter vos données</li>
</ul>

<p>Pour exercer ces droits, contactez-nous à : contact@topreparateurs.fr</p>',
'Politique de Confidentialité - TopRéparateurs.fr',
'Découvrez comment TopRéparateurs.fr protège vos données personnelles et respecte votre vie privée.',
true),

('cgu', 'Conditions Générales d''Utilisation',
'<h2>Conditions Générales d''Utilisation</h2>
<p>En utilisant TopRéparateurs.fr, vous acceptez les présentes conditions générales d''utilisation.</p>

<h3>Objet</h3>
<p>TopRéparateurs.fr est une plateforme de mise en relation entre particuliers et réparateurs professionnels. Nous ne réalisons pas directement les réparations mais facilitons la mise en contact.</p>

<h3>Utilisation du service</h3>
<p>Vous vous engagez à :</p>
<ul>
<li>Fournir des informations exactes et à jour</li>
<li>Utiliser le service de manière légale et respectueuse</li>
<li>Ne pas porter atteinte à l''image de la plateforme</li>
</ul>

<h3>Responsabilités</h3>
<p>TopRéparateurs.fr met en relation les utilisateurs avec des réparateurs mais n''est pas responsable de la qualité des services fournis par ces derniers.</p>

<h3>Propriété intellectuelle</h3>
<p>Tous les contenus présents sur ce site sont protégés par le droit de la propriété intellectuelle.</p>

<p>Pour toute question, contactez-nous à : contact@topreparateurs.fr</p>',
'Conditions Générales d''Utilisation - TopRéparateurs.fr',
'Consultez les conditions générales d''utilisation de la plateforme TopRéparateurs.fr.',
true),

('cgv', 'Conditions Générales de Vente',
'<h2>Conditions Générales de Vente</h2>
<p>Les présentes conditions générales de vente s''appliquent aux services payants proposés sur TopRéparateurs.fr.</p>

<h3>Services proposés</h3>
<p>Nous proposons différents plans d''abonnement pour les réparateurs professionnels souhaitant utiliser notre plateforme.</p>

<h3>Tarifs et paiement</h3>
<p>Les tarifs sont indiqués en euros TTC. Le paiement s''effectue par carte bancaire de manière sécurisée.</p>

<h3>Rétractation</h3>
<p>Conformément à la législation en vigueur, vous disposez d''un délai de 14 jours pour exercer votre droit de rétractation.</p>

<h3>Résiliation</h3>
<p>L''abonnement peut être résilié à tout moment depuis votre espace personnel.</p>

<h3>Support client</h3>
<p>Notre équipe support est disponible par email : contact@topreparateurs.fr</p>',
'Conditions Générales de Vente - TopRéparateurs.fr',
'Consultez les conditions générales de vente des services TopRéparateurs.fr.',
true),

('aide', 'Centre d''Aide',
'<h2>Centre d''Aide</h2>
<p>Trouvez rapidement les réponses à vos questions les plus fréquentes.</p>

<h3>Questions fréquentes</h3>

<h4>Comment trouver un réparateur ?</h4>
<p>Utilisez notre moteur de recherche en indiquant votre ville et le type d''appareil à réparer. Vous verrez apparaître les réparateurs disponibles près de chez vous.</p>

<h4>Comment contacter un réparateur ?</h4>
<p>Cliquez sur la fiche du réparateur qui vous intéresse pour voir ses coordonnées et demander un devis gratuit.</p>

<h4>Les réparateurs sont-ils certifiés ?</h4>
<p>Nous vérifions les qualifications de chaque réparateur avant de l''accepter sur notre plateforme.</p>

<h4>Comment devenir réparateur partenaire ?</h4>
<p>Inscrivez-vous en tant que réparateur et complétez votre profil professionnel. Nous examinerons votre candidature sous 48h.</p>

<h3>Besoin d''aide supplémentaire ?</h3>
<p>Contactez notre équipe support :</p>
<ul>
<li>Email : contact@topreparateurs.fr</li>
<li>Téléphone : 07 45 06 21 62</li>
<li>WhatsApp : Disponible 7j/7</li>
</ul>',
'Centre d''Aide - TopRéparateurs.fr',
'Trouvez de l''aide et des réponses à vos questions sur TopRéparateurs.fr.',
true),

('contact', 'Contact',
'<h2>Nous Contacter</h2>
<p>Plusieurs moyens pour nous joindre selon vos besoins.</p>

<h3>Informations de contact</h3>
<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
<p><strong>Email :</strong> contact@topreparateurs.fr</p>
<p><strong>Téléphone :</strong> 07 45 06 21 62</p>
<p><strong>WhatsApp :</strong> Disponible 7j/7 pour un support rapide</p>
</div>

<h3>Horaires de support</h3>
<p>Notre équipe est disponible :</p>
<ul>
<li>Du lundi au vendredi : 9h - 18h</li>
<li>Weekend : Support WhatsApp uniquement</li>
</ul>

<h3>Pour les réparateurs</h3>
<p>Vous êtes un professionnel et souhaitez rejoindre notre réseau ? Contactez-nous directement pour découvrir nos offres partenaires.</p>

<h3>Pour les particuliers</h3>
<p>Besoin d''aide pour trouver un réparateur ou un problème avec votre demande ? Nous sommes là pour vous aider.</p>

<h3>Signaler un problème</h3>
<p>Pour signaler un dysfonctionnement ou un problème avec un réparateur, contactez-nous immédiatement avec tous les détails.</p>',
'Contact - TopRéparateurs.fr',
'Contactez l''équipe TopRéparateurs.fr pour toute question ou demande d''information.',
true),

('faq', 'Questions Fréquentes (FAQ)',
'<h2>Questions Fréquentes</h2>
<p>Trouvez rapidement les réponses à vos questions.</p>

<h3>🔍 Recherche de réparateurs</h3>

<h4>Comment trouver un réparateur près de chez moi ?</h4>
<p>Saisissez votre ville dans le moteur de recherche et sélectionnez le type d''appareil. Notre système vous montrera tous les réparateurs disponibles dans votre zone.</p>

<h4>Les prix sont-ils affichés ?</h4>
<p>Les réparateurs indiquent leurs tarifs moyens, mais le prix final dépend du diagnostic. Tous les devis sont gratuits et sans engagement.</p>

<h3>📱 Types de réparations</h3>

<h4>Quels appareils peuvent être réparés ?</h4>
<p>Nous couvrons :</p>
<ul>
<li>Smartphones (toutes marques)</li>
<li>Tablettes</li>
<li>Ordinateurs portables et fixes</li>
<li>Consoles de jeux</li>
</ul>

<h4>Quelle est la durée de garantie ?</h4>
<p>Chaque réparateur propose sa propre garantie, généralement de 3 à 12 mois selon le type de réparation.</p>

<h3>💰 Tarifs et paiement</h3>

<h4>TopRéparateurs.fr prend-il une commission ?</h4>
<p>Non, nous ne prenons aucune commission sur vos réparations. Notre service de mise en relation est gratuit pour les particuliers.</p>

<h4>Comment payer le réparateur ?</h4>
<p>Le paiement se fait directement avec le réparateur selon ses modalités (espèces, carte, virement).</p>

<h3>🏆 Qualité et sécurité</h3>

<h4>Comment vérifiez-vous les réparateurs ?</h4>
<p>Nous vérifions :</p>
<ul>
<li>Les qualifications professionnelles</li>
<li>Les assurances professionnelles</li>
<li>Les avis clients</li>
<li>Le respect de nos standards qualité</li>
</ul>

<h4>Que faire si je ne suis pas satisfait ?</h4>
<p>Contactez-nous immédiatement. Nous interviendrons pour résoudre le problème et, si nécessaire, vous orienter vers un autre réparateur.</p>

<h3>👨‍🔧 Pour les réparateurs</h3>

<h4>Comment devenir partenaire ?</h4>
<p>Inscrivez-vous, complétez votre profil professionnel et soumettez vos documents. Nous étudions chaque candidature sous 48h.</p>

<h4>Combien coûte l''abonnement ?</h4>
<p>Nous proposons plusieurs plans à partir de 9,90€/mois. Découvrez nos offres dans l''espace réparateur.</p>

<h3>❓ Autre question ?</h3>
<p>Contactez-nous à : contact@topreparateurs.fr ou 07 45 06 21 62</p>',
'FAQ - Questions Fréquentes TopRéparateurs.fr',
'Réponses aux questions les plus fréquentes sur TopRéparateurs.fr, plateforme de réparation.',
true);
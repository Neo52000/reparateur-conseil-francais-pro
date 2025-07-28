-- Création des pages services manquantes dans static_pages (version corrigée)
INSERT INTO public.static_pages (slug, title, content, meta_title, meta_description, is_published, created_at, updated_at)
VALUES 
(
  'reparation-smartphone',
  'Réparation Smartphone - TopRéparateurs.fr',
  '<div class="service-page">
    <h1>Réparation de Smartphone</h1>
    <p>Trouvez rapidement un réparateur de smartphone qualifié près de chez vous. TopRéparateurs.fr vous met en relation avec les meilleurs professionnels de la réparation mobile.</p>
    
    <h2>Types de pannes courantes</h2>
    <ul>
      <li>Écran cassé ou fissuré</li>
      <li>Problème de batterie</li>
      <li>Prise de charge défectueuse</li>
      <li>Problème de caméra</li>
      <li>Dysfonctionnement du tactile</li>
      <li>Problème de son</li>
    </ul>
    
    <h2>Processus de réparation</h2>
    <p>1. Diagnostic gratuit de votre smartphone<br/>
    2. Devis transparent et détaillé<br/>
    3. Réparation par un professionnel qualifié<br/>
    4. Test complet de fonctionnement<br/>
    5. Garantie sur la réparation</p>
    
    <h2>Pourquoi choisir TopRéparateurs.fr ?</h2>
    <ul>
      <li>Réparateurs vérifiés et qualifiés</li>
      <li>Devis gratuits et transparents</li>
      <li>Réparations garanties</li>
      <li>Service rapide et de proximité</li>
      <li>Tarifs compétitifs</li>
    </ul>
    
    <div class="cta-section">
      <h3>Trouvez votre réparateur smartphone</h3>
      <p>Localisez un professionnel près de chez vous et obtenez un devis gratuit.</p>
      <a href="/" class="btn-primary">Trouver un réparateur</a>
    </div>
  </div>',
  'Réparation Smartphone - Trouvez un réparateur près de chez vous',
  'Réparation smartphone par des professionnels qualifiés. Devis gratuit, réparation garantie. Trouvez votre réparateur sur TopRéparateurs.fr.',
  true,
  now(),
  now()
),
(
  'reparation-tablette',
  'Réparation Tablette - TopRéparateurs.fr',
  '<div class="service-page">
    <h1>Réparation de Tablette</h1>
    <p>Votre tablette est endommagée ? Trouvez un réparateur expert en tablettes près de chez vous grâce à TopRéparateurs.fr.</p>
    
    <h2>Types de pannes courantes</h2>
    <ul>
      <li>Écran cassé ou endommagé</li>
      <li>Problème de charge</li>
      <li>Dysfonctionnement tactile</li>
      <li>Problème de batterie</li>
      <li>Panne de système</li>
      <li>Connectique défaillante</li>
    </ul>
    
    <h2>Processus de réparation</h2>
    <p>1. Diagnostic complet de votre tablette<br/>
    2. Évaluation détaillée des dommages<br/>
    3. Devis personnalisé et transparent<br/>
    4. Réparation professionnelle<br/>
    5. Tests de fonctionnement complets</p>
    
    <h2>Avantages TopRéparateurs.fr</h2>
    <ul>
      <li>Spécialistes tablettes certifiés</li>
      <li>Pièces de qualité origine</li>
      <li>Garantie sur toutes réparations</li>
      <li>Intervention rapide</li>
      <li>Prix transparents et compétitifs</li>
    </ul>
    
    <div class="cta-section">
      <h3>Réparez votre tablette aujourd hui</h3>
      <p>Trouvez un expert en réparation de tablettes dans votre région.</p>
      <a href="/" class="btn-primary">Trouver un réparateur</a>
    </div>
  </div>',
  'Réparation Tablette - Expert en réparation près de chez vous',
  'Réparation tablette par des spécialistes qualifiés. iPad, Samsung Galaxy Tab, toutes marques. Devis gratuit sur TopRéparateurs.fr.',
  true,
  now(),
  now()
),
(
  'reparation-ordinateur',
  'Réparation Ordinateur - TopRéparateurs.fr',
  '<div class="service-page">
    <h1>Réparation d Ordinateur</h1>
    <p>Ordinateur portable ou fixe en panne ? Trouvez un technicien informatique qualifié près de chez vous avec TopRéparateurs.fr.</p>
    
    <h2>Types de pannes courantes</h2>
    <ul>
      <li>Écran noir ou défaillant</li>
      <li>Problème de démarrage</li>
      <li>Surchauffe et ventilation</li>
      <li>Clavier ou trackpad défectueux</li>
      <li>Problème de disque dur</li>
      <li>Infection virus ou malware</li>
      <li>Mise à jour système</li>
    </ul>
    
    <h2>Services de réparation</h2>
    <p>• Diagnostic complet hardware et software<br/>
    • Remplacement de composants défectueux<br/>
    • Nettoyage et optimisation système<br/>
    • Récupération de données<br/>
    • Installation et configuration<br/>
    • Maintenance préventive</p>
    
    <h2>Nos garanties</h2>
    <ul>
      <li>Techniciens certifiés et expérimentés</li>
      <li>Diagnostic précis et devis détaillé</li>
      <li>Pièces de rechange de qualité</li>
      <li>Garantie sur les réparations</li>
      <li>Intervention rapide et efficace</li>
    </ul>
    
    <div class="cta-section">
      <h3>Réparez votre ordinateur</h3>
      <p>Contactez un technicien informatique près de chez vous.</p>
      <a href="/" class="btn-primary">Trouver un réparateur</a>
    </div>
  </div>',
  'Réparation Ordinateur - Technicien informatique près de chez vous',
  'Réparation ordinateur portable et fixe par des techniciens qualifiés. Diagnostic gratuit, intervention rapide. TopRéparateurs.fr.',
  true,
  now(),
  now()
),
(
  'reparation-console',
  'Réparation Console de Jeux - TopRéparateurs.fr',
  '<div class="service-page">
    <h1>Réparation de Console de Jeux</h1>
    <p>Console PlayStation, Xbox, Nintendo Switch en panne ? Trouvez un réparateur spécialisé en consoles de jeux près de chez vous.</p>
    
    <h2>Consoles prises en charge</h2>
    <ul>
      <li>PlayStation 4 et PlayStation 5</li>
      <li>Xbox One et Xbox Series X/S</li>
      <li>Nintendo Switch et Switch Lite</li>
      <li>PlayStation 3 et Xbox 360</li>
      <li>Nintendo DS et 3DS</li>
      <li>PSP et PS Vita</li>
    </ul>
    
    <h2>Pannes fréquentes</h2>
    <ul>
      <li>Console qui ne s allume plus</li>
      <li>Problème de lecture de disques</li>
      <li>Surchauffe et ventilateur bruyant</li>
      <li>Manettes défectueuses</li>
      <li>Écran fissuré (Switch)</li>
      <li>Connectique HDMI défaillante</li>
      <li>Problème de connexion WiFi</li>
    </ul>
    
    <h2>Expertise spécialisée</h2>
    <p>• Diagnostic approfondi par des spécialistes gaming<br/>
    • Réparation avec pièces compatibles<br/>
    • Tests complets de fonctionnement<br/>
    • Nettoyage et maintenance<br/>
    • Mise à jour firmware<br/>
    • Conseil et prévention</p>
    
    <div class="cta-section">
      <h3>Réparez votre console</h3>
      <p>Trouvez un spécialiste console de jeux dans votre région.</p>
      <a href="/" class="btn-primary">Trouver un réparateur</a>
    </div>
  </div>',
  'Réparation Console de Jeux - PlayStation, Xbox, Nintendo Switch',
  'Réparation console PlayStation, Xbox, Nintendo Switch par des spécialistes gaming. Diagnostic gratuit sur TopRéparateurs.fr.',
  true,
  now(),
  now()
);

-- Création de templates pour les pages SEO locales pour tous les services
INSERT INTO public.local_seo_templates (service_type, title_template, meta_description_template, h1_template, content_template, is_active)
VALUES 
(
  'tablette',
  'Réparation Tablette {city} - Trouvez un Expert Près de Chez Vous',
  'Réparation tablette à {city} par des professionnels qualifiés. {repairer_count} réparateurs disponibles. Devis gratuit et intervention rapide.',
  'Réparation de Tablette à {city}',
  'Vous cherchez un réparateur de tablette à {city} ? TopRéparateurs.fr vous met en relation avec {repairer_count} professionnels qualifiés dans votre région. Que ce soit pour un iPad, une Samsung Galaxy Tab ou toute autre marque, nos experts vous garantissent une réparation rapide et de qualité avec une moyenne de {average_rating}/5 étoiles.',
  true
),
(
  'ordinateur',
  'Réparation Ordinateur {city} - Technicien Informatique',
  'Réparation ordinateur à {city} par des techniciens certifiés. {repairer_count} professionnels disponibles. Diagnostic gratuit.',
  'Réparation d Ordinateur à {city}',
  'Besoin d un technicien informatique à {city} ? Découvrez {repairer_count} professionnels de la réparation ordinateur dans votre secteur. Portable ou fixe, nos experts interviennent rapidement avec une note moyenne de {average_rating}/5 étoiles.',
  true
),
(
  'console',
  'Réparation Console {city} - PlayStation, Xbox, Nintendo Switch',
  'Réparation console de jeux à {city}. {repairer_count} spécialistes PlayStation, Xbox, Nintendo Switch. Devis gratuit.',
  'Réparation de Console de Jeux à {city}',
  'Console en panne à {city} ? Trouvez parmi {repairer_count} spécialistes gaming dans votre région. PlayStation, Xbox, Nintendo Switch - nos experts réparent toutes les consoles avec {average_rating}/5 étoiles de satisfaction.',
  true
);
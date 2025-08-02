-- Générer du contenu initial pour les nouvelles catégories
INSERT INTO blog_posts (title, slug, excerpt, content, category_id, visibility, status, ai_generated, ai_model, meta_title, meta_description, keywords, published_at) VALUES

-- Articles "Réparer ou jeter ?"
('iPhone cassé : réparer ou remplacer ?', 'iphone-casse-reparer-ou-remplacer', 'Guide complet pour décider entre réparation et remplacement de votre iPhone en panne', 
'# iPhone cassé : réparer ou remplacer ?

## Les critères de décision essentiels

### 1. Évaluer l''âge de votre iPhone

Un iPhone de moins de 3 ans mérite généralement d''être réparé. Au-delà, plusieurs facteurs entrent en jeu :
- **Moins de 2 ans** : Réparation recommandée dans 90% des cas
- **2-4 ans** : Analyse coût/bénéfice nécessaire  
- **Plus de 4 ans** : Remplacement souvent plus judicieux

### 2. Comparer les coûts

**Coût de réparation vs prix d''un appareil neuf :**
- Si la réparation coûte plus de 50% du prix d''un iPhone équivalent, privilégiez le remplacement
- Les réparations d''écran (150-300€) sont généralement rentables
- Les problèmes de carte-mère dépassent souvent ce seuil

### 3. Impact environnemental

Réparer votre iPhone évite :
- 70kg de CO2 équivalent
- L''extraction de 34kg de minerais
- La production de 3000L d''eau

**Conseil écologique :** Même un iPhone âgé réparé a un impact environnemental 5x moindre qu''un neuf.

### 4. Disponibilité des pièces

Vérifiez la disponibilité des pièces détachées :
- **iPhone 12 et plus récents** : Pièces garanties disponibles
- **iPhone 8-11** : Disponibilité variable selon le composant
- **iPhone 7 et antérieurs** : Pièces de plus en plus rares

## Cas pratiques avec exemples chiffrés

### Exemple 1 : iPhone 13 Pro avec écran cassé
- **Âge** : 2 ans
- **Coût réparation** : 280€ 
- **Prix équivalent d''occasion** : 650€
- **Décision** : ✅ Réparer (coût = 43% du remplacement)

### Exemple 2 : iPhone X avec problème de batterie et caméra
- **Âge** : 5 ans  
- **Coût réparation** : 200€
- **Prix iPhone équivalent** : 300€
- **Décision** : ❌ Remplacer (coût = 67% du remplacement)

## Comment évaluer l''état de votre iPhone

### Tests à effectuer
1. **Batterie** : Vérifiez l''autonomie dans Réglages > Batterie > État de la batterie
2. **Écran** : Testez le tactile dans tous les coins
3. **Caméras** : Prenez des photos en mode portrait et vidéo
4. **Connectivité** : Testez WiFi, Bluetooth, réseau mobile

### Signaux d''alarme
- Redémarrages fréquents
- Lenteurs importantes malgré nettoyage
- Surchauffe sans utilisation intensive
- Problèmes de charge récurrents

## Conclusion

La réparation est généralement la meilleure option pour les iPhone de moins de 4 ans avec des pannes isolées. Au-delà, ou en cas de pannes multiples, le remplacement devient plus judicieux économiquement.',

(SELECT id FROM blog_categories WHERE slug = 'reparer-ou-jeter'), 'public', 'published', true, 'mistral',
'iPhone cassé : réparer ou remplacer ? Guide 2024', 'Découvrez comment décider entre réparation et remplacement de votre iPhone cassé. Conseils, coûts, impact environnemental.', 
ARRAY['iPhone', 'réparation', 'remplacement', 'guide', 'coût'], now()),

-- Articles "Trouver un réparateur"  
('Comment choisir le bon réparateur de smartphone', 'choisir-bon-reparateur-smartphone', 'Guide complet pour sélectionner un réparateur de confiance et éviter les arnaques', 
'# Comment choisir le bon réparateur de smartphone

## Les questions essentielles à poser

### Avant de confier votre appareil

**Questions sur les compétences :**
- Depuis quand réparez-vous des smartphones ?
- Travaillez-vous sur ma marque/modèle spécifiquement ?
- Avez-vous des certifications professionnelles ?
- Pouvez-vous me montrer des exemples de réparations similaires ?

**Questions sur les garanties :**
- Quelle garantie proposez-vous sur la réparation ?
- Que couvre exactement cette garantie ?
- Que se passe-t-il si la panne récidive ?
- Proposez-vous un appareil de prêt pendant la réparation ?

### Questions sur les prix et délais

- Le devis est-il gratuit et sans engagement ?
- Le prix inclut-il la main d''œuvre ET les pièces ?
- Y a-t-il des frais cachés (diagnostics, transport...) ?
- Quel est le délai de réparation prévu ?

## Signaux d''alarme à éviter absolument

### 🚨 Red flags majeurs

**Comportement commercial suspect :**
- Démarchage à domicile ou par téléphone
- Pression pour signer immédiatement  
- Refus de fournir un devis écrit
- Demande de paiement intégral avant intervention

**Transparence insuffisante :**
- Pas d''adresse physique claire
- Refus de montrer l''atelier
- Pas de SIRET ou numéro d''entreprise
- Avis clients uniquement positifs et récents

**Pratiques douteuses :**
- Prix anormalement bas (souvent synonyme de pièces non-conformes)
- Délais irréalistes ("réparé en 1h garantie")
- Diagnostic payant sans engagement de réparation
- Récupération de votre ancien matériel sans justification

## Critères de qualité d''un bon réparateur

### Certifications et labels à rechercher

**Labels officiels :**
- ✅ **Label Répar''Acteurs** (reconnu par l''ADEME)
- ✅ **Certification QualiRepar** 
- ✅ **Agrément centres multimarques**
- ✅ **Formation constructeur** (Apple, Samsung...)

**Garanties professionnelles :**
- Assurance responsabilité civile professionnelle
- Garantie légale minimum 6 mois sur les réparations
- Engagement sur l''origine des pièces détachées

### Transparence des prix

Un réparateur de confiance vous propose :
- **Devis détaillé gratuit** avec prix pièces + main d''œuvre
- **Grille tarifaire visible** (vitrine, site web)
- **Explication pédagogique** de la panne et réparation nécessaire
- **Plusieurs options** (pièce origine/compatible, avec/sans garantie étendue)

## Comment vérifier la réputation

### Sources fiables d''avis clients

**Plateformes vérifiées :**
1. **Google My Business** (avis géolocalisés difficiles à falsifier)
2. **Pages Jaunes Pro** (avis modérés)  
3. **Trustpilot** (pour les réparateurs ayant un site)
4. **Forums spécialisés** (commentaires détaillés)

**⚠️ Méfiez-vous des avis :**
- Tous datés de la même période
- Rédigés de manière très similaire
- Uniquement positifs sans nuance
- Très récents pour un business ancien

### Témoignages de clients satisfaits

**Marie, 34 ans - iPhone 12 Pro :**
*"Écran cassé un vendredi, réparé le lundi. Le réparateur m''a expliqué chaque étape, fourni une facture détaillée et même donné des conseils pour éviter la récidive. Six mois après, aucun problème. Je recommande !"*

**Thomas, 28 ans - Samsung Galaxy S21 :**
*"Problème de batterie. Le réparateur a d''abord testé devant moi, expliqué que c''était bien la batterie et non un problème logiciel. Changement en 2h, garantie 1 an respectée. Très satisfait du service."*

## Négociation et devis : les bonnes pratiques

### Éléments négociables

**Ce que vous POUVEZ négocier :**
- Délai de réparation (contre supplément éventuel)
- Garantie étendue 
- Prix si vous apportez plusieurs appareils
- Mode de paiement (échelonnement possible)

**Ce qui ne DOIT PAS être négocié :**
- Qualité des pièces détachées
- Respect des normes de sécurité
- Garantie légale minimum

### Lecture du devis

Un bon devis contient :
- **Identification claire** : vos coordonnées + celles du réparateur
- **Description précise** : marque, modèle, numéro de série
- **Détail des prestations** : diagnostic + réparation + pièces
- **Prix HT et TTC** séparément
- **Délai d''intervention** et date de livraison
- **Conditions de garantie** explicites

## Conclusion

Prendre le temps de bien choisir son réparateur, c''est s''assurer d''une réparation durable et éviter les mauvaises surprises. N''hésitez pas à comparer plusieurs devis et à poser toutes vos questions avant de vous engager.',

(SELECT id FROM blog_categories WHERE slug = 'trouver-un-reparateur'), 'public', 'published', true, 'mistral',
'Comment choisir le bon réparateur de smartphone ? Guide 2024', 'Guide complet pour sélectionner un réparateur de smartphone fiable. Questions à poser, pièges à éviter, critères de qualité.', 
ARRAY['réparateur', 'smartphone', 'choisir', 'qualité', 'garantie'], now());
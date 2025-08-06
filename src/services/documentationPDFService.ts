/**
 * Service de génération PDF amélioré pour la documentation
 * Conversion markdown optimisée et styles PDF professionnels
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface DocumentMetadata {
  title: string;
  subtitle: string;
  filename: string;
  lastUpdated: string;
  version: string;
}

export class DocumentationPDFService {
  private static readonly LOGO_URL = '/logo-icon.svg';
  private static readonly COMPANY_NAME = 'ReparMobile';
  private static readonly FOOTER_TEXT = 'Document généré automatiquement';

  /**
   * Génère un PDF à partir du contenu markdown
   */
  static async generatePDF(
    content: string,
    metadata: DocumentMetadata
  ): Promise<Blob> {
    // Créer un conteneur temporaire pour le rendu HTML
    const container = document.createElement('div');
    container.className = 'pdf-document-container';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px'; // A4 width
    container.style.minHeight = '1123px'; // A4 height minimum
    container.innerHTML = this.createHTMLTemplate(content, metadata);
    
    // Appliquer les styles
    this.applyPDFStyles(container);
    
    // Ajouter au DOM temporairement
    document.body.appendChild(container);
    
    try {
      // Calculer la hauteur du contenu dynamiquement
      const contentHeight = container.scrollHeight;
      const canvasHeight = Math.max(contentHeight, 1123);
      
      // Générer le canvas avec dimensions dynamiques
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: canvasHeight,
        scrollX: 0,
        scrollY: 0,
      });
      
      // Créer le PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calculer les dimensions pour le PDF
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const canvasRatio = canvas.height / canvas.width;
      const scaledHeight = pdfWidth * canvasRatio;
      
      // Si le contenu tient sur une page
      if (scaledHeight <= pdfHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
      } else {
        // Diviser en plusieurs pages
        const pageCount = Math.ceil(scaledHeight / pdfHeight);
        const pageHeightCanvas = canvas.height / pageCount;
        
        for (let i = 0; i < pageCount; i++) {
          if (i > 0) pdf.addPage();
          
          const yOffset = -i * pageHeightCanvas * (pdfHeight / scaledHeight);
          pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, scaledHeight);
        }
      }
      
      return pdf.output('blob');
    } finally {
      // Nettoyer le DOM
      document.body.removeChild(container);
    }
  }

  /**
   * Télécharge un PDF généré
   */
  static downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Crée le template HTML pour le PDF
   */
  private static createHTMLTemplate(content: string, metadata: DocumentMetadata): string {
    return `
      <div class="pdf-page">
        <!-- En-tête -->
        <header class="pdf-header">
          <div class="header-content">
            <div class="logo-section">
              <img src="${this.LOGO_URL}" alt="${this.COMPANY_NAME}" class="logo" />
              <h1>${this.COMPANY_NAME}</h1>
            </div>
            <div class="doc-info">
              <h2>${metadata.title}</h2>
              <p>${metadata.subtitle}</p>
              <div class="meta-info">
                <span>Version: ${metadata.version}</span>
                <span>Mis à jour: ${metadata.lastUpdated}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Contenu principal avec plus de détails -->
        <main class="pdf-content">
          <div class="content-body">
            ${this.convertMarkdownToHTML(this.enrichContent(content, metadata))}
          </div>
        </main>
        
        <!-- Pied de page -->
        <footer class="pdf-footer">
          <div class="footer-content">
            <span>${this.FOOTER_TEXT}</span>
            <span>Page 1</span>
            <span>${metadata.lastUpdated}</span>
          </div>
        </footer>
      </div>
    `;
  }
  private static enrichContent(content: string, metadata: DocumentMetadata): string {
    if (!content || content.trim().length < 100) {
      // Si le contenu est vide ou très court, générer du contenu par défaut
      return this.generateDefaultContent(metadata);
    }
    
    return content;
  }

  /**
   * Génère du contenu par défaut basé sur le type de document
   */
  private static generateDefaultContent(metadata: DocumentMetadata): string {
    const filename = metadata.filename.toLowerCase();
    
    if (filename.includes('prd')) {
      return this.generatePRDContent();
    } else if (filename.includes('user') || filename.includes('guide')) {
      return this.generateUserGuideContent();
    } else if (filename.includes('technical') || filename.includes('tech')) {
      return this.generateTechnicalContent();
    } else {
      return this.generateGenericContent();
    }
  }

  /**
   * Génère du contenu pour un PRD
   */
  private static generatePRDContent(): string {
    return `
# Document de Spécification Produit (PRD)

## 1. Vue d'ensemble du produit

### Vision
RepairHub est une plateforme SaaS complète qui révolutionne l'industrie de la réparation mobile en connectant les particuliers aux réparateurs qualifiés via une interface intuitive et des outils de gestion avancés.

### Objectifs stratégiques
- Digitaliser le secteur de la réparation mobile traditionnellement fragmenté
- Offrir une transparence totale sur les tarifs et délais de réparation
- Optimiser la gestion opérationnelle des ateliers de réparation
- Créer un écosystème de confiance entre clients et réparateurs

## 2. Personas utilisateurs

### 2.1 Persona Client (Particulier)
**Profil type :** Sarah, 28 ans, cadre dynamique
- Utilise intensivement son smartphone pour le travail et personnel
- Recherche une solution rapide et fiable en cas de panne
- Valorise la transparence des prix et la qualité du service
- Préfère les solutions digitales aux démarches traditionnelles

**Besoins :**
- Trouver rapidement un réparateur proche et qualifié
- Obtenir un devis transparent avant intervention
- Suivre l'état de la réparation en temps réel
- Bénéficier de garanties sur les réparations

### 2.2 Persona Réparateur (Professionnel)
**Profil type :** Marc, 35 ans, propriétaire d'atelier de réparation
- 10 ans d'expérience dans la réparation mobile
- Gérant d'un atelier de 3 techniciens
- Recherche des outils pour optimiser son activité
- Souhaite développer sa clientèle et sa visibilité

**Besoins :**
- Système de gestion client et stock intégré
- Visibilité online pour attirer de nouveaux clients
- Outils de facturation et de suivi automatisés
- Analytics pour optimiser son business

## 3. Fonctionnalités principales

### 3.1 Pour les clients
#### Recherche et géolocalisation
- Carte interactive des réparateurs à proximité
- Filtres avancés (spécialité, tarifs, délais, avis)
- Système de notation et d'avis clients
- Comparaison des offres en temps réel

#### Gestion des demandes
- Formulaire de demande de devis simplifié
- Upload de photos pour pré-diagnostic
- Chat intégré avec le réparateur
- Notifications SMS/email automatiques

#### Suivi et paiement
- Tracking temps réel de la réparation
- Système de paiement sécurisé en ligne
- Factures et garanties dématérialisées
- Historique complet des réparations

### 3.2 Pour les réparateurs
#### Gestion commerciale
- Dashboard analytics complet
- Gestion des devis et facturation
- Planification des interventions
- CRM client intégré

#### Outils opérationnels
- Système POS pour les ventes en magasin
- Gestion de stock automatisée
- Suivi des techniciens et performances
- Génération de rapports automatiques

#### Marketing et visibilité
- Profil optimisé SEO
- Campagnes publicitaires automatisées
- Gestion de la réputation online
- Programme de fidélisation client

## 4. Architecture technique

### 4.1 Stack technologique
- **Frontend :** React 18, TypeScript, Tailwind CSS
- **Backend :** Supabase (PostgreSQL, Auth, Storage)
- **Paiements :** Stripe Connect pour les transactions
- **Géolocalisation :** API Mapbox pour la cartographie
- **IA :** Mistral AI pour l'assistance et l'optimisation

### 4.2 Intégrations
- APIs de géocodage pour la localisation précise
- Systèmes de facturation tiers (Sage, Cegid)
- Solutions de logistique (Colissimo, Chronopost)
- Plateformes d'avis clients (Trustpilot, Google)

## 5. Modèle économique

### 5.1 Plans d'abonnement
- **Gratuit :** Fonctionnalités de base, 5 devis/mois
- **Basic (9,90€/mois) :** Gestion complète, 50 devis/mois
- **Pro (19,90€/mois) :** Analytics avancés, 200 devis/mois
- **Premium (39,90€/mois) :** Marketing automatisé, illimité
- **Enterprise (99,90€/mois) :** White-label, API, support dédié

### 5.2 Modules complémentaires
- **Module POS :** 49,90€/mois (gestion magasin)
- **Module E-commerce :** 89€/mois (boutique en ligne)
- **Module Marketing IA :** 29€/mois (campagnes automatisées)

### 5.3 Revenus additionnels
- Commission de 2% sur les transactions
- Services de mise en relation premium
- Formation et accompagnement des réparateurs
- Certification qualité RepairHub

## 6. Roadmap de développement

### Phase 1 (Mois 1-3) - MVP
- [ ] Interface de recherche et géolocalisation
- [ ] Système de devis et réservation
- [ ] Dashboard réparateur de base
- [ ] Paiements sécurisés

### Phase 2 (Mois 4-6) - Croissance
- [ ] Module POS complet
- [ ] Système d'avis et réputation
- [ ] Analytics avancés
- [ ] API publique

### Phase 3 (Mois 7-12) - Scale
- [ ] IA pour l'optimisation des tarifs
- [ ] Module e-commerce
- [ ] Programme partenaires
- [ ] Expansion européenne

## 7. Métriques de succès

### KPIs principaux
- **Acquisition :** 1000+ réparateurs actifs en 12 mois
- **Engagement :** 10000+ réparations mensuelles
- **Rétention :** 85% de taux de rétention réparateurs
- **Satisfaction :** 4.5/5 moyenne avis clients

### KPIs business
- **ARR :** 500k€ en année 1
- **LTV/CAC :** Ratio > 3:1
- **Churn :** < 5% mensuel
- **NPS :** > 70 pour les deux segments

Cette roadmap produit constitue la base stratégique pour le développement de RepairHub et assure l'alignement de toutes les équipes sur les objectifs communs.
`;
  }

  /**
   * Génère du contenu pour un guide utilisateur
   */
  private static generateUserGuideContent(): string {
    return `
# Guide Utilisateur RepairHub

## Bienvenue sur RepairHub !

RepairHub est votre plateforme de référence pour tous vos besoins de réparation mobile. Ce guide vous accompagne pas à pas pour tirer le meilleur parti de nos services.

## 🔍 Comment trouver un réparateur

### 1. Accéder à la recherche
- Rendez-vous sur [www.repairhub.fr](https://www.repairhub.fr)
- Cliquez sur "Trouver un réparateur" en page d'accueil
- Autorisez la géolocalisation pour des résultats optimaux

### 2. Utiliser les filtres
#### Localisation
- Saisissez votre adresse ou code postal
- Ajustez le rayon de recherche (1km à 50km)
- Visualisez les résultats sur la carte interactive

#### Critères de sélection
- **Type d'appareil :** Smartphone, tablette, ordinateur portable
- **Marque :** Apple, Samsung, Huawei, Xiaomi, etc.
- **Type de panne :** Écran, batterie, charge, boutons
- **Urgence :** Express (2h), rapide (24h), standard (72h)
- **Budget :** Gamme de prix personnalisable

### 3. Comparer les offres
Chaque réparateur affiche :
- ⭐ Note moyenne et nombre d'avis
- 💰 Tarifs transparents par type de réparation
- ⏱️ Délais d'intervention estimés
- 🛠️ Spécialités et certifications
- 📍 Distance et temps de trajet

## 📝 Faire une demande de réparation

### 1. Sélectionner un réparateur
- Cliquez sur le profil qui vous intéresse
- Consultez les avis détaillés des clients
- Vérifiez les disponibilités en temps réel

### 2. Décrire votre problème
#### Informations requises
- **Appareil :** Marque et modèle exact
- **Problème :** Description détaillée
- **Photos :** Ajoutez des images du problème
- **Urgence :** Définissez votre niveau de priorité

#### Conseils pour une meilleure estimation
- Soyez précis dans la description
- Mentionnez si l'appareil s'allume encore
- Indiquez les circonstances de la panne
- Précisez si vous avez déjà tenté des réparations

### 3. Recevoir le devis
- Devis détaillé sous 30 minutes en moyenne
- Détail des pièces et main d'œuvre
- Délais d'intervention confirmés
- Conditions de garantie spécifiées

## 💳 Réserver et payer

### 1. Validation du devis
- Comparez plusieurs devis si besoin
- Posez vos questions via le chat intégré
- Acceptez le devis qui vous convient

### 2. Choisir le mode d'intervention
#### En atelier
- Prenez rendez-vous en ligne
- Apportez votre appareil à l'heure convenue
- Profitez de l'espace d'attente si disponible

#### À domicile (selon réparateurs)
- Sélectionnez un créneau de passage
- Assurez-vous d'être présent
- Service disponible en supplément

#### Collecte/livraison
- Service de coursier sécurisé
- Emballage et assurance inclus
- Suivi en temps réel du colis

### 3. Paiement sécurisé
- Paiement en ligne via Stripe
- Cartes bancaires et PayPal acceptés
- Paiement à l'enlèvement possible
- Facture générée automatiquement

## 📱 Suivre votre réparation

### 1. Notifications automatiques
Recevez des alertes par :
- 📧 Email pour les étapes importantes
- 📱 SMS pour les mises à jour critiques
- 🔔 Notifications push sur l'app mobile

### 2. Statuts de suivi
- **Réception :** Appareil pris en charge
- **Diagnostic :** Analyse en cours
- **Commande pièces :** Approvisionnement
- **Réparation :** Intervention technique
- **Tests :** Vérifications qualité
- **Prêt :** Appareil réparé disponible

### 3. Communication directe
- Chat en temps réel avec le réparateur
- Demandes d'informations complémentaires
- Photos de l'avancement si nécessaire
- Modifications de planning possibles

## ⭐ Après la réparation

### 1. Récupération
- Notification dès que c'est prêt
- Vérification en votre présence
- Explication des réparations effectuées
- Conseils d'utilisation et d'entretien

### 2. Garantie
#### Conditions standard
- **Durée :** 3 à 12 mois selon réparation
- **Couverture :** Pièces et main d'œuvre
- **Exclusions :** Dommages accidentels ultérieurs
- **Service :** SAV direct avec le réparateur

#### Faire jouer la garantie
- Contactez directement le réparateur
- Présentez votre facture RepairHub
- Diagnostic gratuit sous garantie
- Échange/remboursement selon cas

### 3. Évaluation
#### Laisser un avis
- Note de 1 à 5 étoiles obligatoire
- Commentaire détaillé encouragé
- Photos avant/après appréciées
- Impact sur la visibilité du réparateur

#### Partager votre expérience
- Partagez sur les réseaux sociaux
- Recommandez à vos proches
- Participez à l'amélioration de la communauté

## 🆘 Assistance et support

### Contact client
- **Chat :** Support en ligne 9h-18h
- **Email :** support@repairhub.fr
- **Téléphone :** 01 23 45 67 89
- **FAQ :** Plus de 100 questions/réponses

### Problèmes courants
#### Problème avec un réparateur
1. Contactez d'abord le réparateur directement
2. Si non résolu, contactez notre médiation
3. Nous intervenons sous 24h maximum
4. Solutions : remboursement, re-réparation, compensation

#### Problème technique
- Vérifiez votre connexion internet
- Actualisez la page/application
- Consultez notre page statut des services
- Contactez le support si persistant

### Conseils de sécurité
- Sauvegardez vos données avant réparation
- Retirez cartes SIM et mémoires si possible
- Notez votre code PIN/schéma de déverrouillage
- Vérifiez l'identité du réparateur à domicile

Merci de faire confiance à RepairHub pour vos réparations !
`;
  }

  /**
   * Génère du contenu technique
   */
  private static generateTechnicalContent(): string {
    return `
# Documentation Technique RepairHub

## Architecture système

### Stack technique
- **Frontend :** React 18 + TypeScript + Tailwind CSS
- **Backend :** Supabase (PostgreSQL + Auth + Storage)
- **Maps :** Mapbox GL JS
- **Paiements :** Stripe Connect
- **Hosting :** Vercel avec CDN global

### Structure de la base de données

#### Tables principales
\`\`\`sql
-- Réparateurs
CREATE TABLE repairers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  rating DECIMAL(3,2),
  created_at TIMESTAMP
);

-- Clients
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP
);

-- Devis et demandes
CREATE TABLE quotes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  repairer_id TEXT REFERENCES repairers(id),
  device_type TEXT,
  device_brand TEXT,
  problem_description TEXT,
  estimated_price DECIMAL(8,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP
);
\`\`\`

## APIs et intégrations

### API Mapbox
Configuration de la carte interactive :

\`\`\`javascript
import mapboxgl from 'mapbox-gl';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [2.3522, 48.8566], // Paris
  zoom: 12
});

// Ajouter les marqueurs des réparateurs
repairers.forEach(repairer => {
  new mapboxgl.Marker()
    .setLngLat([repairer.lng, repairer.lat])
    .setPopup(new mapboxgl.Popup().setHTML(\`
      <h3>\${repairer.name}</h3>
      <p>Note: \${repairer.rating}/5</p>
    \`))
    .addTo(map);
});
\`\`\`

### API Stripe
Gestion des paiements sécurisés :

\`\`\`javascript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

const handlePayment = async (amount, repairerId) => {
  const { data } = await supabase.functions.invoke('create-payment-intent', {
    body: { amount, repairerId }
  });
  
  const { error } = await stripe.confirmCardPayment(data.clientSecret);
  if (!error) {
    // Paiement réussi
    updateQuoteStatus('paid');
  }
};
\`\`\`

## Sécurité et authentification

### Row Level Security (RLS)
Politiques de sécurité Supabase :

\`\`\`sql
-- Les utilisateurs ne peuvent voir que leurs propres devis
CREATE POLICY "Users can view own quotes" ON quotes
  FOR SELECT USING (auth.uid() = user_id);

-- Les réparateurs peuvent voir leurs devis reçus
CREATE POLICY "Repairers can view their quotes" ON quotes
  FOR SELECT USING (
    repairer_id IN (
      SELECT id FROM repairers 
      WHERE user_id = auth.uid()
    )
  );
\`\`\`

### Authentification
\`\`\`typescript
import { supabase } from '@/lib/supabase';

// Inscription
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: \`\${window.location.origin}/auth/callback\`
    }
  });
  return { data, error };
};

// Connexion
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};
\`\`\`

## Optimisation des performances

### Lazy loading et code splitting
\`\`\`typescript
// Chargement paresseux des composants
const RepairerDashboard = lazy(() => import('./RepairerDashboard'));
const AdminPanel = lazy(() => import('./AdminPanel'));

// Dans le routeur
<Route 
  path="/dashboard" 
  element={
    <Suspense fallback={<Loading />}>
      <RepairerDashboard />
    </Suspense>
  } 
/>
\`\`\`

### Optimisation des requêtes
\`\`\`typescript
// Requête optimisée avec sélection spécifique
const { data: repairers } = await supabase
  .from('repairers')
  .select('id, name, rating, lat, lng, phone')
  .eq('is_active', true)
  .order('rating', { ascending: false })
  .limit(50);

// Utilisation d'index pour les recherches géographiques
CREATE INDEX idx_repairers_location ON repairers 
USING GIST (ll_to_earth(lat, lng));
\`\`\`

## Monitoring et observabilité

### Métriques métier
\`\`\`typescript
// Tracking des événements importants
const trackEvent = async (event: string, properties: object) => {
  await supabase.from('analytics_events').insert({
    event_type: event,
    event_data: properties,
    user_id: user?.id,
    timestamp: new Date().toISOString()
  });
};

// Exemples d'usage
trackEvent('quote_requested', { 
  repairer_id, 
  device_type, 
  estimated_price 
});

trackEvent('payment_completed', { 
  amount, 
  payment_method 
});
\`\`\`

### Logs applicatifs
\`\`\`typescript
// Centralisation des logs
const logger = {
  info: (message: string, data?: any) => {
    console.log(\`[INFO] \${message}\`, data);
    // Envoi vers service de monitoring
  },
  error: (message: string, error?: Error) => {
    console.error(\`[ERROR] \${message}\`, error);
    // Envoi vers Sentry/LogRocket
  }
};
\`\`\`

## Tests automatisés

### Tests unitaires avec Jest
\`\`\`typescript
describe('RepairerService', () => {
  test('should filter repairers by distance', () => {
    const repairers = [
      { id: '1', lat: 48.8566, lng: 2.3522 }, // Paris
      { id: '2', lat: 45.7640, lng: 4.8357 }  // Lyon
    ];
    
    const filtered = filterByDistance(
      repairers, 
      { lat: 48.8566, lng: 2.3522 }, 
      10 // 10km radius
    );
    
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });
});
\`\`\`

### Tests d'intégration avec Playwright
\`\`\`typescript
test('user can request a quote', async ({ page }) => {
  await page.goto('/');
  
  // Rechercher un réparateur
  await page.fill('[data-testid="location-input"]', 'Paris');
  await page.click('[data-testid="search-button"]');
  
  // Sélectionner le premier résultat
  await page.click('[data-testid="repairer-card"]:first-child');
  
  // Remplir le formulaire de devis
  await page.selectOption('[data-testid="device-type"]', 'iPhone');
  await page.fill('[data-testid="problem-description"]', 'Écran cassé');
  await page.click('[data-testid="submit-quote"]');
  
  // Vérifier la confirmation
  await expect(page.locator('[data-testid="quote-success"]')).toBeVisible();
});
\`\`\`

## Déploiement et CI/CD

### Pipeline GitHub Actions
\`\`\`yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: \${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: \${{ secrets.SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}
\`\`\`

Cette documentation technique constitue la référence pour tous les développeurs travaillant sur RepairHub.
`;
  }

  /**
   * Génère du contenu générique
   */
  private static generateGenericContent(): string {
    return `
# Documentation RepairHub

## Introduction

Cette documentation présente les fonctionnalités et l'utilisation de la plateforme RepairHub, votre solution complète pour la gestion et la mise en relation dans le domaine de la réparation mobile.

## Fonctionnalités principales

### Pour les particuliers
- Recherche géolocalisée de réparateurs
- Demande de devis en ligne
- Suivi en temps réel des réparations
- Système de paiement sécurisé
- Avis et évaluations

### Pour les réparateurs
- Dashboard de gestion complet
- Système POS intégré
- Gestion de stock
- Analytics et rapports
- Outils marketing

## Guide d'utilisation

### Premiers pas
1. Créez votre compte utilisateur
2. Complétez votre profil
3. Explorez les fonctionnalités disponibles
4. Personnalisez vos préférences

### Support et assistance
Pour toute question ou problème, contactez notre équipe support via :
- Email : support@repairhub.fr
- Chat en ligne disponible 24h/7j
- FAQ complète sur notre site web

## Conclusion

RepairHub simplifie et modernise l'expérience de réparation mobile pour tous les acteurs du secteur.
`;
  }

  /**
   * Applique les styles CSS pour le PDF
   */
  private static applyPDFStyles(container: HTMLElement): void {
    const style = document.createElement('style');
    style.textContent = `
      .pdf-document-container {
        width: 794px;
        min-height: 1123px;
        background: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #1a1a1a;
        padding: 0;
        margin: 0;
        position: absolute;
        left: -9999px;
        top: -9999px;
      }

      .pdf-page {
        width: 100%;
        min-height: 100%;
        display: flex;
        flex-direction: column;
        padding: 40px;
        box-sizing: border-box;
      }

      .pdf-header {
        border-bottom: 3px solid #2563eb;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .logo-section {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .logo {
        width: 40px;
        height: 40px;
      }

      .logo-section h1 {
        font-size: 24px;
        font-weight: bold;
        color: #2563eb;
        margin: 0;
      }

      .doc-info h2 {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: #1e293b;
      }

      .doc-info p {
        font-size: 14px;
        color: #64748b;
        margin: 0 0 12px 0;
      }

      .meta-info {
        display: flex;
        gap: 20px;
      }

      .meta-info span {
        font-size: 12px;
        color: #64748b;
        background: #f8fafc;
        padding: 4px 8px;
        border-radius: 4px;
      }

      .pdf-content {
        flex: 1;
        line-height: 1.6;
      }

      .pdf-content h1 {
        font-size: 28px;
        font-weight: bold;
        color: #1e293b;
        margin: 30px 0 20px 0;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 10px;
      }

      .pdf-content h2 {
        font-size: 22px;
        font-weight: 600;
        color: #334155;
        margin: 25px 0 15px 0;
      }

      .pdf-content h3 {
        font-size: 18px;
        font-weight: 500;
        color: #475569;
        margin: 20px 0 12px 0;
      }

      .pdf-content p {
        font-size: 14px;
        line-height: 1.7;
        margin: 0 0 16px 0;
        text-align: justify;
      }

      .pdf-content ul, .pdf-content ol {
        margin: 16px 0;
        padding-left: 24px;
      }

      .pdf-content li {
        font-size: 14px;
        line-height: 1.6;
        margin: 8px 0;
      }

      .pdf-content .inline-code {
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: #e11d48;
        font-weight: 500;
      }

      .pdf-content .code-block {
        background: #1e293b;
        border-radius: 8px;
        margin: 20px 0;
        overflow: hidden;
      }

      .pdf-content .code-block pre {
        margin: 0;
        padding: 20px;
        color: #e2e8f0;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.5;
        overflow-x: auto;
      }

      .pdf-content blockquote {
        border-left: 4px solid #2563eb;
        background: #f8fafc;
        padding: 16px 20px;
        margin: 20px 0;
        font-style: italic;
        border-radius: 4px;
      }

      .pdf-content .pdf-link {
        color: #2563eb;
        text-decoration: underline;
        font-weight: 500;
      }

      .pdf-content .pdf-list {
        margin: 16px 0;
        padding-left: 24px;
      }

      .pdf-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 13px;
      }

      .pdf-content th, .pdf-content td {
        border: 1px solid #e2e8f0;
        padding: 12px;
        text-align: left;
      }

      .pdf-content th {
        background: #f8fafc;
        font-weight: 600;
        color: #1e293b;
      }

      .pdf-content h4 {
        font-size: 16px;
        font-weight: 500;
        color: #64748b;
        margin: 18px 0 10px 0;
      }

      .pdf-footer {
        border-top: 1px solid #e2e8f0;
        padding-top: 15px;
        margin-top: 30px;
      }

      .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #64748b;
      }
    `;
    
    document.head.appendChild(style);
    
    // Nettoyer après génération
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  }

  /**
   * Conversion Markdown vers HTML améliorée
   */
  private static convertMarkdownToHTML(markdown: string): string {
    let html = markdown;
    
    // Traitement des blocs de code
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
      return `<div class="code-block"><pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre></div>`;
    });
    
    // Code inline
    html = html.replace(/`([^`]+)`/gim, '<code class="inline-code">$1</code>');
    
    // Titres avec niveaux
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Citations
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Gras et italique
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // Images avec styles
    html = html.replace(/!\[([^\]]*)\]\(([^\)]*)\)/gim, 
      '<img alt="$1" src="$2" style="max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />');
    
    // Liens
    html = html.replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" class="pdf-link">$1</a>');
    
    // Listes numérotées
    html = html.replace(/^\d+\.\s+(.*$)/gim, '<oli>$1</oli>');
    html = html.replace(/(<oli>.*<\/oli>)/gims, match => {
      return '<ol>' + match.replace(/<\/?oli>/g, match.includes('</oli>') ? '</li>' : '<li>') + '</ol>';
    });
    
    // Listes à puces avec sous-niveaux
    html = html.replace(/^(\s*)[-*+]\s+(.*$)/gim, (match, indent, content) => {
      const level = Math.floor((indent || '').length / 2) + 1;
      return `<li data-level="${level}">${content}</li>`;
    });
    
    // Grouper les listes
    html = html.replace(/(<li[^>]*>.*<\/li>)/gims, match => {
      return '<ul class="pdf-list">' + match + '</ul>';
    });
    
    // Tables (basique)
    html = html.replace(/\|(.+)\|/gim, (match, content) => {
      const cells = content.split('|').map(cell => cell.trim()).filter(cell => cell);
      const isHeader = match.includes('---');
      if (isHeader) return '';
      const cellTag = cells.length > 0 ? 'td' : 'th';
      return `<tr>${cells.map(cell => `<${cellTag}>${cell}</${cellTag}>`).join('')}</tr>`;
    });
    
    // Remplacer les sauts de ligne par des paragraphes
    html = html.split('\n\n').map(paragraph => {
      if (paragraph.trim() && !paragraph.match(/^<[h1-6]|<ul|<ol|<blockquote|<div|<table/)) {
        return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
      }
      return paragraph;
    }).join('\n');
    
    return html;
  }

  /**
   * Génère les métadonnées par défaut avec contenu enrichi
   */
  static generateMetadata(docType: 'prd' | 'user-guide' | 'technical'): DocumentMetadata {
    const now = new Date().toLocaleDateString('fr-FR');
    
    switch (docType) {
      case 'prd':
        return {
          title: 'Product Requirements Document',
          subtitle: 'Cahier des charges complet - Plateforme ReparMobile de mise en relation réparateurs/clients',
          filename: `PRD_ReparMobile_${now.replace(/\//g, '-')}.pdf`,
          lastUpdated: now,
          version: '2.1.0'
        };
      case 'user-guide':
        return {
          title: 'Guide Utilisateur Complet',
          subtitle: 'Manuel d\'utilisation multi-rôles : Client, Réparateur, Administrateur',
          filename: `Guide_Utilisateur_ReparMobile_${now.replace(/\//g, '-')}.pdf`,
          lastUpdated: now,
          version: '2.1.0'
        };
      case 'technical':
        return {
          title: 'Documentation Technique',
          subtitle: 'Architecture système, API, Base de données & Guide développeur',
          filename: `Documentation_Technique_${now.replace(/\//g, '-')}.pdf`,
          lastUpdated: now,
          version: '2.1.0'
        };
      default:
        throw new Error('Type de document non supporté');
    }
  }
}
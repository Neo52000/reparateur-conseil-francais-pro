# RepairConnect - Documentation Technique

## Vue d'ensemble

RepairConnect est une plateforme SaaS full-stack développée avec React/TypeScript et Supabase, conçue pour mettre en relation particuliers et réparateurs de smartphones en France.

## Architecture

### Stack technologique
- **Frontend** : React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend** : Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Build** : Vite, ESLint, PostCSS
- **Deployment** : Vercel (frontend), Supabase (backend)

### Structure du projet
```
src/
├── components/          # Composants React réutilisables
│   ├── ui/             # Composants de base (shadcn/ui)
│   ├── admin/          # Interface administration
│   ├── auth/           # Authentification
│   ├── map/            # Cartographie
│   └── ...
├── hooks/              # Hooks personnalisés
├── pages/              # Pages principales
├── services/           # Logique métier et APIs
├── types/              # Types TypeScript
├── utils/              # Utilitaires
└── integrations/       # Intégrations externes (Supabase)

supabase/
├── functions/          # Edge Functions
├── migrations/         # Migrations de base de données
└── config.toml         # Configuration Supabase
```

## Configuration et installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase
- Git

### Installation locale
```bash
# Cloner le repository
git clone https://github.com/votre-org/repairconnect.git
cd repairconnect

# Installer les dépendances
npm install

# Configuration des variables d'environnement
cp .env.example .env.local
# Remplir les variables Supabase

# Lancer en développement
npm run dev
```

### Variables d'environnement
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anonyme
```

## Base de données

### Schéma principal
- `profiles` : Profils utilisateurs étendus
- `repairers` : Données des réparateurs
- `repairer_profiles` : Profils détaillés des réparateurs
- `quotes` : Demandes de devis
- `appointments` : Rendez-vous planifiés
- `repairer_subscriptions` : Abonnements des réparateurs

### Migrations
```bash
# Appliquer les migrations
supabase db push

# Générer les types TypeScript
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### RLS (Row Level Security)
Toutes les tables sensibles utilisent RLS pour sécuriser l'accès aux données :
- Utilisateurs : Accès à leurs propres données uniquement
- Réparateurs : Accès à leurs profils et devis
- Admins : Accès complet pour modération

## Authentification

### Supabase Auth
- **Inscription/Connexion** : Email + mot de passe
- **Rôles** : `user`, `repairer`, `admin`
- **Profils étendus** : Table `profiles` liée à `auth.users`

### Gestion des rôles
```typescript
// Hook personnalisé pour vérifier les permissions
const { user, role } = useAuth();
const isAdmin = role === 'admin';
const isRepairer = role === 'repairer';
```

## Fonctionnalités clés

### Géolocalisation et cartographie
- **OpenStreetMap** avec Leaflet
- **Géocodage** automatique via Nominatim
- **Recherche par proximité** avec calcul de distance

### Système de devis
1. Formulaire client avec diagnostic IA
2. Notification aux réparateurs ciblés
3. Comparaison des offres reçues
4. Conversion en rendez-vous

### IA et automatisation
- **Mistral/DeepSeek** : Classification et amélioration des données
- **Scraping automatisé** : Enrichissement de la base réparateurs
- **Diagnostic IA** : Aide au pré-diagnostic des pannes

### Modules premium
- **POS System** : Caisse enregistreuse intégrée
- **E-commerce** : Boutique en ligne pour réparateurs
- **Analytics** : Tableaux de bord avancés

## Edge Functions

### Functions principales
```typescript
// Exemple : Génération de devis automatique
supabase/functions/
├── ai-price-suggestion/    # Suggestions tarifaires IA
├── create-repairer-user/   # Création compte réparateur
├── scrape-repairers/       # Scraping données externes
└── send-notification/      # Notifications email/SMS
```

### Déploiement
```bash
# Déployer toutes les functions
supabase functions deploy

# Déployer une function spécifique
supabase functions deploy function-name
```

## APIs externes

### Services intégrés
- **Firecrawl** : Scraping web intelligent
- **Serper** : Recherche Google avancée
- **Mistral AI** : Classification et génération de contenu
- **Stripe** : Paiements et abonnements

### Configuration des secrets
```bash
# Ajouter des secrets Supabase
supabase secrets set MISTRAL_API_KEY=your_key
supabase secrets set STRIPE_KEY=your_stripe_key
```

## Performance et optimisation

### Optimisations frontend
- **Code splitting** : Chargement lazy des composants
- **Image optimization** : WebP avec fallbacks
- **Caching** : React Query pour les appels API
- **Bundle analysis** : Webpack Bundle Analyzer

### Optimisations backend
- **Indexes** : Sur les colonnes fréquemment interrogées
- **Pagination** : Limitation des résultats
- **Edge caching** : Cache des données statiques
- **Connection pooling** : Gestion optimisée des connexions DB

## Tests

### Framework de test
```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration

# Coverage
npm run test:coverage
```

### Structure des tests
```
src/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── components/
    └── Component/__tests__/
```

## Déploiement

### Production
```bash
# Build pour production
npm run build

# Preview du build
npm run preview

# Deploy sur Vercel
vercel --prod
```

### Variables de production
- URL de production Supabase
- Clés API des services externes
- Configuration CORS appropriée

## Monitoring et debugging

### Outils de monitoring
- **Supabase Dashboard** : Métriques base de données
- **Vercel Analytics** : Performance frontend
- **Sentry** : Tracking des erreurs (optionnel)

### Logging
```typescript
// Logging structuré avec niveaux
import { logger } from '@/utils/logger';

logger.info('User action', { userId, action });
logger.error('API call failed', { error, endpoint });
```

## Conformité et sécurité

### RGPD
- Consentement explicite pour les cookies
- Export/suppression des données utilisateur
- Pseudonymisation des données sensibles
- Audit trail des actions admin

### Sécurité
- **CSP** : Content Security Policy configurée
- **HTTPS** : Obligatoire en production
- **Rate limiting** : Protection contre les abus
- **Input validation** : Sanitization des entrées utilisateur

## Contribution

### Standards de code
- **ESLint** : Configuration TypeScript stricte
- **Prettier** : Formatage automatique
- **Husky** : Git hooks pour la qualité
- **Conventional Commits** : Messages de commit standardisés

### Workflow Git
1. Feature branch depuis `develop`
2. Pull Request avec review obligatoire
3. Tests automatisés sur CI
4. Merge après validation

---

**Contacts techniques** :
- Tech Lead : technique@repairconnect.fr
- DevOps : ops@repairconnect.fr
- Architecture : architecture@repairconnect.fr

**Version** : 2.1  
**Dernière mise à jour** : 7 janvier 2025
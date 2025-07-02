# RepairConnect - Documentation

## 🏗️ Architecture et Technologies

RepairConnect est une plateforme de mise en relation entre clients et réparateurs d'appareils électroniques, développée avec des technologies modernes.

### Technologies utilisées

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn/ui
- **Backend**: Supabase (Base de données, Auth, Storage, Edge Functions)
- **Cartes**: Leaflet + OpenStreetMap
- **État global**: Zustand
- **Requêtes**: TanStack Query (React Query)

## 📁 Structure du projet

```
src/
├── components/          # Composants React réutilisables
│   ├── ui/             # Composants de base (Shadcn/ui)
│   ├── admin/          # Composants administrateur
│   ├── scraping/       # Outils de scraping
│   └── ...
├── hooks/              # Hooks React personnalisés
├── pages/              # Pages principales
├── services/           # Services et logique métier
├── stores/             # État global (Zustand)
├── types/              # Types TypeScript
└── utils/              # Utilitaires

supabase/
├── functions/          # Edge Functions
└── migrations/         # Migrations base de données
```

## 🚀 Installation et développement

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase

### Installation
```bash
# Cloner le projet
git clone [URL_DU_REPO]
cd repairconnect

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

### Configuration Supabase
1. Créer un projet Supabase
2. Configurer les variables d'environnement
3. Appliquer les migrations : `supabase db push`
4. Déployer les Edge Functions : `supabase functions deploy`

## 🏃‍♂️ Guide de démarrage rapide

1. **Page d'accueil** : `/` - Point d'entrée principal
2. **Recherche** : `/search` - Recherche de réparateurs
3. **Espaces utilisateur** :
   - `/client` - Espace client
   - `/repairer` - Espace réparateur
   - `/admin` - Interface d'administration

## 📋 Fonctionnalités principales

### Pour les clients
- Recherche géolocalisée de réparateurs
- Comparaison de prix et services
- Système de rendez-vous et devis
- Avis et notations

### Pour les réparateurs
- Profil et catalogue de services
- Gestion des rendez-vous
- Statistiques et analytics
- Système d'abonnements (Gratuit, Basic, Premium, Enterprise)

### Pour les administrateurs
- Gestion des utilisateurs et réparateurs
- Modération des avis
- Analytics avancées
- Système de scraping automatisé

## 🔧 Configuration

### Mode démo
Le système inclut un mode démo pour les tests et démonstrations. Il est contrôlé par le feature flag `demo_mode_enabled` dans la table `feature_flags_by_plan`.

### Logging
Utilise le système de logging centralisé (`src/utils/logger.ts`) qui ne log qu'en mode développement.

## 📚 Guides détaillés

- [Guide d'installation](./installation.md)
- [Guide utilisateur](./user-guide.md)
- [Guide développeur](./developer-guide.md)
- [API Reference](./api-reference.md)
- [PRD (Product Requirements Document)](./PRD.md)

## 🐛 Debugging

### Outils disponibles
- Console logs (mode dev uniquement)
- React DevTools
- Supabase Dashboard pour la base de données
- Network requests monitoring

### Problèmes courants
1. **Erreur de hook invalide** : Vérifier que les hooks sont bien utilisés dans des composants React
2. **Problèmes d'authentification** : Vérifier les tokens Supabase
3. **Données manquantes** : Vérifier le mode démo et les permissions RLS

## 🔐 Sécurité

- Row Level Security (RLS) sur toutes les tables Supabase
- Authentification JWT via Supabase Auth
- Validation des données côté client et serveur
- Audit logs pour les actions administrateur

## 🚢 Déploiement

### Environnements
- **Développement** : Local avec Supabase local
- **Staging** : Supabase hosted + Vercel/Netlify
- **Production** : Supabase hosted + CDN

### Variables d'environnement requises
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les issues GitHub
3. Contacter l'équipe de développement

---

*Documentation mise à jour le : ${new Date().toLocaleDateString('fr-FR')}*